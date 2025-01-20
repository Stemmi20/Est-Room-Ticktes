import type { GETResponse } from './api/tickets/+server.js';
import type { PageServerLoad } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { SALT_ROUNDS, SECRET } from '$env/static/private';
import { DefaultCookieOpts } from '$lib/scripts';
import EmailValidator from '$lib/scripts/validators/email';
import PasswordValidator from '$lib/scripts/validators/password';
import RoleValidator from '$lib/scripts/validators/role';
import DataBase from '$lib/server/database';
import { fail, json, type Actions } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const load: PageServerLoad = async (event) => {
	if (!event.cookies.get('token')) throw redirect(307, '/login');

	const data = await event
		.fetch('/api/tickets', { headers: { 'Content-Type': 'application/json' } })
		.then((r) => (r.ok ? (r.json() as Promise<GETResponse>) : { own: [], rooms: [] }));

	const rooms = await DataBase.rooms.findMany({
		where: {},
	});

	return { rooms: rooms?.filter((r) => !r.supervisorId).map((r) => r.id), tickets: data };
};

const CreatePayload = z.object({
	title: z.string(),
	desc: z.string(),
	rooms: z.array(z.string()),
});

export const actions = {
	create: async ({ cookies, request }) => {
		const body = await request.formData().then((r) => Object.fromEntries(r as never));
		console.log(body);

		// const body = await request
		// 	.formData()
		// 	.then((r) => CreatePayload.safeParse(Object.fromEntries(r as never)));
		// if (!body.success) return fail(400, { message: body.error.message });

		// const user = await DataBase.users.findFirst({
		// 	where: { email: body.data.email },
		// 	select: { password: true, id: true },
		// });
		// if (!user) return fail(400, { message: 'User does not exist' });

		// const match = await bcrypt.compare(body.data.password, user.password);
		// if (!match) return fail(403, { message: 'Incorrect Password' });

		// cookies.set(
		// 	'token',
		// 	jwt.sign({ id: user.id }, SECRET, { expiresIn: 86400 * 7 }),
		// 	DefaultCookieOpts,
		// );
	},
} satisfies Actions;
