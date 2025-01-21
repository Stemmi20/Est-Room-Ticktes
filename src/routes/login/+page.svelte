<script lang="ts">
	import type { PageServerData } from '../$types';

	let method: 'login' | 'register' = $state('login');
	let role: 'supervisor' | 'teacher' = $state('teacher');

	const { data, form }: { data: PageServerData; form: { message: string } } = $props();

	const changeMethod = (newMethod: typeof method) => {
		method = newMethod;
	};
</script>

<img
	src="/bg.png"
	width="1200"
	class="absolute top-50% -translate-y-50% left-50% -translate-x-50%"
	alt=""
/>

<div class="h-100lvh w-100lvw color-black translate-y-30%">
	<div
		class="w-fit m-auto flex flex-col justify-center items-center
  bg-[rgba(255,255,255,0.21)] border-rd-16px backdrop-blur-6.2px border-1px border-solid border-[rgba(255,255,255,0.35)] shadow-[0_4px_30px_rgba(255,255,255,1)] p-5"
	>
		<div class="flex flex-col justify-center items-center gap-2">
			<h1 class="text-2xl">Hi there! 👋</h1>
			<span>Please log in or register to get started</span>
		</div>

		{#if form?.message?.length}
			<div
				class="bg-red-5/50 border-1px border-red-8 border-solid rounded-lg p-2 m-auto w-50 text-center mt-4"
			>
				{form.message}
			</div>
		{/if}

		<div class="w-full flex flex-row justify-center items-center gap-5 mt-5">
			<button
				onclick={() => changeMethod('login')}
				onkeydown={(e) => (e.key === 'Enter' ? changeMethod('login') : undefined)}
				class:border-2px={method === 'login'}
				class="border-cyan-7 p-2 rounded-md px-4"
			>
				Log-in
			</button>
			<button
				onclick={() => changeMethod('register')}
				onkeydown={(e) => (e.key === 'Enter' ? changeMethod('register') : undefined)}
				class:border-2px={method === 'register'}
				class="border-cyan-7 p-2 rounded-md px-4"
			>
				Register
			</button>
		</div>

		<div class="pt-4">
			{#if method === 'login'}
				<form
					class="flex flex-col justify-center items-center text-center gap-2"
					action="?/login"
					method="POST"
				>
					<input
						type="text"
						name="email"
						placeholder="E-Mail"
						class="text-center font-size-xl rounded-xl border-white text-white border-1px"
						autocomplete="email"
						required
					/>

					<input
						type="password"
						name="password"
						placeholder="Password"
						class="text-center font-size-xl rounded-xl border-white text-white border-1px"
						autocomplete="current-password"
						required
					/>

					<div class="flex flex-row justify-evenly items-center gap-5">
						<input
							type="submit"
							value="Log-In"
							class="hover:text-white font-md font-bold p-2 px-6 rounded-xl transition-all bg-[position:0%_center] hover:bg-[position:100%_center] font-bold text-shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
						/>
					</div>
				</form>
			{:else}
				<form
					class="flex flex-col justify-center items-center text-center gap-2"
					action="?/register"
					method="POST"
				>
					<input
						type="text"
						name="firstName"
						placeholder="First Name"
						class="text-center font-size-xl rounded-xl border-white text-white border-1px"
						autocomplete="name"
						required
					/>

					<input
						type="text"
						name="lastName"
						placeholder="Last Name"
						class="text-center font-size-xl rounded-xl border-white text-white border-1px"
						autocomplete="family-name"
						required
					/>

					<input
						type="text"
						name="email"
						placeholder="E-Mail"
						class="text-center font-size-xl rounded-xl border-white text-white border-1px"
						autocomplete="email"
						required
					/>

					<input
						type="password"
						name="password"
						placeholder="Password"
						class="text-center font-size-xl rounded-xl border-white text-white border-1px"
						autocomplete="current-password"
						required
					/>

					<input
						type="address"
						name="address"
						placeholder="Adresse"
						class="text-center font-size-xl rounded-xl border-white text-white border-1px"
						autocomplete="address-line1"
						required
					/>

					<div class="flex flex-col justify-center items-center">
						I am a

						<div class="flex flex-row justify-center items-center gap-4">
							<label class="select-none">
								<input type="radio" name="role" value="teacher" required checked bind:group={role} />
								Teacher
							</label>
							<label class="select-none">
								<input type="radio" name="role" value="supervisor" required bind:group={role} />
								Supervisor
							</label>
						</div>
					</div>

					{#if role === 'supervisor'}
						<div class="flex flex-row flex-wrap w-50 gap-2 justify-evenly items-center">
							{#each data.rooms as room}
								<div
									class="flex flex-row justify-between px-4 items-center w-45% border-1px border-solid gap-2 border-white p-1 rounded-md"
								>
									<input type="checkbox" title={room} name="room" id={room} value={room} />
									<label for={room}>{room}</label>
								</div>
							{/each}
						</div>
					{/if}

					<div class="flex flex-row justify-evenly items-center gap-5">
						<input
							type="submit"
							value="Register"
							class="font-md font-bold hover:text-white p-2 px-6 rounded-xl transition-all bg-[position:0%_center] hover:bg-[position:100%_center] font-bold text-shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
						/>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>
