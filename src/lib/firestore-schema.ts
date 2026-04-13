import z from "zod"

export type Relation = {
    join_code: string | null,
    dom_name: string,
    sub_name: string,
    puppyscore: number,
    sub_fcm_token?: string
}

export type RelationKeys = {
    dom_login_code: string,
    sub_login_code: string
}

export type Task = {
    name: string,
    bounty: number,

    created_at: Date
} & (
        {
            marked_at: null,
            mark: null
        } | {
            marked_at: Date,
            mark: boolean
        }
    )


export const role = z.enum(['dom', 'sub'])
export type Role = z.infer<typeof role>