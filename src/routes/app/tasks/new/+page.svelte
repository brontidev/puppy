<script>
	import { resolve } from '$app/paths';
	import { create_task } from '../tasks.remote';
	let name = $state('');
	let bounty = $state(1);
	let done = $state(false);

	function create() {
		create_task({
            bounty,
            done,
            name
        });
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

		<button onclick={create} class="btn mt-2 btn-soft">create</button>
	</div>
</div>
