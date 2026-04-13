<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { AuthGuard } from 'svelte-firekit';
	import { APP_VERSION } from '$lib/version';

	let { children } = $props();
</script>

<AuthGuard requireAuth={false} onUnauthorized={() => goto(resolve('/app'))}>
	<div class="grid h-full grid-rows-[30%_70%] justify-center p-4">
		<div class="absolute right-4 top-4 text-xs opacity-50">v{APP_VERSION}</div>
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
