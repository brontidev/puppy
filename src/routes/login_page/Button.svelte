<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';

	const {
		title,
		desc,
		href,
		onclick,
		arrow = false
	}: {
		title: string;
		desc?: string;
		arrow?: boolean;
	} & (
		| { href?: string }
		| {
				onclick?: MouseEventHandler<HTMLButtonElement>;
		  }
	) = $props();
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	role="button"
	tabindex="0"
	{href}
	{onclick}
	class="btn max-w-180 p-8 btn-soft btn-xl"
>
	<div class="flex grow flex-col items-start">
		<span>{title}</span>
		{#if desc}<span class="text-sm">{desc}</span>{/if}
	</div>
	{#if arrow}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
		</svg>
	{/if}
</svelte:element>
