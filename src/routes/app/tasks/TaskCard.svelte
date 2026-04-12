<script lang="ts">
	import { resolve } from '$app/paths';
	import type { TaskRow } from './tasks.svelte';

	let { item }: { item: TaskRow } = $props();

	const status = $derived.by(() => {
		if (!item.task.marked_at) {
			return { label: 'todo', classes: 'badge-ghost' };
		}

		if (item.task.is_completed === true) {
			return { label: 'completed', classes: 'badge-success' };
		}

		if (item.task.is_completed === false) {
			return { label: 'incompleted', classes: 'badge-error' };
		}

		return { label: 'marked', classes: 'badge-neutral' };
	});
</script>

<a href={resolve(`/app/tasks/[id]`, { id: item.id })} class="card bg-base-200 p-3">
	<div class="flex items-start justify-between gap-3">
		<div class="font-bold">{item.task.name}</div>
		<div class={['badge text-xs', status.classes]}>{status.label}</div>
	</div>

	<div
		class="text-sm opacity-70"
		class:text-success={item.task.bounty >= 0}
		class:text-error={item.task.bounty < 0}
	>
		{item.task.bounty}
	</div>

	<div class="mt-1 text-xs opacity-60">created: {new Date(item.task.created_at).toLocaleString()}</div>
	{#if item.task.marked_at}
		<div class="text-xs opacity-60">marked: {new Date(item.task.marked_at).toLocaleString()}</div>
	{/if}
</a>