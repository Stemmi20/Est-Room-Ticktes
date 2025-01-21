import token from '$lib/scripts/validators/token';
import DataBase from '$lib/server/database';
import { Role, State, type comments, type tickets, type users } from '@prisma/client';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (req) => {
	const uId = token(req.request.headers.get('Authorization') || '');
	if (!uId) return error(403, 'Unauthorized');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId) },
		include: { rooms: true },
	});
	if (!user) return error(403, 'Unauthorized');

	const own = await DataBase.tickets.findMany({
		where: { authorId: Number(uId) },
		include: {
			author: { omit: { password: true, email: true } },
			comments: {
				orderBy: { creation: 'desc' },
				include: { author: { omit: { password: true, email: true } } },
			},
		},
		orderBy: { creation: 'asc' },
	});

	const rooms = await DataBase.tickets.findMany({
		where: user.role === Role.admin ? {} : { roomId: { in: user.rooms.map((r) => r.id) } },
		include: {
			author: { omit: { password: true, email: true } },
			comments: {
				orderBy: { creation: 'desc' },
				include: { author: { omit: { password: true, email: true } } },
			},
		},
		orderBy: { creation: 'asc' },
	});

	return json({ own, rooms: user.role === 'teacher' ? null : rooms } as GETResponse);
};

export interface GETResponse {
	own: (tickets & { author: Omit<users, 'password' | 'email'> } & {
		comments: (comments & { author: Omit<users, 'password' | 'email'> })[];
	})[];
	rooms:
		| (tickets & { author: Omit<users, 'password' | 'email'> } & {
				comments: (comments & { author: Omit<users, 'password' | 'email'> })[];
		  })[]
		| null;
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
	const uId = token(req.request.headers.get('Authorization') || '');
	if (!uId) return error(403, 'Unauthorized');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId) },
		include: { rooms: true },
	});
	if (!user) return error(403, 'Unauthorized');

	const body = POSTBody.safeParse(await req.request.json().catch(() => ({})));
	if (!body.success) return error(400, body.error.message);

	const room = await DataBase.rooms.findUnique({ where: { id: body.data.roomId } });
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
	const uId = token(req.request.headers.get('Authorization') || '');
	if (!uId) return error(403, 'Unauthorized');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId), role: { in: [Role.supervisor, Role.admin] } },
		include: { rooms: true },
	});
	if (!user) return error(403, 'Unauthorized');
	if (![Role.supervisor, Role.admin].map((r) => r.toString()).includes(user.role)) {
		return error(403, 'Unauthorized');
	}

	const body = PATCHBody.safeParse(await req.request.json().catch(() => ({})));
	if (!body.success) return error(400, body.error.message);

	const ticket = await DataBase.tickets.findUnique({ where: { id: body.data.ticketId } });

	const room = await DataBase.rooms.findUnique({ where: { id: ticket?.roomId } });
	if (room?.supervisorId !== Number(uId)) return error(403, 'Unauthorized');

	await DataBase.tickets.update({
		where: { id: body.data.ticketId },
		data: { state: body.data.state },
	});

	if (ticket) return json(ticket as PATCHResponse);
	return error(500, 'Failed to edit ticket');
};

export type PATCHResponse = tickets;

const DELETEBody = z.object(
	{
		ticketId: z.number({ message: 'Ticket ID must be a number' }),
	},
	{ message: 'Invalid request body' },
);

export const DELETE: RequestHandler = async (req) => {
	const uId = token(req.request.headers.get('Authorization') || '');
	if (!uId) return error(403, 'Unauthorized');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId), role: { in: [Role.supervisor, Role.admin] } },
		include: { rooms: true },
	});
	if (user?.role !== Role.admin) return error(403, 'Unauthorized');

	const body = DELETEBody.safeParse(await req.request.json().catch(() => ({})));
	if (!body.success) return error(400, body.error.message);

	const ticket = await DataBase.tickets.findUnique({ where: { id: body.data.ticketId } });
	if (!ticket) return error(404, 'Ticket not found');

	await DataBase.tickets.delete({ where: { id: body.data.ticketId } });
	return new Response(null, { status: 204 });
};
