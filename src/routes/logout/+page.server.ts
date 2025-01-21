import { DefaultCookieOpts } from '$lib/scripts/index.js';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async (event) => {
	event.cookies.delete('token', DefaultCookieOpts);

    throw redirect(307, '/login');
};
