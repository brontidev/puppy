<script lang="ts">
	import type { Relation, Role } from '$lib/schema';
	import { firekitMutations } from 'svelte-firekit';
	import { app } from './app.svelte';

	let close: HTMLFormElement;
	let name_key = $derived(`${app().role}_name`) as `${Role}_name`;
	// svelte-ignore state_referenced_locally
	let name = $state(app().relation.data?.[name_key] ?? '');

	function submit() {
		firekitMutations.update<Relation>(app().relation.ref!, {
			[name_key]: name
		});
		close.submit();
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
