import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (req) =>
	req.fetch('/api/rooms', {
		headers: { Authorization: req.cookies.get('token') || '', 'Content-Type': 'application/json' },
		method: 'POST',
		body: await req.request.text(),
	});

 
export const DELETE: RequestHandler = async (req) =>
	req.fetch('/api/rooms', {
		headers: { Authorization: req.cookies.get('token') || '', 'Content-Type': 'application/json' },
		method: 'DELETE',
		body: await req.request.text(),
	});