import { getToken, type Messaging, onMessage } from 'firebase/messaging';
import { firebaseService } from 'svelte-firekit';
import { store_fcm_token } from '../routes/app/notifications.remote';

let messaging: Messaging | null = null;
let onMessageUnsubscribe: (() => void) | null = null;

const ensureMessaging = async () => {
	if (messaging) return messaging;
	messaging = (await firebaseService.getMessagingInstance())!;
	return messaging;
};

export const initMessaging = async (relationId?: string) => {
	try {
		const messagingInstance = await ensureMessaging();
		const registration = await navigator.serviceWorker.ready;

		// Request permission
		const permission = await Notification.requestPermission();
		if (permission === 'granted') {
			// Get FCM token
			const token = await getToken(messagingInstance, {
				serviceWorkerRegistration: registration,
				vapidKey:
					'BHoAU8Oy2CL3cVyV6ztE9RX34xKl7VpV8PNpOJEIHt5Qd4_PtB7AzigpOJIDTqoCLO-r-bt2SMcZ9gQbrt8Nchw'
			});

			if (token && relationId) {
				// Store token in Firebase
				try {
					await store_fcm_token({ relation_id: relationId, fcm_token: token });
				} catch (error) {
					console.error('Failed to store FCM token:', error);
				}
				return token;
			}
		}
	} catch (error) {
		console.error('Failed to initialize messaging:', error);
	}
	return null;
};

export const listenForMessages = async () => {
	const messagingInstance = await ensureMessaging();

	onMessageUnsubscribe?.();
	onMessageUnsubscribe = onMessage(messagingInstance, (payload) => {
		console.log('foreground fcm payload', payload);
		const notificationTitle = payload.data?.title || payload.notification?.title || 'puppy';
		const notificationOptions = {
			body: payload.data?.body || payload.notification?.body,
			icon: '/image.png',
			badge: '/image.png'
		};

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.ready.then((registration) => {
				registration.showNotification(notificationTitle, notificationOptions);
			});
		}
	});
};
