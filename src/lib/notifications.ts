import { getToken, onMessage, type Messaging } from "firebase/messaging";
import { firebaseService } from "svelte-firekit";
import { store_fcm_token } from "../routes/app/notifications.remote";

let messaging: Messaging | null = null;

export const initMessaging = async (relationId?: string) => {
    try {
        messaging = (await firebaseService.getMessagingInstance())!;

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            // Get FCM token
            const token = await getToken(messaging, {
                vapidKey:
                    "BHoAU8Oy2CL3cVyV6ztE9RX34xKl7VpV8PNpOJEIHt5Qd4_PtB7AzigpOJIDTqoCLO-r-bt2SMcZ9gQbrt8Nchw",
            });

            if (token && relationId) {
                // Store token in Firebase
                try {
                    await store_fcm_token({ relation_id: relationId, fcm_token: token });
                } catch (error) {
                    console.error("Failed to store FCM token:", error);
                }
                return token;
            }
        }
    } catch (error) {
        console.error("Failed to initialize messaging:", error);
    }
    return null;
};

export const listenForMessages = () => {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
        const notificationTitle = payload.notification?.title || "puppy";
        const notificationOptions = {
            body: payload.notification?.body,
            icon: "/image.png",
            badge: "/image.png",
        };

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(notificationTitle, notificationOptions);
            });
        }
    });
};
