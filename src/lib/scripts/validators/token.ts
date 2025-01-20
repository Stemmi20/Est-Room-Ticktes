import { SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

export default (token: string): false | string => {
	if (!token) return false;
	if (!jwt.verify(token, SECRET)) return false;
	return String(jwt.decode(token, { json: true })?.id);
};
