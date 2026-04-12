<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { get_auth_state } from '$lib/auth.svelte';

	const auth_state = get_auth_state();

	let { children } = $props();

	$effect(() => {
		if (!auth_state.auth.loading && auth_state.auth.current) goto(resolve('/app'));
	});
</script>

<div class="grid h-full grid-rows-[30%_70%] justify-center p-4">
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
