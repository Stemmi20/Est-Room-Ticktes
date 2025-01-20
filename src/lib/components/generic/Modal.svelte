<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Select from './Select.svelte';
	import TextInput from './TextInput.svelte';
	let dialog: HTMLDialogElement | null = $state(null);

	const { onclose }: { onclose: () => void } = $props();

	onMount(() => {
		dialog?.showModal();
	});
</script>

<dialog bind:this={dialog} class="w-50% h-40% of-hidden bg-main-dark rounded-lg color-white p-2 relative">
	<div class="flex flex-row justify-between items-center">
		<h1 class="text-xl font-bold">Create Ticket</h1>

		<button onclick={() => onclose()} class="p-2">❌</button>
	</div>
	<form
		action="?/create"
		method="POST"
		class="flex flex-col justify-between gap-10 items-center"
	>
		<div class="flex flex-col justify-center items-center w-full mt-10">
			<div class="flex flex-row justify-evenly items-center gap-5 w-full">
				<input type="text" placeholder="Title" required class="w-82% rounded-lg p-2" />

			</div>

			<textarea placeholder="Description" required class="w-82% mt-5 rounded-lg p-2"></textarea>
		</div>

		<input
			type="submit"
			class="bg-emerald-5/50 px-4 p-1 rounded-lg border-2px border-solid border-emerald-5 hover:bg-emerald-5 transition-all duration-100 absolute bottom-5"
		/>
	</form>
</dialog>
