import DataBase from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import token from '$lib/scripts/validators/token.js';

export const load: PageServerLoad = async (event) => {
	if (!event.cookies.get('token')) throw redirect(307, '/login');

	const user = await DataBase.users.findUnique({
		where: { id: Number(token(event.cookies.get('token') || '')) },
		include: { rooms: true },
		omit: { password: true },
	});

	return { user };
};
