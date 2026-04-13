import { command } from "$app/server";
import z from "zod";
import { ulid } from "@std/ulid"
import type { Task } from "$lib/firestore-schema";
import { db } from "$lib/server/firebase";
import { increment } from "firebase/firestore";
import { sendTaskNotification } from "$lib/server/notifications";

export const mark_task = command(
    z.object({ relation_id: z.string(), task_id: z.string(), mark: z.boolean() }),
    async ({ relation_id, task_id, mark }) => {
        const taskRef = db
            .collection('relations')
            .doc(relation_id)
            .collection('tasks')
            .doc(task_id)

        const task = await taskRef.get()
        if (!task.exists) return
        if ((task.data() as Task).marked_at) return

        const taskData = task.data() as Task;
        await taskRef
            .update({ marked_at: new Date(), mark } as Partial<Task>)

        await db.collection('relations').doc(relation_id).update({ puppyscore: increment(taskData?.bounty * (mark ? 1 : -1)) })

        // Send notification
        const notificationTitle = mark ? "Task Completed! 🎉" : "Task Unmarked";
        const notificationBody = `"${taskData.name}" has been ${mark ? "completed" : "unmarked"}`;
        await sendTaskNotification(relation_id, notificationTitle, notificationBody);
    },
);

export const create_task = command(
    z.object({ relation_id: z.string(), bounty: z.number(), done: z.boolean(), name: z.string() }),
    async ({ relation_id, bounty, done, name }) => {
        const id = ulid()
        //@ts-expect-error
        const task: Task = {
            name,
            bounty,
            created_at: new Date(),
            mark: done ? true : null,
            marked_at: done ? new Date : null
        }

        const taskRef = db
            .collection('relations')
            .doc(relation_id)
            .collection('tasks')
            .doc(id)

        if (done) {
            await db.collection('relations').doc(relation_id).update({ puppyscore: increment(task.bounty) })
        }

        await taskRef.set(task)

        // Send notification
        await sendTaskNotification(
            relation_id,
            "New Task Created! 📝",
            `"${name}" assigned with ${bounty} bounty`
        );
    },
);
