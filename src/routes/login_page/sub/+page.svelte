<script>
	import { join_relation, login } from '$lib/auth.remote';
	import { add_toast } from '$lib/toast.svelte';
	import { firekitAuth } from 'svelte-firekit';
	import Button from '../Button.svelte';

	let join_code = $state('');
	let name = $state('');

	async function join_btn() {
		const token = await join_relation({ join_code, name });
		if (!token) return add_toast({ body: 'Partner not found', state: false });
		firekitAuth.signInWithCustomToken(token);
	}

	let login_code = $state('');
	async function on_login() {
		const token = await login({ login_code, role: 'sub' });
		if (!token) return add_toast({ body: 'Login code not found!', state: false });
		firekitAuth.signInWithCustomToken(token);
	}
</script>

<h1 class="text-2xl font-bold">sub</h1>

<input type="text" placeholder="name" bind:value={name} class="input input-xl" />
<input type="text" placeholder="invite code" bind:value={join_code} class="input input-xl" />
<Button title="join" onclick={join_btn}></Button>

<div class="divider">or</div>

<input type="text" placeholder="login code" bind:value={login_code} class="input input-xl" />
<Button title="login" onclick={on_login}></Button>
