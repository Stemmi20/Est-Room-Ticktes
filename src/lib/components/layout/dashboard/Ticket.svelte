<script lang="ts">
	import { Role, State, type tickets } from '@prisma/client';
	import type { GETResponse } from '../../../../routes/api/tickets/+server';

	const {
		ticket,
		i,
		onfocus,
		focused,
	}: {
		ticket: NonNullable<GETResponse['rooms']>[number];
		i: number;
		onfocus: () => void;
		focused: boolean;
	} = $props();
</script>

<div
	class="my-2 border-solid border-2px rounded-lg p-2 w-full transition-all duration-300 ease-in-out"
	class:border-emerald-500={focused}
	class:bg-emerald-700:50={focused}
	class:border-slate-300={!focused}
	class:bg-slate-500:50={!focused}
	class:op-50={ticket.state === State.DONE}
	role="button"
	tabindex="0"
	onclick={() => onfocus()}
	onkeydown={(e) => (e.key === 'Enter' ? onfocus() : undefined)}
>
	<div class="flex flex-row justify-between items-center gap-25% mt-1">
		<div class="flex flex-row justify-between items-center w-50%">
			<span class="relative mr-2">
				<span class="absolute text-2 left-0 -top-1.2 text-stone-4">No.</span>
				{i}.
			</span>
			<span class="relative">
				<span class="absolute text-2 right-0 -top-1.2 text-stone-4">Title</span>
				{ticket.title}
			</span>
		</div>

		<div class="flex flex-row justify-between items-center w-50%">
			<span class="relative">
				<span class="absolute text-2 left-8.5 -translate-x-30% -top-1.2 text-stone-4">Status</span>
				{ticket.state === State.OPEN ? '⭕' : ticket.state === State.INPROGRESS ? '🟡' : '🟢'}
				{ticket.state?.toLocaleLowerCase()}
			</span>

			<span class="relative">
				<span class="absolute text-2 right-0 w-max -top-1.2 text-stone-4">Room No.</span>
				{ticket.roomId}
			</span>
		</div>
	</div>
</div>
