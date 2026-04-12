import z from "zod"
import { openKv, type KvKey } from "@deno/kv"
import * as schema from "$lib/schema"
import { generate_join_code, generate_recon_code, generate_token } from "./id"
import { ulid } from "@std/ulid"


export const kv = await openKv("http://0.0.0.0:4512")


/*
indexes

['r', relation id] -> relation

['j', join code] -> relation id
['s', sub token] -> relation id
['d', dom token] -> relation id

['sr', sub login code] -> relation id
['sd', dom login code] -> relation id

['r', relation id, 't', task id] -> task
['r', relation id, '_t'] -> most recent task id

['r', relation id, 's'] -> puppyscore
*/

type Keys = Record<string, (...args: any[]) => KvKey>

export const keys = {
    relation(relation_id: string) {
        return ['r', relation_id] as const
    },
    relation_from_join_code(join_code: string) {
        return ['j', join_code] as const
    },
    relation_from_sub_token(token: string) {
        return ['s', token] as const
    },
    relation_from_dom_token(token: string) {
        return ['d', token] as const
    },
    relation_from_sub_recon_code(recon_code: string) {
        return ['sr', recon_code] as const
    },
    relation_from_dom_recon_code(recon_code: string) {
        return ['dr', recon_code] as const
    },

    task(relation_id: string, task_id: string) {
        return [...this.relation(relation_id), 't', task_id] as const
    },
    task_prefix(relation_id: string) {
        return [...this.relation(relation_id), 't'] as const
    },
    task_index(relation_id: string) {
        return [...this.relation(relation_id), '_t'] as const
    },

    puppyscore(relation_id: string) {
        return ['r', relation_id, 's'] as const
    },
} satisfies Keys

export const db = {
    async create_relation(dom_name: string): Promise<[id: string, schema.Relation] | null> {
        const id = crypto.randomUUID()
        const join_code = generate_join_code()

        const dom_token = generate_token()
        const dom_recon_code = generate_recon_code()

        const sub_token = generate_token()
        const sub_recon_code = generate_recon_code()


        const relation = schema.typed<typeof schema.relation>({
            join_code,
            dom_name,
            dom_recon_code,
            dom_token,

            sub_name: "",
            sub_recon_code,
            sub_token
        })

        const res = await kv.atomic()
            .set(keys.relation(id), relation)
            .set(keys.relation_from_join_code(join_code), id)
            .set(keys.relation_from_dom_token(dom_token), id)
            .set(keys.relation_from_sub_token(sub_token), id)
            .set(keys.relation_from_dom_recon_code(dom_recon_code), id)
            .set(keys.relation_from_sub_recon_code(sub_recon_code), id)
            .set(keys.puppyscore(id), 0)
            .commit();

        if (res.ok) return [id, relation]
        return null
    },
    async join_relation(join_code: string, sub_name: string): Promise<[id: string, schema.Relation] | null> {
        // no need to check for join-ability here because we delete the join code anyway

        const relation_id_res = await kv.get<string>(keys.relation_from_join_code(join_code));
        if (!relation_id_res.versionstamp) return null
        const id = relation_id_res.value
        const relation_res = await kv.get<schema.Relation>(keys.relation(id))
        if (!relation_res.versionstamp) return null


        const relation: schema.Relation = {
            ...relation_res.value,
            sub_name,
            join_code: null,
        }

        const res = await kv.atomic()
            .check(relation_id_res, relation_res)
            .set(keys.relation(id), relation)
            .delete(keys.relation_from_join_code(join_code))
            .commit()

        if (res.ok) return [id, relation]
        return null
    },
    async validate_token(role: schema.Role, token: string): Promise<[id: string, schema.Relation] | null> {
        const relation_id_res = await kv.get<string>(role === 'dom' ? keys.relation_from_dom_token(token) : keys.relation_from_sub_token(token))
        if (!relation_id_res.versionstamp) return null;
        const id = relation_id_res.value
        const relation_res = await kv.get<schema.Relation>(keys.relation(id))
        return relation_res.value && [id, relation_res.value]
    },
    async edit_name(relation_id: string, role: schema.Role, name: string): Promise<boolean> {
        const relation_res = await kv.get<schema.Relation>(keys.relation(relation_id))
        if (!relation_res.versionstamp) return false

        const relation: schema.Relation = {
            ...relation_res.value,
            [`${role}_name`]: name,
        }

        const res = await kv.atomic()
            .check(relation_res)
            .set(relation_res.key, relation)
            .commit()

        return res.ok
    },
    async get_puppyscore(relation_id: string): Promise<number | null> {
        const puppyscore_res = kv.get<number>(keys.puppyscore(relation_id))
        return (await puppyscore_res).value
    },

    async create_task(relation_id: string, name: string, bounty: number, done: boolean) {
        const id = ulid()
        const task = schema.typed<typeof schema.task>({
            bounty,
            name,
            created_at: new Date(),
            marked_at: done ? new Date() : null,
            is_completed: done ? true : null
        })

        const tx = kv.atomic()
            .set(keys.task(relation_id, id), task)
            .set(keys.task_index(relation_id), id)

        if (done) {
            const puppyscore = await db.get_puppyscore(relation_id) ?? 0
            tx.set(keys.puppyscore(relation_id), puppyscore + bounty)
        }

        const res = await tx.commit()

        return res.ok ? [id, task] as const : null
    },
    async list_tasks(
        relation_id: string,
        { before_id, limit }: { before_id?: string | null, limit: number }
    ): Promise<{ items: Array<{ id: string, task: schema.Task }>, has_more: boolean, next_before_id: string | null }> {
        const selector = before_id
            ? { prefix: keys.task_prefix(relation_id), end: keys.task(relation_id, before_id) }
            : { prefix: keys.task_prefix(relation_id) }

        const iter = kv.list<schema.Task>(selector, {
            reverse: true,
            limit: limit + 1,
        })

        const rows: Array<{ id: string, task: schema.Task }> = []
        for await (const entry of iter) {
            rows.push({
                id: String(entry.key[3]),
                task: entry.value,
            })
        }

        const has_more = rows.length > limit
        const items = has_more ? rows.slice(0, limit) : rows
        const last = items.at(-1)

        return {
            items,
            has_more,
            next_before_id: has_more && last ? last.id : null,
        }
    },
    async get_task(relation_id: string, task_id: string): Promise<{ id: string, task: schema.Task } | null> {
        const task_res = await kv.get<schema.Task>(keys.task(relation_id, task_id))
        if (!task_res.value) return null

        return {
            id: task_id,
            task: task_res.value,
        }
    },
    async mark_task(relation_id: string, task_id: string, completed: boolean): Promise<boolean> {
        const task_res = await kv.get<schema.Task>(keys.task(relation_id, task_id))
        if (!task_res.value) return false
        const task = task_res.value
        if (task.marked_at) return false
        const puppyscore_res = await kv.get<number>(keys.puppyscore(relation_id))
        const puppyscore = puppyscore_res.value ?? 0

        const tx = kv.atomic()
            .check(task_res, puppyscore_res)
            .set(keys.puppyscore(relation_id), puppyscore + (task.bounty * (completed ? 1 : -1)))
            .set(keys.task(relation_id, task_id), {
                ...task,
                is_completed: completed,
                marked_at: new Date()
            } satisfies schema.Task)

        return (await tx.commit()).ok
    }
}

export * as schema from "$lib/schema"