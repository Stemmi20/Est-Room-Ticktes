<script lang="ts">
	import '$lib/scripts/index.js';
	import type { Snippet } from 'svelte';
	import './main.css';

	const { children }: { children: Snippet } = $props();
</script>

{@render children()}
