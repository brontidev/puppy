<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { firekitUser } from 'svelte-firekit';

	$effect(() => {
		goto(firekitUser.isAuthenticated ? resolve('/app') : resolve('/login_page'));
	});
</script>

<div class="flex h-screen items-center justify-center">loading...</div>
