import { command } from "$app/server";
import z from "zod";
import { db } from "$lib/server/firebase";
import type { Relation } from "$lib/firestore-schema";

export const store_fcm_token = command(
    z.object({ relation_id: z.string(), fcm_token: z.string() }),
    async ({ relation_id, fcm_token }) => {
        try {
            await db.collection("relations").doc(relation_id).update({
                sub_fcm_token: fcm_token,
            } as Partial<Relation>);
            console.log("FCM token stored for relation:", relation_id);
        } catch (error) {
            console.error("Failed to store FCM token:", error);
            throw error;
        }
    }
);
