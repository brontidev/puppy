<script>
	import { create_relation, login } from '$lib/auth.remote';
	import { firekitAuth } from 'svelte-firekit';
	import Button from '../Button.svelte';
	import { add_toast } from '$lib/toast.svelte';

	let name = $state('');

	async function on_create() {
		const token = await create_relation(name)
		firekitAuth.signInWithCustomToken(token)
	}

	let login_code = $state('');
	async function on_login() {
		const token = await login({ login_code, role: "dom" })
		if(!token) return add_toast({ body: "Login code not found!", state: false })
		firekitAuth.signInWithCustomToken(token)
	}
</script>

<h1 class="font-bold text-2xl">dom</h1>

<input type="text" placeholder="name" bind:value={name} class="input input-xl" />
<Button title="create new" onclick={on_create}></Button>

<div class="divider">or</div>

<input type="text" placeholder="login code" bind:value={login_code} class="input input-xl" />
<Button title="login" onclick={on_login}></Button>
