<script lang="ts">
	import '$lib/scripts/index.js';
	import type { Snippet } from 'svelte';
	import './main.css';

	const { children }: { children: Snippet } = $props();
</script>

<div class="bg-gradient-to-br from-stone-9 to-teal-9 h-100lvh w-100lvw">
	{@render children()}
</div>
