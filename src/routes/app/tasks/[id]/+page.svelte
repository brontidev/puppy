<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import TaskCard from '../TaskCard.svelte';
	import type { Task } from '$lib/firestore-schema';
	import { firekitDoc } from 'svelte-firekit';
	import { app } from '../../app.svelte';
	import { goto } from '$app/navigation';
	import { add_toast } from '$lib/toast.svelte';
	import { mark_task } from '../task.remote';

	const task_id = $derived(page.params.id);

	let marking = $state(false);
	let error = $state('');


	let task_doc = firekitDoc<Task & { id: string }>(`relations/${app().relation_id}/tasks/${task_id}`)
	let task = $derived(task_doc.data ? { ...task_doc.data, id: task_doc.id }: null)
	const loading = $derived(task_doc.loading);

	$effect(() => {
		task_doc.setPath(`relations/${app().relation_id}/tasks/${task_id}`)
	})

	$effect(() => {
		error = '';
		if(!task_doc.loading && !task_doc.exists) {
			add_toast({ body: "Task not found", state: false })
			goto(resolve('/app/tasks'))
		}
	})


	async function mark(completed: boolean) {
		if (!task_doc.data || marking || task_doc.data.marked_at) return;

		marking = true
		await mark_task({
			mark: completed,
			relation_id: app().relation_id!,
			task_id: task_id!
		})
		marking = false
	}

	$inspect(task_doc.data)
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

		{#if app().role == 'dom'}
			{#if task_doc.data?.marked_at}
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
