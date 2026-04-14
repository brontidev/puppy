/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

console.log('defined sw');

const CACHE_NAME = 'puppy-shell-v1';
const SHELL_URLS = ['/', '/manifest.webmanifest', '/image.png'];

self.addEventListener('install', (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		Promise.all([
			self.clients.claim(),
			caches.keys().then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
			)
		])
	);
});

async function cacheFirst(request: Request) {
	const cached = await caches.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	if (response.ok) {
		const cache = await caches.open(CACHE_NAME);
		cache.put(request, response.clone());
	}
	return response;
}

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (url.origin !== self.location.origin) return;

	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request).catch(async () => (await caches.match('/')) ?? Response.error())
		);
		return;
	}

	if (['script', 'style', 'image', 'font'].includes(event.request.destination)) {
		event.respondWith(cacheFirst(event.request));
	}
});

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
