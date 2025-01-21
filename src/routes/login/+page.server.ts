import { invalidateAll } from '$app/navigation';
import { SALT_ROUNDS, SECRET } from '$env/static/private';
import { DefaultCookieOpts } from '$lib/scripts';
import EmailValidator from '$lib/scripts/validators/email';
import PasswordValidator from '$lib/scripts/validators/password';
import RoleValidator from '$lib/scripts/validators/role';
import DataBase from '$lib/server/database';
import { fail, json, redirect, type Actions } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async (event) => {
	const rooms = await DataBase.rooms.findMany({
		where: {},
	});

	return {
		rooms: rooms?.filter((r) => !r.supervisorId).map((r) => r.id),
	};
};

const LoginPayload = z.object({
	email: EmailValidator,
	password: PasswordValidator,
});

const RegisterPayload = z.object({
	password: PasswordValidator,
	email: EmailValidator,
	firstName: z
		.string({ message: 'First name must be a string' })
		.min(2, { message: 'First name must be gte 2 characters' })
		.max(50, { message: 'First name must be lte 50 characters' }),
	lastName: z
		.string({ message: 'Last name must be a string' })
		.min(2, { message: 'Last name must be gte 2 characters' })
		.max(50, { message: 'Last name must be lte 50 characters' }),
	address: z
		.string({ message: 'Address must be a string' })
		.min(2, { message: 'Address must be gte 2' })
		.max(50, { message: 'Address must be lte 50' }),
	role: RoleValidator,
	rooms: z.array(z.string()),
});

export const actions = {
	login: async ({ cookies, request }) => {
		const body = await request
			.formData()
			.then((r) => LoginPayload.safeParse(Object.fromEntries(r as never)));
		if (!body.success) return fail(400, { message: body.error.message });

		const user = await DataBase.users.findFirst({
			where: { email: body.data.email },
			select: { password: true, id: true },
		});
		if (!user) return fail(400, { message: 'User does not exist' });

		const match = await bcrypt.compare(body.data.password, user.password);
		if (!match) return fail(403, { message: 'Incorrect Password' });

		cookies.set(
			'token',
			jwt.sign({ id: user.id }, SECRET, { expiresIn: 86400 * 7 }),
			DefaultCookieOpts,
		);

		throw redirect(307, '/?reload=true');
	},
	register: async ({ cookies, request }) => {
		const formData = await request.formData();

		const rooms = formData.getAll('room') as string[];

		const body = RegisterPayload.safeParse({ ...Object.fromEntries(formData as never), rooms });
		if (!body.success) return fail(400, { message: body.error.message });

		const { password, email, firstName, lastName } = body.data;

		const exists = await DataBase.users.findFirst({ where: { email }, select: { email: true } });
		if (exists) return fail(401, { message: 'Email is already registered' });

		const hashed = await bcrypt.hash(password, Number(SALT_ROUNDS));
		const user = await DataBase.users.create({
			data: {
				email,
				password: hashed,
				firstName,
				lastName,
				role: body.data.role,
				address: body.data.address,
			},
			select: { id: true },
		});

		await DataBase.rooms.updateMany({
			where: { id: { in: rooms } },
			data: { supervisorId: user.id },
		});

		cookies.set(
			'token',
			jwt.sign({ id: user.id }, SECRET, { expiresIn: 86400 * 7 }),
			DefaultCookieOpts,
		);

		throw redirect(307, '/?reload=true');
	},
} satisfies Actions;
