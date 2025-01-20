<script lang="ts">
	import SelectedOption from './SelectedOption.svelte';

	const {
		selectedOptions,
		single,
		label,
		optionClick,
	}: {
		selectedOptions: string[];
		single: boolean;
		label: string;
		optionClick: (opt: string) => void;
	} = $props();
</script>

{#if selectedOptions.length}
	<div class="flex flex-row flex-wrap gap-1 items-center">
		{#each selectedOptions as opt, j (j)}
			<SelectedOption {single} {optionClick} {opt} />
		{/each}

		{#if !single}
			<div class="color-neutral-500 select-none pointer-events-none">{label}</div>
		{/if}
	</div>
{:else}
	<div class="color-neutral-500 select-none pointer-events-none">{label}</div>
{/if}
