<script lang="ts">
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
</script>

<div class="flex flex-col items-center justify-center w-200">
	<div
		class="bg-teal-5/50 p-2 rounded-lg border-solid border-2px border-teal-5 relative pt-2.5 mt-2 w-full"
	>
		<span class="absolute text-2 left-2 top-1 text-stone-1">Firstname</span>
		{data.user?.firstName}
	</div>
	<div
		class="bg-cyan-5/50 p-2 rounded-lg border-solid border-2px border-teal-5 relative pt-2.5 mt-2 w-full"
	>
		<span class="absolute text-2 left-2 top-1 text-stone-1">Lastname</span>
		{data.user?.lastName}
	</div>
	<div
		class="bg-teal-5/50 p-2 rounded-lg border-solid border-2px border-teal-5 relative pt-2.5 mt-2 w-full"
	>
		<span class="absolute text-2 left-2 top-1 text-stone-1">Email</span>
		{data.user?.email}
	</div>
	<div
		class="bg-cyan-5/50 p-2 rounded-lg border-solid border-2px border-teal-5 relative pt-2.5 mt-2 w-full"
	>
		<span class="absolute text-2 left-2 top-1 text-stone-1">Address</span>
		{data.user?.address}
	</div>
	<div
		class="bg-teal-5/50 p-2 rounded-lg border-solid border-2px border-teal-5 relative pt-2.5 mt-2 w-full"
	>
		<span class="absolute text-2 left-2 top-1 text-stone-1">Rooms</span>
		{#each data.user?.rooms || [] as room}
			{room.id},&nbsp
		{/each}
	</div>
</div>

<a
	href="/"
	class="absolute bottom-5 left-10 bg-slate-6 px-2 rounded-lg border-2px border-solid border-slate-4"
	>Home</a
>
