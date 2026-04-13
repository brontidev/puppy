export type Toast = { body: string; state: boolean };

const toasts = $state<[Toast, string][]>([]);

export function get_toasts() {
	return toasts;
}

export function remove_toast(idx: number) {
	toasts.splice(idx, 1);
}

export function add_toast(toast: Toast) {
	toasts.push([toast, crypto.randomUUID()]);
}
