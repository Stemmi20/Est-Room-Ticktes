<script lang="ts">
	import Option from './Option.svelte';

	const {
		expanded,
		options,
		single,
		required,
		selectedOptions,
		optionClick,
		selectSearch,
	}: {
		expanded: boolean;
		options: string[];
		single: boolean;
		required: boolean;
		selectedOptions: string[];
		optionClick: (opt: string) => void;
		selectSearch: string;
	} = $props();
</script>

{#if expanded}
	<div
		class="absolute top-full right-1/2 translate-x-1/2 bg-main-dark b-1px b-solid b-main-darkest w-full z-100 rounded-md max-h-50 scroll-auto of-x-hidden select-none"
	>
		{#each required ? options.filter((o) => o
						.toLowerCase()
						.includes(selectSearch)) : ['Clear selection', ...options.filter((o) => o
							.toLowerCase()
							.includes(selectSearch))] as opt, i}
			<Option {i} {required} {opt} {single} {selectedOptions} {optionClick} />
		{/each}
	</div>
{/if}
