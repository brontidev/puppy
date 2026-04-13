import { command } from '$app/server';
import z from 'zod';
import { db } from '$lib/server/firebase';
import type { FcmToken } from '$lib/firestore-schema';

export const store_fcm_token = command(
	z.object({ relation_id: z.string(), fcm_token: z.string() }),
	async ({ relation_id, fcm_token }) => {
		try {
			// Store token in separate collection for security
			const tokenDoc: FcmToken = {
				relationId: relation_id,
				token: fcm_token,
				enabled: true,
				createdAt: new Date()
			};

			await db
				.collection('fcm_tokens')
				.doc(fcm_token)
				.set(tokenDoc);

			console.log('FCM token stored:', relation_id, fcm_token.slice(0, 10));
		} catch (error) {
			console.error('Failed to store FCM token:', error);
			throw error;
		}
	}
);

export const toggle_notifications = command(
	z.object({ fcm_token: z.string(), enabled: z.boolean() }),
	async ({ fcm_token, enabled }) => {
		try {
			await db.collection('fcm_tokens').doc(fcm_token).update({
				enabled
			});
			console.log('Notifications toggled:', fcm_token.slice(0, 10), enabled);
		} catch (error) {
			console.error('Failed to toggle notifications:', error);
			throw error;
		}
	}
);
