import token from '$lib/scripts/validators/token';
import DataBase from '$lib/server/database';
import { Role, State, type comments, type rooms, type tickets, type users } from '@prisma/client';
import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const POSTBody = z.object(
	{ roomId: z.string({ message: 'Room ID must be a string' }) },
	{ message: 'Invalid request body' },
);

const DELETEBody = z.object(
	{ roomId: z.string({ message: 'Room ID must be a string' }) },
	{ message: 'Invalid request body' },
);

export const POST: RequestHandler = async (req) => {
	const uId = token(req.request.headers.get('Authorization') || '');
	if (!uId) return error(403, 'Unauthorized');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId), role: Role.admin },
		include: { rooms: true },
	});
	if (!user) return error(403, 'Unauthorized');

	const body = POSTBody.safeParse(await req.request.json().catch(() => ({})));
	if (!body.success) return error(400, body.error.message);

	const room = await DataBase.rooms.create({
		data: { id: body.data.roomId },
	});

	if (room) return json(room as POSTResponse);
	return error(500, 'Failed to create room');
};

export type POSTResponse = rooms;

export const DELETE: RequestHandler = async (req) => {
	const uId = token(req.request.headers.get('Authorization') || '');
	if (!uId) return error(403, 'Unauthorized');

	const user = await DataBase.users.findUnique({
		where: { id: Number(uId), role: Role.admin },
		include: { rooms: true },
	});
	if (!user) return error(403, 'Unauthorized');

	const body = DELETEBody.safeParse(await req.request.json().catch(() => ({})));
	if (!body.success) return error(400, body.error.message);

	const room = await DataBase.rooms.delete({ where: { id: body.data.roomId } });

	return new Response(null, { status: room ? 200 : 500 });
};
