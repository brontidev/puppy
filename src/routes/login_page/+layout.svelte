<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { AuthGuard } from 'svelte-firekit';
	import { get_app_version } from '$lib/version.remote';

	let { children } = $props();
	let app_version = $state('');

	onMount(async () => {
		app_version = await get_app_version();
	});
</script>

<AuthGuard requireAuth={false} onUnauthorized={() => goto(resolve('/app'))}>
	<div class="grid h-full grid-rows-[30%_70%] justify-center p-4">
		<div class="absolute top-4 right-4 text-xs opacity-50">v{app_version}</div>
		{#if page.route.id !== '/login_page'}<a
				href={resolve('/login_page')}
				class="btn absolute btn-soft">back</a
			>{/if}

		<div class="flex flex-col items-center justify-center text-6xl font-bold">
			<span>🐶</span>
			<span>puppy</span>
		</div>
		<div class="flex flex-col items-stretch justify-center gap-y-6">
			{@render children()}
		</div>
	</div>
</AuthGuard>
