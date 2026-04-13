<script lang="ts">
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { add_toast } from '$lib/toast.svelte';
	import { app } from '../../app.svelte';
	import { create_task } from '../task.remote';
	let name = $state('');
	let bounty = $state(1);
	let done = $state(false);
	let creating = $state(false);
	let error = $state('');

	async function create() {
		if (!name.trim() || creating) return;

		error = '';
		creating = true;

		try {
			await create_task({
				relation_id: app().relation_id!,
				bounty,
				done,
				name: name.trim()
			});

			add_toast({ body: 'task created', state: true });
			await goto(resolve('/app/tasks'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'failed to create task';
		} finally {
			creating = false;
		}
	}
</script>

<div class="flex h-full flex-col p-4">
	<div class="mb-4 flex flex-row justify-between">
		<a href={resolve('/app/tasks')} class="btn btn-soft">back</a>
	</div>
	<div class="flex grow flex-col items-stretch p-4 pb-10">
		<h1 class="mb-2 text-2xl">new task</h1>

		title
		<input type="text" placeholder="name" class="input w-full" bind:value={name} />
		bounty
		<input type="number" placeholder="bounty" class="input w-full" bind:value={bounty} />

		<label class="label mt-2">
			already done?
			<input type="checkbox" bind:checked={done} class="checkbox" />
		</label>

		{#if error}
			<div class="mt-2 text-sm text-error">{error}</div>
		{/if}

		<button onclick={create} disabled={creating || !name.trim()} class="btn mt-2 btn-soft">
			{creating ? 'creating...' : 'create'}
		</button>
	</div>
</div>
