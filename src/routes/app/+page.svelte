<script lang="ts">
	import { resolve } from '$app/paths';
	import { get_app_state } from './app.svelte';
	import { onMount } from 'svelte';
	import TaskCard from './tasks/TaskCard.svelte';
	import { puppyscore } from './app.remote';

	const app_state = get_app_state();

	const tasks = $derived(
		app_state.tasks
			.filter((task) => app_state.auth.current?.role == 'dom' || !task.task.marked_at)
			.slice(0, 6)
	);

	onMount(() => {
		void app_state.ensure_tasks_loaded(6);
	});
</script>

<div class="flex h-full flex-col gap-y-4 p-4">
	<div class="card h-fit bg-base-300 p-4 pb-10">
		<h1 class="opacity-60">puppyscore™</h1>
		<div class="flex flex-row items-center justify-center">
			<div
				class={[
					'card flex size-30 items-center justify-center rounded-full text-4xl',
					(await puppyscore()) == 0 && 'bg-neutral text-neutral-content',
					(await puppyscore()) > 0 && 'bg-success text-success-content',
					(await puppyscore()) < 0 && 'bg-error text-error-content'
				]}
			>
				{await puppyscore()}
			</div>
		</div>
	</div>
	<div class="card grow bg-base-300 p-4 pb-10">
		<div class="flex items-center justify-between gap-4">
			<h1 class="opacity-60">tasks</h1>
			<a href={resolve('/app/tasks')} class="btn btn-soft btn-sm">view all</a>
		</div>

		<div class="mt-3 flex flex-col gap-2">
			{#if !app_state.tasks_did_initial_load && app_state.tasks_loading}
				<div class="py-2 text-sm opacity-70">loading tasks...</div>
			{:else if tasks.length === 0}
				<div class="py-2 text-sm opacity-70">no uncompleted tasks</div>
			{:else}
				{#each tasks as item (item.id)}
					<TaskCard {item} />
				{/each}
			{/if}
		</div>
	</div>
</div>
