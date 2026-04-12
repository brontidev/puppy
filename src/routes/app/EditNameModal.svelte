<script lang="ts">
	import { get_app_state } from './app.svelte';
	import { edit_name } from './app.remote';

	const app_state = get_app_state();

    let close: HTMLFormElement
	let name = $state(app_state.auth.current?.relation[`${app_state.auth.current!.role}_name`] ?? '');

    function submit() {
        edit_name(name)
        close.submit()
    }
</script>

<h3 class="text-lg font-bold">edit name</h3>

<input type="text" placeholder="name" class="input" bind:value={name} />

<div class="modal-action">
	<form bind:this={close} method="dialog">
		<button class="btn"> cancel </button>
	</form>
	<button onclick={submit} class="btn btn-primary"> edit </button>
</div>
