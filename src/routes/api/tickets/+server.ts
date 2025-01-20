import token from '$lib/scripts/validators/token';
import DataBase from '$lib/server/database';
import { Role, State, type tickets, type users } from '@prisma/client';
import { error, json, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (req) => {
	const uId = token(req.cookies.get('token') || '');
	if (!uId) throw redirect(307, '/login');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId) },
		include: { rooms: true },
	});
	if (!user) throw redirect(307, '/login');

	const own = await DataBase.tickets.findMany({
		where: { authorId: Number(uId) },
		include: { author: true },
		orderBy: { creation: 'desc' },
	});

	const rooms = await DataBase.tickets.findMany({
		where: { roomId: { in: user.rooms.map((r) => r.id) } },
		include: { author: true },
		orderBy: { creation: 'desc' },
	});

	[own, rooms].forEach((c) =>
		c.forEach((r) => {
			r.author.password = '';
			r.author.email = '';
		}),
	);

	return json({ own, rooms: user.role === 'teacher' ? null : rooms } as GETResponse);
};

export interface GETResponse {
	own: (tickets & { author: users })[];
	rooms: (tickets & { author: users })[] | null;
}

const POSTBody = z.object(
	{
		roomId: z.string({ message: 'Room ID must be a string' }),
		title: z.string({ message: 'Title must be a string' }),
		desc: z.string({ message: 'Description must be a string' }),
	},
	{ message: 'Invalid request body' },
);

export const POST: RequestHandler = async (req) => {
	const uId = token(req.cookies.get('token') || '');
	if (!uId) throw redirect(307, '/login');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId) },
		include: { rooms: true },
	});
	if (!user) throw redirect(307, '/login');

	const body = POSTBody.safeParse(await req.request.json().catch(() => ({})));
	if (!body.success) return error(400, body.error.message);

	const room = user.rooms.find((r) => r.id === body.data.roomId);
	if (!room) return error(400, 'Room does not exist');

	const ticket = await DataBase.tickets.create({
		data: {
			roomId: body.data.roomId,
			title: body.data.title,
			desc: body.data.desc,
			authorId: Number(uId),
			state: State.OPEN,
			creation: String(Date.now()),
		},
	});

	if (ticket) return json(ticket as POSTResponse);
	return error(500, 'Failed to create ticket');
};

export type POSTResponse = tickets;

const PATCHBody = z.object(
	{
		ticketId: z.number({ message: 'Ticket ID must be a number' }),
		state: z.enum([State.OPEN, State.DONE, State.INPROGRESS], {
			message: 'State must be either OPEN, DONE or INPROGRESS',
		}),
	},
	{ message: 'Invalid request body' },
);

export const PATCH: RequestHandler = async (req) => {
	const uId = token(req.cookies.get('token') || '');
	if (!uId) throw redirect(307, '/login');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId) },
		include: { rooms: true },
	});
	if (!user) throw redirect(307, '/login');
	if (![Role.supervisor, Role.admin].map((r) => r.toString()).includes(user.role)) {
		return error(403, 'Unauthorized');
	}

	const body = PATCHBody.safeParse(await req.request.json().catch(() => ({})));
	if (!body.success) return error(400, body.error.message);

	const ticket = await DataBase.tickets.update({
		where: { id: body.data.ticketId },
		data: { state: body.data.state },
	});

	if (ticket) return json(ticket as PATCHResponse);
	return error(500, 'Failed to create ticket');
};

export type PATCHResponse = tickets;
