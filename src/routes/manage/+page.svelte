<script lang="ts">
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
	let file: FileList | undefined = $state();
	let additionalRooms: string[] = $state([]);
	let working: boolean = $state(false);
	let rooms: string[] = $state(data.allRooms.map((r) => r.id));

	$effect(() => {
		working = true;
		(async () => {
			additionalRooms = ((await file?.item(0)?.text())?.match(/\D\d\.\d{2}/gm) || []).filter(
				(r) => !data.allRooms.find((room) => room.id === r),
			);
			working = false;
		})();
	});

	const addRoom = (room: string) => {
		rooms.push(room);
		additionalRooms = additionalRooms.filter((r) => r !== room);

		fetch(`/manage`, {
			method: 'POST',
			body: JSON.stringify({ roomId: room }),
		});
	};

	const delRoom = (room: string) => {
		rooms = rooms.filter((r) => r !== room);

		fetch(`/manage`, {
			method: 'DELETE',
			body: JSON.stringify({ roomId: room }),
		});
	};
</script>

<img src="/bg-manage.png" alt="" class="absolute left-50% top-50% -translate-50%" width="1250" />

<div
	class="absolute top-50% -translate-y-50% left-50% -translate-x-50% m-auto w-50% h-50% flex justify-center items-center flex-col p-5 text-black
  bg-[rgba(255,255,255,0.21)] border-rd-16px backdrop-blur-6.2px border-1px border-solid border-[rgba(255,255,255,0.35)] shadow-[0_4px_30px_rgba(255,255,255,1)] p-5"
>
	<div class="relative w-full flex flex-row justify-center">
		<label
			for="upload"
			class="select-none cursor-pointer bg-stone-8/50 p-2 rounded-lg text-white hover:bg-stone-3/50 hover:text-black transition-all duration-100 ease-in-out mb-10"
		>
			<input
				id="upload"
				type="file"
				accept=".csv"
				bind:files={file}
				max="1"
				required
				class="absolute left-50% -translate-x-50%"
			/>
			Upload CSV floorplan
		</label>
	</div>

	{#if working}
		<p>Loading...</p>
	{:else if additionalRooms.length}
		<div class="flex flex-row gap-2">
			{#each additionalRooms as room}
				<button class="rounded-lg px-4 p-2 bg-emerald-6/50" onclick={() => addRoom(room)}
					>{room} ➕</button
				>
			{/each}
		</div>
	{:else}
		<p>No additional rooms found.</p>
	{/if}

	<h1 class="mt-10">Current Rooms</h1>
	<div class="flex flex-row justify-center items-center gap-5 flex-wrap">
		{#each rooms.toSorted((a, b) => a.localeCompare(b)) as room}
			<div class="flex flex-row gap-2">
				<button class="rounded-lg px-4 p-2 bg-red-6/50" onclick={() => delRoom(room)}>
					{room} 🗑️
				</button>
			</div>
		{/each}
	</div>
</div>
<a
	href="/"
	class="absolute bottom-5 left-10 bg-slate-6 px-2 rounded-lg border-2px border-solid border-slate-4"
	>Home</a
>
