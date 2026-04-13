<script lang="ts">
	import { resolve } from '$app/paths';
	import { app } from './app.svelte';
	import TaskCard from './tasks/TaskCard.svelte';

	let relation_loading = $derived(app().relation.loading);
	let puppyscore = $derived(app().relation.data?.puppyscore)

	const tasks = $derived(
		app().recent_tasks
			.filter((task) => app().role == 'dom' || !task.marked_at)
			.slice(0, 6)
	);
	const tasks_loading = $derived(app().new_tasks.loading);

</script>

<div class="flex h-full flex-col gap-y-4 p-4">
	<div class="card h-fit bg-base-300 p-4 pb-10">
		<h1 class="opacity-60">puppyscore™</h1>
		<div class="flex min-h-32 flex-row items-center justify-center">
			{#if relation_loading}
				<div class="text-sm opacity-70">loading score...</div>
			{:else}
			<div
				class={[
					'card flex size-30 items-center justify-center rounded-full text-4xl',
					puppyscore == 0 && 'bg-neutral text-neutral-content',
					puppyscore > 0 && 'bg-success text-success-content',
					puppyscore < 0 && 'bg-error text-error-content'
				]}
			>
				{puppyscore}
			</div>
			{/if}
		</div>
	</div>
	<div class="card grow bg-base-300 p-4 pb-10">
		<div class="flex items-center justify-between gap-4">
			<h1 class="opacity-60">tasks</h1>
			<a href={resolve('/app/tasks')} class="btn btn-soft btn-sm">view all</a>
		</div>

		<div class="mt-3 flex flex-col gap-2">
			{#if tasks_loading}
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
