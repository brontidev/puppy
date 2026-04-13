import z from 'zod';

export const typed = <T extends z.ZodType>(value: z.input<T>) => value;

export const role = z.enum(['dom', 'sub']);
export type Role = z.infer<typeof role>;

export const relation = z.object({
	join_code: z.string().nullable(),

	dom_token: z.string(),
	dom_recon_code: z.string(),
	dom_name: z.string(),

	sub_token: z.string(),
	sub_recon_code: z.string(),
	sub_name: z.string()
});

export type Relation = z.output<typeof relation>;
export const client_relation = relation.pick({
	dom_name: true,
	sub_name: true,
	join_code: true
});

export type ClientRelation = Pick<Relation, 'join_code' | 'dom_name' | 'sub_name'>;

export const task = z.object({
	name: z.string(),
	bounty: z.number(),

	created_at: z.date(),
	marked_at: z.date().nullable(),
	is_completed: z.boolean().nullable()
});

export type Task = z.output<typeof task>;
