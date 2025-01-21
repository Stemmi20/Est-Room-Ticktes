import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async (req) => {
	return req.fetch('/api/tickets', {
		method: 'PATCH',
		headers: {
			Authorization: req.cookies.get('token') || '',
			'Content-Type': 'application/json',
		},
		body: await req.request.text(),
	});
};

export const DELETE: RequestHandler = async (req) => {
	return req.fetch('/api/tickets', {
		method: 'DELETE',
		headers: {
			Authorization: req.cookies.get('token') || '',
			'Content-Type': 'application/json',
		},
		body: await req.request.text(),
	});
};
