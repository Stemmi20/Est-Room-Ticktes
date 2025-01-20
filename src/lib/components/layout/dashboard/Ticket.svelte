<script lang="ts">
	import { Role, State, type tickets } from '@prisma/client';
	import type { GETResponse } from '../../../../routes/api/tickets/+server';

	const { ticket, i }: { ticket: NonNullable<GETResponse['rooms']>[number]; i: number } = $props();

	let expanded = $state(false);
</script>

<div class="my-2 bg-slate-500/50 border-slate-300 border-solid border-2px rounded-lg p-2">
	<div class="flex flex-row justify-center items-center gap-5">
		<span>{i}.</span>
		<span>{ticket.title}</span>
		<span>
			{ticket.state === State.OPEN ? '⭕' : ticket.state === State.INPROGRESS ? '🟡' : '🟢'}
			{ticket.state?.toLocaleLowerCase()}
		</span>
		<span>{ticket.roomId}</span>
	</div>

	{#if expanded}
		<div class="relative">
			{ticket.desc}
			<div class="absolute bottom-1 right-1 op-50 rounded-lg border-amber-3 border-solid border-1px p-1 bg-amber-5/70">
				{ticket.author.role === Role.admin ? '👑' : ticket.author.role === 'supervisor' ? '📋' : '📚'}
				{ticket.author.firstName}
				{ticket.author.lastName}
			</div>
		</div>
	{/if}
</div>
