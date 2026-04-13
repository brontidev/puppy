import { getMessaging } from "firebase-admin/messaging";
import { db } from "./firebase";
import type { Relation } from "../firestore-schema";

export const sendTaskNotification = async (
  relationId: string,
  title: string,
  body: string
) => {
  try {
    // Get the relation document to find sub's FCM token
    const relationDoc = await db.collection("relations").doc(relationId).get();

    if (!relationDoc.exists) {
      console.error("Relation not found:", relationId);
      return;
    }

    const relation = relationDoc.data() as Relation;
    if (!relation.sub_fcm_token) {
      console.log("No FCM token for sub user:", relationId);
      return;
    }

    // Send notification via Firebase Cloud Messaging
    const messaging = getMessaging();
    const response = await messaging.send({
      token: relation.sub_fcm_token,
      notification: {
        title,
        body,
      },
      data: {
        relationId,
        type: "task_update",
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "task_notifications",
        },
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      webpush: {
        headers: {
          TTL: "86400", // 24 hours
        },
      },
    });

    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};
