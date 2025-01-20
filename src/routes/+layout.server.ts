import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import token from '$lib/scripts/validators/token';

export const load: LayoutServerLoad = async (req) => {
	if (req.url.pathname === '/login') return;

	const uId = token(req.cookies.get('token') || '');
	if (!uId) throw redirect(307, '/login');

	return { uId };
};
