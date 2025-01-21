<script lang="ts">
	import Modal from '$lib/components/generic/Modal.svelte';
	import Ticket from '$lib/components/layout/dashboard/Ticket.svelte';
	import { Role, State } from '@prisma/client';
	import type { PageServerData } from './$types';
	import type { GETResponse } from './api/tickets/+server';

	const { data, form }: { data: PageServerData; form: { message: string } } = $props();
	const tickets = $state({ own: data.tickets.own, rooms: data.tickets.rooms });

	let showModal = $state(false);
	let showStatus = $state(false);
	let viewing: null | GETResponse['own'][number] = $state(tickets.own[0]);

	const patch = (state: State) => {
		if (data.user?.role === Role.teacher) return;
		if (!viewing) return;

		showStatus = false;
		viewing.state = state;

		tickets.own = tickets.own.map((t) => {
			if (t.id !== viewing!.id) return t;
			t.state = state;
			return t;
		});

		if (tickets.rooms) {
			tickets.rooms = tickets.rooms?.map((t) => {
				if (t.id !== viewing!.id) return t;
				t.state = state;
				return t;
			});
		}

		fetch('/', {
			method: 'PATCH',
			body: JSON.stringify({ ticketId: viewing.id, state }),
		});
	};
</script>

<div class="flex flex-row relative">
	<div class="w-30lvw h-100lvh relative">
		<h1 class="text-center text-xl mt-5">Your tickets</h1>
		{#each tickets.own as ticket, j}
			<Ticket
				{ticket}
				i={j + 1}
				onfocus={() => {
					viewing = ticket;
					showStatus = false;
				}}
			/>
		{/each}

		{#if tickets.rooms}
			<div class="flex flex-col mt-5">
				<h1 class="text-center text-xl">Tickets for you</h1>
				{#each tickets.rooms as ticket, j}
					<Ticket
						ticket={ticket as unknown as GETResponse['own'][number]}
						i={j + 1}
						onfocus={() => (viewing = ticket)}
					/>
				{/each}
			</div>
		{/if}

		<a
			href="/profile"
			class="absolute bottom-5 left-10 bg-slate-6 px-2 rounded-lg border-2px border-solid border-slate-4"
			>Your Profile</a
		>

		<button
			class="absolute bottom-5 right-50% translate-x-50% bg-emerald-6 px-2 rounded-lg border-2px border-solid border-emerald-4"
			onclick={() => (showModal = true)}
		>
			Create new Ticket
		</button>

		<a
			href="/logout"
			class="absolute bottom-5 right-10 bg-slate-6 px-2 rounded-lg border-2px border-solid border-slate-4"
			>Logout</a
		>
	</div>

	<div class="w-1lvw h-100vlh"></div>

	{#if viewing}
		<div class="flex flex-col">
			<div class="relative min-h-20 mt-5 relative w-69lvw h-50lvh flex flex-row">
				<div class="w-80%">
					<span class="absolute text-2 left-0 -top-1.2 text-stone-4">Ticket Description</span>
					{viewing.desc}
				</div>

				<div class="w-20% h-50lvh">
					<div
						class="w-95% h-95% flex flex-col gap-2
     bg-[rgba(255,255,255,0.21)] border-rd-16px backdrop-blur-6.2px border-1px border-solid border-[rgba(255,255,255,0.35)] shadow-[0_4px_30px_rgba(255,255,255,1)] p-5"
					>
						<div
							class="bg-teal-5/50 p-2 rounded-lg border-solid border-2px border-teal-5 relative pt-2.5"
						>
							<span class="absolute text-2 left-2 top-1 text-stone-1">Title</span>
							{viewing.title}
						</div>

						<div
							class="bg-amber-5/50 p-2 rounded-lg border-solid border-2px border-amber-5 relative pt-2.5"
						>
							<span class="absolute text-2 left-8.5 top-1 text-stone-1">Author</span>
							{viewing.author.role === Role.admin
								? '👑'
								: viewing.author.role === 'supervisor'
									? '📋'
									: '📚'}
							{viewing.author.firstName}
							{viewing.author.lastName}
						</div>

						<div
							class="bg-slate-5/50 p-2 rounded-lg border-solid border-2px border-slate-5 relative pt-2.5"
						>
							<span class="absolute text-2 left-2 top-1 text-stone-1">Created</span>
							{new Date(Number(viewing.creation)).toLocaleString()}
						</div>

						<div
							class="bg-cyan-5/50 p-2 rounded-lg border-solid border-2px border-cyan-5 relative pt-2.5"
						>
							<span class="absolute text-2 left-2 top-1 text-stone-1">Room No</span>
							{viewing.roomId}
						</div>

						<div
							class="bg-rose-5/50 p-2 rounded-lg border-solid border-2px border-rose-5 relative pt-2.5"
						>
							<div>
								<span class="absolute text-2 left-8.5 top-1 text-stone-1">Status</span>
								{viewing.state === 'OPEN' ? '⭕' : viewing.state === 'INPROGRESS' ? '🟡' : '🟢'}
								{viewing.state?.toLowerCase()}
								<span
									class="absolute right-1 top-5 -translate-y-50% text-stone-1 ease-[cubic-bezier(.43,1.8,.69,-0.6)] transition-all duration-300 select-none"
									class:events-none={data.user?.role === Role.teacher}
									class:op-50={data.user?.role === Role.teacher}
									class:hover:-rotate-90={data.user?.role !== Role.teacher}
									role="button"
									tabindex="0"
									onclick={() => (data.user?.role !== Role.teacher ? (showStatus = !showStatus) : undefined)}
									onkeydown={(e) =>
										e.key === 'Enter' && data.user?.role !== Role.teacher
											? (showStatus = !showStatus)
											: undefined}
								>
									✏️
								</span>
							</div>

							{#if showStatus}
								<div class="flex flex-col mt-2">
									<label for="OPEN">
										<input
											type="radio"
											value="OPEN"
											checked={viewing.state === 'OPEN'}
											name="status"
											id="OPEN"
											class="select-none"
											onclick={() => patch('OPEN')}
										/>
										open
									</label>

									<label for="INPROGRESS">
										<input
											type="radio"
											value="INPROGRESS"
											checked={viewing.state === 'INPROGRESS'}
											name="status"
											id="INPROGRESS"
											class="select-none"
											onclick={() => patch('INPROGRESS')}
										/> in progress
									</label>

									<label for="DONE">
										<input
											type="radio"
											value="DONE"
											checked={viewing.state === 'DONE'}
											name="status"
											id="DONE"
											class="select-none"
											onclick={() => patch('DONE')}
										/>
										done
									</label>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<div class="w-69lvw h-50lvh">
				<div class="w-69lvw h-0 my-2.5 relative">
					<div
						class="absolute inset-x-20 top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm"
					></div>
					<div
						class="absolute inset-x-20 top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[1px] w-3/4"
					></div>
					<div
						class="absolute inset-x-60 top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent h-[5px] w-1/4 blur-sm"
					></div>
					<div
						class="absolute inset-x-60 top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent h-[1px] w-1/4"
					></div>
				</div>

				<div class="w-full h-full">
					<form class="flex flex-col w-67lvw p-2 m-4 gap-2" method="POST" action="?/comment">
						<textarea placeholder="New Comment" rows="2" class="rounded-lg p-2" id="content"></textarea>
      <input type=""
						<input
							type="submit"
							class="bg-teal-8 border-solid border-2px rounded-lg border-teal px-2 py-1 max-w-20 self-end"
						/>
					</form>

					{#each viewing.comments as comment}
						<div class="flex flex-col w-67lvw p-2 m-4 gap-2">
							<div class="bg-slate-5/50 p-2 rounded-lg border-solid border-2px border-slate-5 relative">
								<span class="absolute text-2 left-2 top-1 text-stone-1">Author</span>
								{comment.author.firstName}
								{comment.author.lastName}
							</div>

							<div class="bg-amber-5/50 p-2 rounded-lg border-solid border-2px border-amber-5 relative">
								<span class="absolute text-2 left-2 top-1 text-stone-1">Created</span>
								{new Date(Number(comment.creation)).toLocaleString()}
							</div>

							<div class="bg-rose-5/50 p-2 rounded-lg border-solid border-2px border-rose-5 relative">
								<span class="absolute text-2 left-2 top-1 text-stone-1">Comment</span>
								{comment.content}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

{#if showModal}
	<div class="fixed w-full h-full top-0 left-0 bg-black/50 flex justify-center items-center">
		<Modal onclose={() => (showModal = false)} rooms={data.allRooms} error={form?.message} />
	</div>
{/if}

<div class="w-full h-0 relative my-2.5 rotate-90 relative right-19.5lvw bottom-50%">
	<div
		class="absolute inset-x-20 top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm"
	></div>
	<div
		class="absolute inset-x-20 top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[1px] w-3/4"
	></div>
	<div
		class="absolute inset-x-60 top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent h-[5px] w-1/4 blur-sm"
	></div>
	<div
		class="absolute inset-x-60 top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-red-500 to-transparent h-[1px] w-1/4"
	></div>
</div>
