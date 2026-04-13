<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Task } from '$lib/firestore-schema';

	let { item }: { item: Task & { id: string } } = $props();

	const status = $derived.by(() => {
		if (!item.marked_at) {
			return { label: 'todo', classes: 'badge-ghost' };
		}

		if (item.mark === true) {
			return { label: 'completed', classes: 'badge-success' };
		}

		if (item.mark === false) {
			return { label: 'incompleted', classes: 'badge-error' };
		}

		return { label: 'marked', classes: 'badge-neutral' };
	});
</script>

<a href={resolve(`/app/tasks/[id]`, { id: item.id })} class="card bg-base-200 p-3">
	<div class="flex items-start justify-between gap-3">
		<div class="font-bold">{item.name}</div>
		<div class={['badge text-xs', status.classes]}>{status.label}</div>
	</div>

	<div
		class="text-sm opacity-70"
		class:text-success={item.bounty >= 0}
		class:text-error={item.bounty < 0}
	>
		{item.bounty}
	</div>

	<div class="mt-1 text-xs opacity-60">created: {new Date(item.created_at).toLocaleString()}</div>
	{#if item.marked_at}
		<div class="text-xs opacity-60">marked: {new Date(item.marked_at).toLocaleString()}</div>
	{/if}
</a>
