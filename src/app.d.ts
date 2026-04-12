// See https://svelte.dev/docs/kit/types#app.d.ts

import type { schema } from "$lib/server/db";


// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth_view: AuthView | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		type AuthView = { relation_id: string, relation: schema.Relation, role: schema.Role }
		type ClientAuthView = { relation_id: string, relation: schema.ClientRelation, role: schema.Role, recon_code: string }
	}
}

export { };
