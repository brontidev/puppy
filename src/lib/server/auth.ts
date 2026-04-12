import { getRequestEvent } from "$app/server";
import { db, schema } from "./db";

const COOKIE_NAME = "auth_key"
const COOKIE_OPTS: import('cookie').CookieSerializeOptions & { path: string } = {
    path: "/",
    httpOnly: true,
    maxAge: 31556952
}

export function set_key(relation: schema.Relation, role: schema.Role) {
    const ev = getRequestEvent()
    ev.cookies.set(
        COOKIE_NAME,
        `${role}${relation[`${role}_token`]}`,
        COOKIE_OPTS
    )
}

export function delete_key() {
    const ev = getRequestEvent()
    ev.cookies.delete(COOKIE_NAME, COOKIE_OPTS)
}

export async function validate_key(): Promise<App.AuthView | null> {
    const ev = getRequestEvent()
    const key = ev.cookies.get(COOKIE_NAME)
    if (!key) return null;
    const role = key.slice(0, 3) as schema.Role;
    const token = key.slice(3);
    const idAndRelation = await db.validate_token(role, token)
    return idAndRelation && { relation_id: idAndRelation[0], relation: idAndRelation[1], role }
}

export function client_view(relation: schema.Relation, role: schema.Role, id: string,): App.ClientAuthView {
    return {
        recon_code: relation[`${role}_recon_code`],
        role: role,
        relation: schema.client_relation.parse(relation),
        relation_id: id
    }
}