import { getContext, setContext } from 'svelte';
import type { AuthState } from '$lib/auth.svelte';
import type { schema } from '$lib/server/db';
import { get_task, list_tasks, mark_task } from './tasks/tasks.remote';

const APP_STATE_CONTEXT_KEY = Symbol('app-state');

export type TaskRow = {
	id: string;
	task: schema.Task;
};

export type RealtimePatch = {
	auth?: App.ClientAuthView | null;
	tasks?: TaskRow[];
	upsert_task?: TaskRow;
	remove_task_id?: string;
};

export type RealtimeSource = {
	connect: (
		apply_patch: (patch: RealtimePatch) => void
	) => void | (() => void | Promise<void>) | Promise<void | (() => void | Promise<void>)>;
};

export class AppState {
	constructor(private auth_state: AuthState) {}

	get auth() {
		return this.auth_state.auth;
	}

	tasks = $state<TaskRow[]>([]);
	tasks_loading = $state(false);
	tasks_has_more = $state(true);
	tasks_next_before_id = $state<string | null>(null);
	tasks_did_initial_load = $state(false);

	private realtime_cleanup: (() => void | Promise<void>) | null = null;

	private dedupe_tasks(items: TaskRow[]): TaskRow[] {
		const seen = new Set<string>();
		const out: TaskRow[] = [];

		for (const item of items) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			out.push(item);
		}

		return out;
	}

	reset_tasks() {
		this.tasks = [];
		this.tasks_loading = false;
		this.tasks_has_more = true;
		this.tasks_next_before_id = null;
		this.tasks_did_initial_load = false;
	}

	async logout() {
		await this.auth_state.logout();
		this.reset_tasks();
	}

	async load_more_tasks(limit = 20) {
		if (this.tasks_loading || !this.tasks_has_more) return;

		this.tasks_loading = true;
		const page = await list_tasks({ before_id: this.tasks_next_before_id, limit });
		this.tasks_loading = false;

		if (!page) {
			this.tasks_has_more = false;
			return;
		}

		this.tasks = this.dedupe_tasks([...this.tasks, ...page.items]);
		this.tasks_has_more = page.has_more;
		this.tasks_next_before_id = page.next_before_id;
		this.tasks_did_initial_load = true;
	}

	async ensure_tasks_loaded(limit = 20) {
		if (this.tasks_did_initial_load || this.tasks_loading || !this.tasks_has_more) return;
		await this.load_more_tasks(limit);
	}

	replace_tasks(rows: TaskRow[]) {
		this.tasks = this.dedupe_tasks(rows);
		this.tasks_did_initial_load = true;
	}

	upsert_task(row: TaskRow) {
		this.tasks = this.dedupe_tasks([row, ...this.tasks]);
		this.tasks_did_initial_load = true;
	}

	remove_task(task_id: string) {
		this.tasks = this.tasks.filter((item) => item.id !== task_id);
	}

	async load_task(id: string) {
		const cached = this.tasks.find((item) => item.id === id);
		if (cached) return cached;

		const row = await get_task({ id });
		if (!row) return null;

		this.upsert_task(row);
		return row;
	}

	async mark_task(id: string, completed: boolean) {
		const ok = await mark_task({ id, completed });
		if (!ok) return false;

		const row = this.tasks.find((item) => item.id === id);
		if (row) {
			this.upsert_task({
				...row,
				task: {
					...row.task,
					is_completed: completed,
					marked_at: new Date()
				}
			});
		}

		return true;
	}

	apply_realtime_patch(patch: RealtimePatch) {
		if ('auth' in patch) {
			this.auth_state.set_auth(patch.auth ?? null);
		}

		if (patch.tasks) {
			this.replace_tasks(patch.tasks);
		}

		if (patch.upsert_task) {
			this.upsert_task(patch.upsert_task);
		}

		if (patch.remove_task_id) {
			this.remove_task(patch.remove_task_id);
		}
	}

	async connect_realtime(source: RealtimeSource, initial_task_limit = 20) {
		await this.auth_state.ensure_loaded();
		await this.ensure_tasks_loaded(initial_task_limit);

		await this.disconnect_realtime();
		const cleanup = await source.connect((patch) => {
			this.apply_realtime_patch(patch);
		});

		this.realtime_cleanup = typeof cleanup === 'function' ? cleanup : null;
	}

	async disconnect_realtime() {
		if (!this.realtime_cleanup) return;
		await this.realtime_cleanup();
		this.realtime_cleanup = null;
	}
}

export function init_app_state_context(auth_state: AuthState) {
	const app_state = new AppState(auth_state);
	setContext(APP_STATE_CONTEXT_KEY, app_state);
	return app_state;
}

export function get_app_state() {
	return getContext<AppState>(APP_STATE_CONTEXT_KEY);
}