import token from '$lib/scripts/validators/token';
import DataBase from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (req) => {
	if (req.url.pathname === '/login') {
		const rooms = await DataBase.rooms.findMany({
			where: {},
		});

		return {
			rooms: rooms?.filter((r) => !r.supervisorId).map((r) => r.id),
		};
	}

	const uId = token(req.cookies.get('token') || '');
	if (!uId) throw redirect(307, '/login');

	return { uId };
};
