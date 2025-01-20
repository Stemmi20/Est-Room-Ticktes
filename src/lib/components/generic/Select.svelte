<script lang="ts">
	import { findInParents } from '$lib/scripts/util/utils.js';
	import { twMerge } from 'tailwind-merge';
	import Options from './Select/Options.svelte';
	import SelectedOption from './Select/SelectedOption.svelte';
	import SelectedOptions from './Select/SelectedOptions.svelte';

	const {
		class: className,
		options,
		maxOpts = 1,
		minOpts = 1,
		required = false,
		searchable = false,
		label,
		id = Math.random().toString(36).substring(7),
		onupdate,
	}: {
		class: string;
		options: string[];
		maxOpts: number;
		minOpts: number;
		required: boolean;
		searchable?: boolean;
		label: string;
		id?: string;
		onupdate?: (v: string[]) => void;
	} = $props();

	const single = maxOpts === 1;

	let element: HTMLDivElement | null = $state(null);
	let expanded = $state(false);
	let selectSearch = $state('');
	let selectedOptions: typeof options = $state([]);

	const update = () => {
		if (expanded) return;
		onupdate?.(selectedOptions);
	};

	const optionClick = (opt: string) => {
		if (opt === 'Clear selection') {
			selectedOptions = [];

			update();
			if (single) expanded = false;

			return;
		}

		if (single) selectedOptions = [opt];
		else {
			selectedOptions = selectedOptions.includes(opt)
				? selectedOptions.filter((s) => s !== opt)
				: [...selectedOptions, opt];
		}

		update();
		if (single) expanded = false;
	};

	const clickWindow = (
		e: (MouseEvent | KeyboardEvent) & { currentTarget: (EventTarget & Window) | HTMLDivElement },
	) => {
		if (findInParents(e.target as HTMLElement, id)) return;
		expanded = false;
		update();
	};

	const labelClick = (updateState?: boolean) => {
		expanded = updateState !== undefined ? updateState : !expanded;
		update();
	};
</script>

<svelte:window on:click={clickWindow} on:keydown={clickWindow} />

<div {id} class={twMerge(['relative w-full', className])}>
	<input
		type="text"
		{required}
		value={selectedOptions.length ? JSON.stringify(selectedOptions) : ''}
		class="w-1px h-1px absolute top-full"
		name={id}
		onfocus={() => element?.focus()}
		tabindex={searchable ? 0 : -1}
	/>
	{#if searchable}
		<div
			class="w-full relative bg-main-darker rounded-md flex flex-row items-center"
			class:pl-1={selectedOptions.length}
		>
			{#if selectedOptions.length}
				<div
					class="flex flex-row gap-1 items-center"
					class:top-1={!single}
					class:top-2={single}
					class:left-1={!single}
					class:left-2={single}
				>
					{#each selectedOptions as opt, j (j)}
						<SelectedOption {single} {optionClick} {opt} />
					{/each}
				</div>

				<div
					class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex flex-row-reverse"
				>
					<span
						class="i-tabler-chevron-up transition-all duration-100 ease-in-out select-none"
						class:rotate-180={expanded}
					></span>
				</div>
			{/if}

			<input
				bind:this={element}
				bind:value={selectSearch}
				onclick={() => labelClick(true)}
				onkeydown={(e) => (e.key === 'Enter' ? labelClick(true) : undefined)}
				role="button"
				tabindex="0"
				class="cursor-pointer bg-transparent rounded-md w-full px-2 py-2 relative text-left placeholder:color-neutral-500 focus:outline-none"
				aria-label="Toggle Select"
				placeholder={label}
				{id}
			/>
		</div>
	{:else}
		<div
			bind:this={element}
			onclick={() => labelClick()}
			onkeydown={(e) => (e.key === 'Enter' ? labelClick() : undefined)}
			role="button"
			tabindex="0"
			class="cursor-pointer bg-main-darker w-full rounded-md px-2 relative text-left focus:outline-none"
			class:pl-1={selectedOptions.length}
			class:py-1={selectedOptions.length}
			class:py-2={!selectedOptions.length}
			aria-label="Toggle Select"
		>
			<SelectedOptions {selectedOptions} {single} {label} {optionClick} />

			<div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex flex-row-reverse">
				<span
					class="i-tabler-chevron-up transition-all duration-100 ease-in-out select-none"
					class:rotate-180={expanded}
				></span>
			</div>
		</div>
	{/if}

	<div class="w-full flex flex-col justify-center flex-wrap z-50 relative">
		<Options
			{expanded}
			{options}
			{single}
			{required}
			{selectedOptions}
			{optionClick}
			{selectSearch}
		/>
	</div>

	{#if required && !selectedOptions.length}
		<div class="color-red-500 text-2.5">This must have a value</div>
	{/if}

	{#if selectedOptions.length > maxOpts}
		<div class="color-red-500 text-2.5">This cannot have more than {maxOpts} values</div>
	{/if}

	{#if required && selectedOptions.length < minOpts}
		<div class="color-red-500 text-2.5">This cannot have less than {maxOpts} values</div>
	{/if}
</div>
