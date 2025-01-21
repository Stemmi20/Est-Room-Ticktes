import token from '$lib/scripts/validators/token.js';
import DataBase from '$lib/server/database';
import { Role } from '@prisma/client';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async (event) => {
	if (!event.cookies.get('token')) throw redirect(307, '/login');

	const user = await DataBase.users.findUnique({
		where: { id: Number(token(event.cookies.get('token') || '')) },
	});
	if (user?.role !== Role.admin) throw redirect(307, '/');

	const rooms = await DataBase.rooms.findMany({ where: {} });

	return { allRooms: rooms };
};
