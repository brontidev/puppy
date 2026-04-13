<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { app } from '../app.svelte';
	import TaskCard from './TaskCard.svelte';

	let init_error = $state('');

	onMount(() => {
		app()
			.ensureTasksLoaded()
			.catch((error) => {
				init_error = error instanceof Error ? error.message : 'failed to load tasks';
			});
	});

	const tasks = $derived(app().tasks);
	const loading = $derived(app().tasks_loading);
	const has_more = $derived(app().tasks_has_more);

	function observe_sentinel(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting) && !loading && has_more) {
					app().loadMoreTasks();
				}
			},
			{ rootMargin: '250px 0px' }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<div class="flex flex-row justify-between px-4 pt-4">
	<a href={resolve('/app')} class="btn btn-soft">back</a>
	{#if app().role == 'dom'}
		<a href={resolve('/app/tasks/new')} class="btn btn-soft">new</a>
	{/if}
</div>

<div class="flex flex-col gap-2 px-4 py-4">
	{#if init_error}
		<div class="py-2 text-center text-sm text-error">{init_error}</div>
	{/if}

	{#each tasks as item (item.id)}
		<TaskCard {item} />
	{/each}

	{#if loading}
		<div class="py-2 text-center text-sm opacity-70">loading...</div>
	{/if}

	{#if tasks.length === 0}
		<div class="py-2 text-center text-sm opacity-70">no tasks yet</div>
	{/if}

	{#if !has_more && tasks.length > 0}
		<div class="py-2 text-center text-xs opacity-60">end of list</div>
	{/if}

	<div use:observe_sentinel class="h-4 w-full"></div>
</div>
