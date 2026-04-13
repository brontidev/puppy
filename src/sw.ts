/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching';

console.log('defined sw');

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

// Handle push notifications
self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();
		const options: NotificationOptions = {
			body: data.body,
			icon: '/image.png',
			badge: '/image.png',
			tag: 'task-notification',
			requireInteraction: true,
			data: data.data || {}
		};

		event.waitUntil(self.registration.showNotification(data.title || 'puppy', options));
	}
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clientList) => {
			for (let client of clientList) {
				if (client.url === '/' && 'focus' in client) {
					return (client as any).focus();
				}
			}
			if (self.clients.openWindow) {
				return self.clients.openWindow('/app/tasks');
			}
		})
	);
});

export {};
