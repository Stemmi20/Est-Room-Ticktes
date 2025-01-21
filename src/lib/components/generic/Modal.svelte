<script lang="ts">
	import type { PageServerData } from '../../../routes/$types';

	const {
		onclose,
		rooms,
		error,
	}: { onclose: () => void; rooms: PageServerData['allRooms']; error: string } = $props();
</script>

<div
	class="w-50% h-75% of-hidden rounded-lg color-white p-2 relative
bg-[rgba(255,255,255,0.21)] border-rd-16px backdrop-blur-6.2px border-1px border-solid border-[rgba(255,255,255,0.35)] shadow-[0_4px_30px_rgba(255,255,255,1)] p-5"
>
	<div class="flex flex-row justify-between items-center">
		<h1 class="text-xl font-bold ml-2">Create Ticket</h1>

		<button onclick={() => onclose()} class="p-2">❌</button>
	</div>

	<form action="?/create" method="POST" class="flex flex-col justify-between gap-10 items-center">
		{#if error?.length}
			<div
				class="bg-red-5/50 border-1px border-red-8 border-solid rounded-lg p-2 m-auto w-50 text-center mt-4"
			>
				{error}
			</div>
		{/if}

		<div class="flex flex-col justify-center items-center w-full mt-10">
			<div class="flex flex-row justify-evenly items-center gap-5 w-full">
				<input type="text" placeholder="Title" name="title" required class="w-82% rounded-lg p-2" />
			</div>

			<div class="flex flex-row flex-wrap justify-center gap-2 mt-4 w-90%">
				{#each rooms.sort((a, b) => a.id.localeCompare(b.id)) as room}
					<div class="px-4 items-center w-fit border-1px border-solid gap-2 border-white p-1 rounded-md">
						<input type="radio" title={room.id} name="room" value={room.id} id={room.id} />
						<label for={room.id}>{room.id}</label>
					</div>
				{/each}
			</div>

			<textarea
				placeholder="Description"
				name="desc"
				required
				class="w-82% mt-5 rounded-lg p-2"
				rows="15"
			></textarea>
		</div>

		<input
			type="submit"
			class="bg-emerald-5/50 px-4 p-1 rounded-lg border-2px border-solid border-emerald-5 hover:bg-emerald-5 transition-all duration-100 absolute bottom-5"
		/>
	</form>
</div>
