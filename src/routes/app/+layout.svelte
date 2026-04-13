<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { add_toast } from '$lib/toast.svelte';
	import { AuthGuard, firekitAuth } from 'svelte-firekit';
	import EditNameModal from './EditNameModal.svelte';
	import { app } from './app.svelte';
	import { get_app_version } from '$lib/version.remote';

	app();

	let { children } = $props();

	let is_drawer_open = $state(false);
	let is_modal_open = $state(false);
	let edit_name_modal = $state<HTMLDialogElement>();

	let login_code = '<not implemented>';
	let join_code = $derived(app().relation.data?.join_code);
	let app_version = $state('');

	let role = $derived(app().role);
	let you_name = $derived(
		role === 'dom' ? app().relation.data?.dom_name : app().relation.data?.sub_name
	);
	let other_name = $derived(
		role === 'dom' ? app().relation.data?.sub_name : app().relation.data?.dom_name
	);

	onMount(async () => {
		app_version = await get_app_version();
	});

	async function copy_login_code() {
		navigator.clipboard.writeText(login_code!);
		add_toast({ body: 'copied login code!', state: true });
	}

	async function copy_join_code() {
		navigator.clipboard.writeText(join_code!);
		add_toast({ body: 'copied join code!', state: true });
	}

	async function do_logout() {
		firekitAuth.signOut();
		is_drawer_open = false;
	}

	$effect(() => {
		if (edit_name_modal) {
			edit_name_modal.open = is_modal_open;
		}
	});

	$effect(() => {
		edit_name_modal?.addEventListener('close', () => {
			is_modal_open = false;
		});
	});
</script>

<AuthGuard requireAuth={true} onUnauthorized={() => goto(resolve('/login_page'))}>
	<div class="drawer">
		<input
			id="menu-drawer"
			type="checkbox"
			class="drawer-toggle"
			hidden
			bind:checked={is_drawer_open}
		/>
		<div class="drawer-content bg-base-100">
			<div class="flex h-screen flex-col">
				<div class="flex flex-row items-center gap-x-4 bg-base-200 px-4 py-2 font-bold">
					<span>🐶</span>
					<span>puppy</span>
					<div class="grow"></div>
					<label for="menu-drawer" class="drawer-button btn btn-square btn-ghost btn-sm">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
					</label>
				</div>
				<div class="grow">
					{@render children()}
				</div>
			</div>
		</div>
		<div class="drawer-side">
			<label for="menu-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
			<div class="menu min-h-full w-80 bg-base-200 p-4">
				<div class="card bg-base-300 p-4">
					<div class="text-xs opacity-70">you</div>
					<div class="text-lg font-bold">{you_name || 'unnamed'}</div>
					<div class="mt-2 text-xs opacity-70">partner</div>
					<div class="text-lg font-bold">{other_name || '(not connected yet)'}</div>
					<div class="mt-2 text-xs opacity-70">role: {role}</div>
				</div>

				{#if role == 'dom' && join_code}
					<button onclick={copy_join_code} class="btn card h-20 bg-base-300 px-4 py-2 font-bold">
						<span class="text-xs">join code: </span>
						<code class="flex grow items-center justify-center">{join_code}</code>
					</button>
				{/if}

				<button onclick={copy_login_code} class="btn card h-20 bg-base-300 px-4 py-2 font-bold">
					<span class="text-xs">login code: </span>
					<code class="flex grow items-center justify-center">{login_code}</code>
				</button>
				<span class="text-center text-xs">tap to copy</span>

				<button onclick={() => (is_modal_open = true)} class="btn mt-2 btn-primary"
					>edit name</button
				>
				<button onclick={do_logout} class="btn mt-2 btn-outline btn-error">log out</button>
				<div class="mt-auto flex items-center justify-center pt-4">
					<span class="text-xs opacity-50">v{app_version}</span>
				</div>
			</div>
		</div>
	</div>

	<dialog bind:this={edit_name_modal} class="modal">
		<div class="modal-box">
			{#if is_modal_open}
				<EditNameModal />
			{/if}
		</div>
	</dialog>
</AuthGuard>
