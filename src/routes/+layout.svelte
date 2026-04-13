<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import PWAInstallPrompt from '$lib/PWAInstallPrompt.svelte';

	let { children } = $props();

	import { onNavigate } from '$app/navigation';
	import { get_toasts, remove_toast } from '$lib/toast.svelte';
	import { FirebaseApp } from 'svelte-firekit';
	import { firebaseConfig } from '$lib/firebase';

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

</script>

<PWAInstallPrompt />

<div class="toast toast-center z-99">
	{#each get_toasts() as [toast, id], i (id)}
		<div class="alert alert-soft {toast.state ? 'alert-success' : 'alert-error'} ">
			<span>{toast.body}</span>
			<button onclick={() => remove_toast(i)} class="btn btn-soft btn-sm">x</button>
		</div>
	{/each}
</div>


<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<FirebaseApp config={firebaseConfig}>
	{@render children()}
</FirebaseApp>