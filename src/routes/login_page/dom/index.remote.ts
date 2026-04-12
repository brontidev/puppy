import { command } from "$app/server"
import { auth } from "$lib/auth.remote"
import { client_view, set_key } from "$lib/server/auth"
import { db } from "$lib/server/db"
import z from "zod"

export const create_relation = command(z.string(), async (name) => {
    const res = await db.create_relation(name)
    if(!res) return false;
    const [id, relation] = res
    
    set_key(relation, 'dom')
    auth().set(client_view(relation, "dom", id))
    return true;
})
