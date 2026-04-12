<script>
	import { get_auth_state } from '$lib/auth.svelte';
	import { join } from './index.remote';
	import Button from '../Button.svelte';

	const auth_state = get_auth_state();

	let join_code = $state('');
	let name = $state('');

	async function join_btn() {
		await join({ join_code, name });
	}

	let recon_code = $state('');
	async function recon() {
		await auth_state.reconnect(recon_code, 'sub');
	}
</script>

<h1 class="text-2xl font-bold">sub</h1>

<input type="text" placeholder="name" bind:value={name} class="input input-xl" />
<input type="text" placeholder="invite code" bind:value={join_code} class="input input-xl" />
<Button title="join" onclick={join_btn}></Button>

<div class="divider">or</div>

<input type="text" placeholder="login code" bind:value={recon_code} class="input input-xl" />
<Button title="login" onclick={recon}></Button>
