import { command, getRequestEvent, query } from "$app/server";
import { auth } from "$lib/auth.remote";
import { db } from "$lib/server/db";
import z from "zod";

export const edit_name = command(z.string(), async (name) => {
    const { locals: { auth_view } } = getRequestEvent()
    const ok = await db.edit_name(auth_view!.relation_id, auth_view!.role, name)
    if(ok) auth().refresh()
    return ok
})

export const puppyscore = query<number>(async () => {
    const { locals: { auth_view } } = getRequestEvent()
    return await db.get_puppyscore(auth_view!.relation_id) || 0
})
