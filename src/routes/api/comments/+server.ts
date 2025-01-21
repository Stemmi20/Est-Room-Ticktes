import token from '$lib/scripts/validators/token';
import DataBase from '$lib/server/database';
import { Role, State, type comments, type rooms, type tickets, type users } from '@prisma/client';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const POSTBody = z.object(
	{
		ticketId: z.string({ message: 'Ticket ID must be a string' }),
		content: z.string({ message: 'Content must be a string' }),
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

	if (!(await isAllowed(user, body.data.ticketId))) return error(403, 'Unauthorized');

	const comment = await DataBase.comments.create({
		data: {
			content: body.data.content,
			authorId: Number(uId),
			ticketId: Number(body.data.ticketId),
			creation: String(Date.now()),
		},
	});

	if (comment) return json(comment as POSTResponse);
	return error(500, 'Failed to create comment');
};

export type POSTResponse = comments;

const isAllowed = async (user: users & { rooms: rooms[] }, ticketId: string) => {
	switch (user.role) {
		case Role.admin:
			return true;

		case Role.supervisor: {
			const ticket = await DataBase.tickets.findUnique({
				where: { id: Number(ticketId) },
				include: { room: true },
			});

			if (!ticket) return false;
			if (ticket.room.supervisorId === user.id) return true;
			if (ticket.authorId === user.id) return true;
		}

		default: {
			const ticket = await DataBase.tickets.findUnique({
				where: { id: Number(ticketId) },
				include: { room: true },
			});

			if (!ticket) return false;
			if (ticket.authorId === user.id) return true;

			return false;
		}
	}
};
