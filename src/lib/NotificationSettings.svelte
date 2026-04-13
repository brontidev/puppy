<script lang="ts">
	import { add_toast } from '$lib/toast.svelte';
	import { toggle_notifications } from '../routes/app/notifications.remote';

	interface Props {
		enabled?: boolean;
		fcmToken?: string;
	}

	let { enabled = false, fcmToken = '' }: Props = $props();
	let isLoading = $state(false);

	const handleToggle = async () => {
		if (!fcmToken) {
			add_toast({ body: 'Notifications not available on this device', state: false });
			return;
		}

		isLoading = true;
		try {
			await toggle_notifications({ fcm_token: fcmToken, enabled: !enabled });
			enabled = !enabled;
			const status = enabled ? 'enabled' : 'disabled';
			add_toast({ body: `Notifications ${status}! 🔔`, state: true });
		} catch (error) {
			add_toast({
				body: error instanceof Error ? error.message : 'Failed to update settings',
				state: false
			});
		} finally {
			isLoading = false;
		}
	};
</script>

<div class="card bg-base-300 p-4">
	<div class="flex items-center justify-between">
		<div>
			<div class="text-sm font-semibold">Push Notifications</div>
			<div class="text-xs opacity-70">Get alerts for new tasks</div>
		</div>
		<input
			type="checkbox"
			class="toggle toggle-sm"
			checked={enabled}
			onchange={handleToggle}
			disabled={isLoading || !fcmToken}
		/>
	</div>
	{#if !fcmToken}
		<div class="mt-2 text-xs text-warning">Grant notification permission in browser settings</div>
	{/if}
</div>
