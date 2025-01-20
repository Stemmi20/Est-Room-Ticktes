<script lang="ts">
	import type { Snippet } from 'svelte';

	const { headline, text, children }: { headline: string; text: string; children?: Snippet } =
		$props();
</script>

<div class="border-solid border-2px border-main-darker rounded-md p-2 mt-1 mr-1">
	<h4 class="font-bold color-alt-text text-sm">{headline}</h4>
	<div class="text-3">{text}</div>

	{#if children}
		{@render children()}
	{/if}
</div>
