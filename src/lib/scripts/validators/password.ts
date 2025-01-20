import z from 'zod';

export default z
	.string()
	.min(8, { message: 'Password needs to be gte 8 characters' })
	.max(100, { message: 'Password needs to be lte 100 characters' });
