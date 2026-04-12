<script lang="ts">
	import { resolve } from '$app/paths';
	import { get_app_state } from '../app.svelte';
	import TaskCard from './TaskCard.svelte';

	const app_state = get_app_state();

	const PAGE_SIZE = 20;
	const tasks = $derived(app_state.tasks);
	const loading = $derived(app_state.tasks_loading);
	const has_more = $derived(app_state.tasks_has_more);
	const did_initial_load = $derived(app_state.tasks_did_initial_load);

	async function load_more() {
		await app_state.load_more_tasks(PAGE_SIZE);
	}

	function observe_sentinel(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					void load_more();
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

	$effect(() => {
		if (!did_initial_load) {
			void app_state.ensure_tasks_loaded(PAGE_SIZE);
		}
	});
</script>

<div class="flex flex-row justify-between px-4 pt-4">
	<a href={resolve('/app')} class="btn btn-soft">back</a>
	{#if app_state.auth.current?.role == 'dom'}
		<a href={resolve('/app/tasks/new')} class="btn btn-soft">new</a>
	{/if}
</div>

<div class="flex flex-col gap-2 px-4 py-4">
	{#each tasks as item (item.id)}
		<TaskCard {item} />
	{/each}

	{#if loading}
		<div class="py-2 text-center text-sm opacity-70">loading...</div>
	{/if}

	{#if did_initial_load && tasks.length === 0}
		<div class="py-2 text-center text-sm opacity-70">no tasks yet</div>
	{/if}

	{#if !has_more && tasks.length > 0}
		<div class="py-2 text-center text-xs opacity-60">end of list</div>
	{/if}

	<div use:observe_sentinel class="h-4 w-full"></div>
</div>
