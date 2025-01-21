<script lang="ts">
	import Modal from '$lib/components/generic/Modal.svelte';
	import Ticket from '$lib/components/layout/dashboard/Ticket.svelte';
	import { Role, State } from '@prisma/client';
	import type { PageServerData } from './$types';
	import type { GETResponse } from './api/tickets/+server';

	const { data, form }: { data: PageServerData; form: { message: string } } = $props();
	const tickets = $state({ own: data.tickets.own, rooms: data.tickets.rooms });

	let showModal = $state(false);
	let search = $state('');
	let showStatus = $state(false);
	let sort: 'created' | 'title' | 'state' | 'room' = $state('created');
	let viewing: null | GETResponse['own'][number] = $state(tickets.own[0]);

	$effect(() => console.log(sort));

	const find = (t: GETResponse['own'][number]) =>
		`${t.title} ${t.desc} ${t.author.firstName} ${t.author.lastName} ${t.roomId} ${t.state}`
			.toLowerCase()
			.includes(search.toLowerCase());

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

		data.tickets.own = tickets.own;

		if (tickets.rooms) {
			tickets.rooms = tickets.rooms?.map((t) => {
				if (t.id !== viewing!.id) return t;
				t.state = state;
				return t;
			});

			data.tickets.rooms = tickets.rooms;
		}

		fetch('/', {
			method: 'PATCH',
			body: JSON.stringify({ ticketId: viewing.id, state }),
		});
	};

	const del = () => {
		if (!viewing) return;
		if (data.user?.role !== Role.admin) return;

		tickets.own = tickets.own.filter((t) => t.id !== viewing!.id);
		if (tickets.rooms) tickets.rooms = tickets.rooms.filter((t) => t.id !== viewing!.id);

		data.tickets.rooms = tickets.rooms;
		data.tickets.own = tickets.own;

		fetch('/', {
			method: 'DELETE',
			body: JSON.stringify({ ticketId: viewing!.id }),
		});

		viewing = null;
	};

	const toSorted = (t: (typeof data)['tickets']['own']) => {
		switch (sort) {
			case 'created':
				return t.toSorted((a, b) => Number(a.creation) - Number(b.creation));

			case 'room':
				return t.toSorted((a, b) => a.roomId.localeCompare(b.roomId));

			case 'state':
				return t.toSorted((a, b) => b.state.localeCompare(a.state));

			case 'title':
				return t.toSorted((a, b) => a.title.localeCompare(b.title));

			default:
				return t;
		}
	};
</script>

<div class="flex flex-row relative">
	<div class="w-30lvw h-100lvh relative ml-1 of-scroll hide-scrollbar flex flex-col items-center">
		<input type="text" placeholder="Search" class="w-25lvw p-2 rounded-lg m-4" bind:value={search} />
		<div class="flex flex-row justify-center gap-5 select-none">
			<label for="created">
				<input type="radio" id="created" name="filter" value="created" bind:group={sort} />
				Created
			</label>
			<label for="title">
				<input type="radio" id="title" name="filter" value="title" bind:group={sort} />
				Title
			</label>
			<label for="state">
				<input type="radio" id="state" name="filter" value="state" bind:group={sort} />
				State
			</label>
			<label for="room">
				<input type="radio" id="room" name="filter" value="room" bind:group={sort} />
				Room
			</label>
		</div>

		<h1 class="text-center text-xl mt-5">Your tickets</h1>
		{#each toSorted(tickets.own.filter((t) => (search.length ? find(t) : true))) as ticket, j}
			<Ticket
				{ticket}
				focused={viewing?.id === ticket.id}
				i={j + 1}
				onfocus={() => {
					viewing = ticket;
					showStatus = false;
				}}
			/>
		{/each}

		{#if tickets.rooms}
			<div class="flex flex-col mt-5 w-full">
				<h1 class="text-center text-xl">Tickets for you</h1>
				{#each toSorted(tickets.rooms.filter((t) => (search.length ? find(t) : true))) as ticket, j}
					<Ticket
						focused={viewing?.id === ticket.id}
						ticket={ticket as unknown as GETResponse['own'][number]}
						i={j + 1}
						onfocus={() => (viewing = ticket)}
					/>
				{/each}
			</div>
		{/if}

		<div class="content-empty min-h-5lvh w-1"></div>
	</div>

	<div
		class="absolute w-31lvw -left-2 h-5lvh bottom-5 flex flex-row justify-evenly backdrop-blur-1px bg-black/20 p-2 px-4 shadow-[0_-8px_15px_-1px_rgba(0,0,0,0.25)]"
	>
		<a href="/profile" class="bg-slate-6 px-2 rounded-lg border-2px border-solid border-slate-4"
			>Your Profile</a
		>

		<button
			class=" bg-emerald-6 px-2 rounded-lg border-2px border-solid border-emerald-4"
			onclick={() => (showModal = true)}
		>
			Create new Ticket
		</button>

		<a
			href="/manage"
			class:hidden={data.user?.role !== Role.admin}
			class="bg-cyan-6 px-2 rounded-lg border-2px border-solid border-slate-4"
		>
			Manage Rooms
		</a>
		<a href="/logout" class="bg-slate-6 px-2 rounded-lg border-2px border-solid border-slate-4">
			Logout
		</a>
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

						<span
							class="absolute right-50% translate-x-50% bottom-0 hover:color-red-6 -translate-y-50% text-stone-1 ease-in-out transition-all duration-300 select-none"
							class:hidden={data.user?.role !== Role.admin}
							role="button"
							tabindex="0"
							onclick={() => del()}
							onkeydown={(e) => (e.key === 'Enter' ? del() : undefined)}
						>
							Delete 🗑️
						</span>
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
					<form
						class="flex flex-col w-67lvw p-2 m-4 pb-1 mb-0 gap-2 shadow-[0_8px_8px_-5px_rgba(0,0,0,0.25)] rounded-lg"
						method="POST"
						action="?/comment"
					>
						<textarea placeholder="New Comment" rows="2" class="rounded-lg p-2" name="content"></textarea>
						<input type="text" class="hidden" value={viewing.id} name="ticket" />
						<input
							type="submit"
							class="bg-teal-8 border-solid border-2px rounded-lg border-teal px-2 py-1 max-w-20 self-end"
						/>
					</form>

					<div class="w-full h-30lvh of-scroll hide-scrollbar pb-2">
						{#each viewing.comments as comment}
							<div class="flex flex-col w-67lvw p-2 ml-4 gap-1">
								<div
									class="bg-stone-5/50 p-2 rounded-lg border-solid border-2px border-stone-5 relative p-2 flex flex-col"
								>
									<div class="flex flex-row justify-between">
										<div class="relative text-stone-4 text-3">
											<span class="absolute text-2 left-0 -top-2">Author</span>
											{comment.author.firstName}
											{comment.author.lastName}
										</div>

										<div class="relative text-stone-4 text-3">
											<span class="absolute text-2 left-0 -top-2">Created</span>
											{new Date(Number(comment.creation)).toLocaleString()}
										</div>
									</div>

									<div class="w-full mt-1">
										<span class="absolute text-2 left-2 top-6.5 text-stone-1">Comment</span>
										{comment.content}
									</div>
								</div>
							</div>
						{/each}
					</div>
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

<div
	class="w-full h-0 relative my-2.5 rotate-90 relative right-19.5lvw bottom-50%"
	class:hidden={showModal}
>
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
