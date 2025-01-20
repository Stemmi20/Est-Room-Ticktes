<script lang="ts">
	const {
		single,
		optionClick,
		opt,
	}: {
		single: boolean;
		optionClick: (opt: string) => void;
		opt: string;
	} = $props();
</script>

{#if single}
	<div
		class="relative w-full mt-1 h-7 ml-1 "
		onclick={(e) => optionClick(opt)}
		onkeydown={(e) => (e.key === 'Enter' ? optionClick(opt) : undefined)}
		role="button"
		tabindex="0"
		aria-label="Toggle Select"
	>
		<span>
			{opt}
		</span>
	</div>
{:else}
	<div
		class="px-2 py-1 bg-neutral-800 rounded-md flex flex-row justify-between items-center gap-2"
		onclick={() => optionClick(opt)}
		onkeydown={(e) => (e.key === 'Enter' ? optionClick(opt) : undefined)}
		role="button"
		tabindex="0"
		aria-label="Remove Select"
	>
		<span>
			{opt}
		</span>
		<div class="w-4">
			<span class="i-tabler-x block pointer-events-none select-none"></span>
		</div>
	</div>
{/if}
