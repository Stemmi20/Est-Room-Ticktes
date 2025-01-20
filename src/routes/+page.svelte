<script lang="ts">
	import Modal from '$lib/components/generic/Modal.svelte';
	import Ticket from '$lib/components/layout/dashboard/Ticket.svelte';
	import type { PageServerData } from './$types';
	import type { GETResponse } from './api/tickets/+server';

	const { data }: { data: PageServerData } = $props();
	let showModal = $state(false);
</script>

<div class="w-full h-full flex flex-row">
	<div class="flex flex-col gap-5 mt-5 w-50%">
		<h1 class="text-center text-xl relative">
			Your tickets
			<button class="bg-emerald-5 rounded absolute right-0 translate-x-50% top-1" onclick={() => (showModal = true)}>➕</button>
		</h1>
		{#each data.tickets.own as ticket, j}
			<Ticket {ticket} i={j} />
		{/each}
	</div>

	{#if data.tickets.rooms}
		<div class="flex flex-col gap-5 mt-5 w-50%">
			<h1 class="text-center text-xl">Tickets for you</h1>
			{#each data.tickets.rooms as ticket, j}
				<Ticket ticket={ticket as unknown as GETResponse['own'][number]} i={j} />
			{/each}
		</div>
	{/if}
</div>

{#if showModal}
	<div class="fixed w-full h-full top-0 left-0 bg-black/50 flex justify-center items-center">
		<Modal onclose={() => (showModal = false)} />
	</div>
{/if}
