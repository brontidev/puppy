<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { get_app_state } from '../../app.svelte';
	import TaskCard from '../TaskCard.svelte';
	import type { TaskRow } from '../tasks.svelte';

	const app_state = get_app_state();

	const task_id = $derived(page.params.id);

	let task = $state<TaskRow | null>(null);
	let loading = $state(true);
	let marking = $state(false);
	let error = $state('');

	async function load_task(id: string) {
		loading = true;
		error = '';

		const fetched = await app_state.load_task(id);
		if (!fetched) {
			task = null;
			error = 'task not found';
			loading = false;
			return;
		}

		task = fetched;
		loading = false;
	}

	async function mark(completed: boolean) {
		if (!task || marking || task.task.marked_at) return;

		marking = true;
		error = '';

		const ok = await app_state.mark_task(task.id, completed);
		marking = false;

		if (!ok) {
			error = 'unable to mark task';
			return;
		}

		const updated: TaskRow = {
			...task,
			task: {
				...task.task,
				is_completed: completed,
				marked_at: new Date()
			}
		};

		app_state.upsert_task(updated);
		task = updated;
	}

	$effect(() => {
		if (task_id) {
			void load_task(task_id);
		}
	});
</script>

<div class="flex flex-row justify-between px-4 pt-4">
	<a href={resolve('/app/tasks')} class="btn btn-soft">back</a>
</div>

<div class="flex flex-col gap-3 px-4 py-4">
	{#if loading}
		<div class="text-sm opacity-70">loading task...</div>
	{:else if !task}
		<div class="text-sm text-error">{error || 'task not found'}</div>
	{:else}
		<TaskCard item={task} />

		{#if error}
			<div class="text-sm text-error">{error}</div>
		{/if}

		{#if app_state.auth.current?.role == 'dom'}
			{#if task.task.marked_at}
				<div class="card bg-base-200 p-3 text-sm opacity-80">
					this task has already been marked.
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
					<button class="btn btn-success" disabled={marking} onclick={() => mark(true)}>
						{marking ? 'marking...' : 'mark completed'}
					</button>
					<button class="btn btn-error" disabled={marking} onclick={() => mark(false)}>
						{marking ? 'marking...' : 'mark incompleted'}
					</button>
				</div>
			{/if}
		{/if}
	{/if}
</div>
