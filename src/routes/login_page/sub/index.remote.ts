import { command } from "$app/server"
import { auth } from "$lib/auth.remote"
import { client_view, set_key } from "$lib/server/auth"
import { db } from "$lib/server/db"
import z from "zod"

export const join = command(z.object({ join_code: z.string(), name: z.string() }), async ({ join_code, name }) => {
    const res = await db.join_relation(join_code, name)
    if(!res) return false;
    const [id, relation] = res
    
    set_key(relation, 'sub')
    auth().set(client_view(relation, "sub", id))
    return true;
})
