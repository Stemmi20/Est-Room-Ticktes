import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DefaultCookieOpts } from '$lib/scripts';

export const POST: RequestHandler = async (req) => {
	req.cookies.delete('token', DefaultCookieOpts);

	return json({ success: true });
};
