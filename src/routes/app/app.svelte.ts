import type { Relation, Role, Task } from "$lib/firestore-schema"
import { getContext, hasContext, setContext } from "svelte"
import { firekitCollection, firekitDoc, firekitUser } from "svelte-firekit"
import { limit, orderBy } from "firebase/firestore"

const context = Symbol()

export class App {
    role = $derived(firekitUser.uid?.split(":")[0] as Role)
    relation_id = $derived(firekitUser.uid?.split(":")[1])

    relation = firekitDoc<Relation>(`relations/${this.relation_id}`)
    /**
     * one-time paginated feed, initialized lazily by /tasks page
     */
    paginated_tasks = $state<ReturnType<typeof firekitCollection<Task & { id: string }>> | null>(null)
    
    /**
     * realtime listener for most recent tasks so new tasks appear immediately
     */
    new_tasks = firekitCollection<Task & { id: string }>(
        `relations/${this.relation_id}/tasks`,
        [orderBy("created_at", "desc"), limit(20)]
    )

    tasks_bootstrapped = $state(false)
    tasks_bootstrap_pending = $state(false)

    tasks = $derived.by(() => {
        const paginated = this.paginated_tasks?.data ?? []
        const seen = new Set<string>()
        const merged = [...this.new_tasks.data, ...paginated].filter((task) => {
            if (seen.has(task.id)) return false
            seen.add(task.id)
            return true
        })

        merged.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        return merged
    })

    recent_tasks = $derived(this.new_tasks.data)

    tasks_loading = $derived(this.tasks_bootstrap_pending || !!this.paginated_tasks?.loading)

    tasks_has_more = $derived(this.paginated_tasks?.hasMore ?? false)

    constructor() {
        $effect(() => {
            this.relation.setPath(`relations/${this.relation_id}`)
            this.new_tasks.setPath(`relations/${this.relation_id}/tasks`)

            this.paginated_tasks?.dispose()
            this.paginated_tasks = null

            this.tasks_bootstrapped = false
            this.tasks_bootstrap_pending = false
        })
    }

    async ensureTasksLoaded() {
        if (this.tasks_bootstrapped || this.tasks_bootstrap_pending) return

        this.tasks_bootstrap_pending = true
        const feed = firekitCollection<Task & { id: string }>(
            `relations/${this.relation_id}/tasks`,
            [orderBy("created_at", "desc")]
        )

        this.paginated_tasks = feed
        await feed.setPagination(20)
        this.tasks_bootstrapped = true
        this.tasks_bootstrap_pending = false
    }

    async loadMoreTasks() {
        await this.paginated_tasks?.loadMore()
    }
}

let _app: App | undefined

export function app(): App {
    if(_app) return _app
    return _app = new App()
}