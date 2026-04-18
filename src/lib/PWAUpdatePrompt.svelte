<script lang="ts">
	import { onMount } from 'svelte';

	let showUpdatePrompt = $state(false);
	let registration: ServiceWorkerRegistration | null = null;
	let applying = $state(false);

	onMount(() => {
		if (!('serviceWorker' in navigator)) return;

		let refreshing = false;
		let updateInterval: ReturnType<typeof setInterval> | null = null;

		const handleControllerChange = () => {
			if (refreshing) return;
			refreshing = true;
			window.location.reload();
		};

		navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

		const wireRegistration = (reg: ServiceWorkerRegistration) => {
			registration = reg;
			if (registration.waiting) {
				showUpdatePrompt = true;
			}

			registration.addEventListener('updatefound', () => {
				const worker = registration?.installing;
				if (!worker) return;

				worker.addEventListener('statechange', () => {
					if (worker.state === 'installed' && navigator.serviceWorker.controller) {
						showUpdatePrompt = true;
					}
				});
			});
		};

		// SvelteKit registers src/service-worker.ts automatically in production.
		// We only need to wire into the existing registration here.
		navigator.serviceWorker
			.getRegistration()
			.then((reg) => {
				if (!reg) return;
				wireRegistration(reg);

				updateInterval = setInterval(() => {
					void reg.update();
				}, 30000);
			})
			.catch((error) => {
				console.error('Failed to read service worker registration:', error);
			});

		void navigator.serviceWorker.ready.then(wireRegistration);

		return () => {
			navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
			if (updateInterval) {
				clearInterval(updateInterval);
			}
		};
	});

	const handleApplyUpdate = async () => {
		if (!registration) return;
		applying = true;

		if (!registration.waiting) {
			await registration.update();
		}

		registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
	};

	const handleLater = () => {
		showUpdatePrompt = false;
	};
</script>

{#if showUpdatePrompt}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="alert">
		<div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
			<h2 class="mb-2 text-2xl font-bold">update available</h2>
			<p class="mb-6 text-gray-600">
				a new version of the puppy app is ready. please be a good puppy and update it
			</p>
			<div class="flex gap-3">
				<button
					class="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300"
					onclick={handleLater}
					disabled={applying}
				>
					later
				</button>
				<button
					class="flex-1 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
					onclick={handleApplyUpdate}
					disabled={applying}
				>
					{applying ? 'applying...' : 'update now'}
				</button>
			</div>
		</div>
	</div>
{/if}
