import { auth as auth_query, logout as logout_command, reconnect as reconnect_command } from '$lib/auth.remote';
import type { schema } from '$lib/server/db';
import { getContext, setContext } from 'svelte';

const AUTH_STATE_CONTEXT_KEY = Symbol('auth-state');

export class AuthState {
	auth = $derived(auth_query());

	async ensure_loaded() {
		await auth_query();
	}

	async reconnect(code: string, role: schema.Role) {
		return await reconnect_command({ code, role });
	}

	async logout() {
		await logout_command();
	}

	set_auth(next_auth: App.ClientAuthView | null) {
		auth_query().set(next_auth);
	}
}

export function init_auth_state_context() {
	const auth_state = new AuthState();
	setContext(AUTH_STATE_CONTEXT_KEY, auth_state);
	return auth_state;
}

export function get_auth_state() {
	return getContext<AuthState>(AUTH_STATE_CONTEXT_KEY);
}