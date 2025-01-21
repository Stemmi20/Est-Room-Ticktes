import token from '$lib/scripts/validators/token.js';
import DataBase from '$lib/server/database';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import type { PageServerLoad } from './$types.js';
import type { GETResponse } from './api/tickets/+server.js';

export const load: PageServerLoad = async (event) => {
	if (!event.cookies.get('token')) throw redirect(307, '/login');

	const data = await event
		.fetch('/api/tickets', {
			headers: { 'Content-Type': 'application/json', Authorization: event.cookies.get('token') || '' },
		})
		.then((r) => (r.ok ? (r.json() as Promise<GETResponse>) : { own: [], rooms: [] }));

	const rooms = await DataBase.rooms.findMany({ where: {} });

	const user = await DataBase.users.findUnique({
		where: { id: Number(token(event.cookies.get('token') || '')) },
		omit: { password: true },
		include: { rooms: true },
	});

	return {
		tickets: data,
		allRooms: rooms,
		rooms: rooms?.filter((r) => !r.supervisorId).map((r) => r.id),
		user,
	};
};

const CreatePayload = z.object({
	title: z.string(),
	desc: z.string(),
	room: z.string(),
});

const CommentPayload = z.object({
	content: z.string(),
	ticket: z.string(),
});

export const actions = {
	create: async ({ cookies, request, fetch }) => {
		const uId = token(cookies.get('token') || '');
		if (!uId) throw redirect(307, '/login');

		const formData = await request.formData();
		const body = CreatePayload.safeParse(Object.fromEntries(formData as never));
		if (!body.success) return fail(400, { message: body.error.message });

		console.log(body);

		const res = await fetch('/api/tickets', {
			method: 'POST',
			headers: { Authorization: cookies.get('token') || '' },
			body: JSON.stringify({
				roomId: body.data.room,
				title: body.data.title,
				desc: body.data.desc,
			}),
		});

		return { success: res.ok };
	},
	comment: async ({ cookies, request, fetch }) => {
		const uId = token(cookies.get('token') || '');
		if (!uId) throw redirect(307, '/login');

		const formData = await request.formData();
		const body = CommentPayload.safeParse(Object.fromEntries(formData as never));
		console.log(body.error);
		if (!body.success) return fail(400, { message: body.error.message });

		const res = await fetch('/api/comments', {
			method: 'POST',
			headers: { Authorization: cookies.get('token') || '' },
			body: JSON.stringify({
				ticketId: body.data.ticket,
				content: body.data.content,
			}),
		});

		return { success: res.ok };
	},
} satisfies Actions;
