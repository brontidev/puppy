import { command, getRequestEvent, query } from "$app/server";
import z from "zod";
import { client_view, delete_key, set_key } from "./server/auth";
import { keys, kv, schema } from "./server/db";

export const auth = query<App.ClientAuthView | null>(() => {
    const auth = getRequestEvent().locals.auth_view
    if(!auth) return null;

    return client_view(auth.relation, auth.role, auth.relation_id)
})

export const logout = command(() => {
    delete_key()
    auth().set(null)
})

export const reconnect = command(z.object({ code: z.string(), role: schema.role }), async ({ code, role }) => {
    const relation_id = await kv.get<string>(keys[`relation_from_${role}_recon_code`](code))
    if(!relation_id.value) return false;
    const relation = await kv.get<schema.Relation>(keys.relation(relation_id.value));
    if(!relation.value) return false;

    set_key(relation.value, role)
    auth().set(client_view(relation.value, role, relation_id.value))
    return true;
})