import { getMessaging } from 'firebase-admin/messaging';
import { db } from './firebase';
import type { FcmToken } from '../firestore-schema';

export const sendTaskNotification = async (relationId: string, title: string, body: string) => {
	try {
		// Get all enabled FCM tokens for this relation
		const tokensSnapshot = await db
			.collection('fcm_tokens')
			.where('relationId', '==', relationId)
			.where('enabled', '==', true)
			.get();

		if (tokensSnapshot.empty) {
			console.log('No enabled FCM tokens for relation:', relationId);
			return;
		}

		// Send notification to all enabled devices
		const messaging = getMessaging();
		for (const doc of tokensSnapshot.docs) {
			const tokenData = doc.data() as FcmToken;
			const token = tokenData.token;
			try {
				const response = await messaging.send({
					token,
					data: {
						title,
						body,
						relationId,
						type: 'task_update'
					},
					webpush: {
						headers: {
							TTL: '86400', // 24 hours
							Urgency: 'high'
						}
					}
				});
				console.log('Notification sent to device:', token.slice(0, 10), response);
			} catch (deviceError) {
				console.error('Failed to send to token:', token.slice(0, 10), deviceError);
			}
		}
	} catch (error) {
		console.error('Failed to send notification:', error);
	}
};
