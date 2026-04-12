import { command, getRequestEvent, query } from '$app/server'
import z from 'zod'
import { db } from '$lib/server/db'

const list_tasks_input = z.object({
	before_id: z.string().nullable().optional(),
	limit: z.number().int().min(1).max(50).default(20)
})

export const list_tasks = command(list_tasks_input, async ({ before_id, limit }) => {
	const auth = getRequestEvent().locals.auth_view
	if (!auth) return null

	return db.list_tasks(auth.relation_id, { before_id: before_id ?? null, limit })
})

export const get_task = query(z.object({ id: z.string() }), async ({ id }) => {
	const auth = getRequestEvent().locals.auth_view
	if (!auth) return null

	return db.get_task(auth.relation_id, id)
})

export const create_task = command(z.object({ name: z.string(), bounty: z.number(), done: z.boolean() }), ({ name, bounty, done }) => {
	const { locals: { auth_view } } = getRequestEvent()
	if (auth_view?.role == 'dom') db.create_task(auth_view?.relation_id!, name, bounty, done)
})

export const mark_task = command(z.object({ id: z.string(), completed: z.boolean() }), async ({ id, completed }) => {
	const auth = getRequestEvent().locals.auth_view
	if (auth?.role != 'dom') return false

	return await db.mark_task(auth.relation_id, id, completed)
})