<script lang="ts">
	const { text }: { text: string } = $props();
	let tooltip: HTMLDivElement | null = $state(null);
	let mark: HTMLImageElement | null = $state(null);

	const hover = () => {
		if (!tooltip) return;

		const rect = tooltip.getBoundingClientRect();

		if (rect.x < 0) tooltip.style.left = `${rect.width / 4}px`;
		else if (rect.x + rect.width > window.innerWidth) {
			tooltip.style.left = `-${window.innerWidth - rect.width}px`;
		}
	};

	const unhover = () => {
		if (!tooltip) return;

		tooltip.style.left = '';
	};

	// TODO: tooltips dont display properly in modal
</script>

<div
	class="relative inline-block group text-center"
	role="tooltip"
	onmouseenter={() => hover()}
	onmouseleave={() => unhover()}
	onfocus={() => hover()}
	onblur={() => unhover()}
>
	<span class="i-tabler-info-circle block"></span>

	<div
		bind:this={tooltip}
		class="hidden group-hover:block
  absolute z-50 w-100 bg-main-darkest
  rounded-5px border-alt-text border-op-50 border-0.1px border-solid
  px-3 py-1 box-shadow-main break-words
  bottom-[calc(100%+8px)] left-50% -translate-x-50% text-sm
  min-w-[min(400px,calc(100vw-32px))] max-w-[calc(100vw-32px)]
  transition-all duration-300 ease-in-out"
	>
		{text}
	</div>
</div>
