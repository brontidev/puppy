<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { get_auth_state } from '$lib/auth.svelte';
	import { onMount } from 'svelte';

	const auth_state = get_auth_state();

	onMount(() => {
		void auth_state.ensure_loaded().then(() => {
			goto(auth_state.auth.current ? resolve('/app') : resolve('/login_page'));
		});
	});
</script>

<div class="flex h-screen items-center justify-center">loading...</div>
