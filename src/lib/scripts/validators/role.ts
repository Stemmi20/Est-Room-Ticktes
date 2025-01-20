import z from 'zod';

export default z.literal('admin').or(z.literal('teacher')).or(z.literal('supervisor'));
