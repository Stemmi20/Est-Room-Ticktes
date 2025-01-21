<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	onMount(() => {
		if (page.url.searchParams.get('reload')) {
			location.href = '/';
		}
	});
</script>

<div class="flex flex-col items-center justify-center h-100lvh">
	<h1>{page.status}: {page.error?.message}</h1>

	<span class="mt-2">The page you were looking for, doesn't exist</span>

	<a href="/" class="btn-primary mt-2">Take me back</a>
</div>
