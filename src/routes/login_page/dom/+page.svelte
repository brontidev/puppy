<script>
	import { get_auth_state } from '$lib/auth.svelte';
	import { create_relation } from './index.remote';
	import Button from '../Button.svelte';

	const auth_state = get_auth_state();

	let name = $state('');

	async function create_new() {
		await create_relation(name);
	}

	let recon_code = $state('');
	async function recon() {
		await auth_state.reconnect(recon_code, 'dom');
	}
</script>

<h1 class="font-bold text-2xl">dom</h1>

<input type="text" placeholder="name" bind:value={name} class="input input-xl" />
<Button title="create new" onclick={create_new}></Button>

<div class="divider">or</div>

<input type="text" placeholder="login code" bind:value={recon_code} class="input input-xl" />
<Button title="login" onclick={recon}></Button>
