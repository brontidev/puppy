import { command, getRequestEvent, query } from '$app/server';
import z from 'zod';
import { auth, db } from './server/firebase';
import { generate_join_code, generate_login_code } from './server/id';
import { type Relation, type RelationKeys, role } from './firestore-schema';

export const create_relation = command(z.string(), async (dom_name) => {
	const relation_id = crypto.randomUUID();

	const relation: Relation = {
		dom_name,
		puppyscore: 0,
		sub_name: '',
		join_code: generate_join_code()
	};

	const keys: RelationKeys = {
		dom_login_code: generate_login_code(),
		sub_login_code: generate_login_code()
	};

	const relationRef = db.collection('relations').doc(relation_id);
	await relationRef.set(relation);

	const keysRef = db.collection('relation_keys').doc(relation_id);
	await keysRef.set(keys);

	return auth.createCustomToken(`dom:${relation_id}`);
});

export const join_relation = command(
	z.object({ name: z.string(), join_code: z.string() }),
	async ({ join_code, name }) => {
		const relation_response = await db
			.collection('relations')
			.where('join_code', '==', join_code)
			.limit(1)
			.get();

		if (relation_response.empty) return false;

		const relation_ref = relation_response.docs[0].ref;

		await relation_ref.set(
			{
				sub_name: name,
				join_code: null
			} satisfies Partial<Relation>,
			{ merge: true }
		);

		return auth.createCustomToken(`sub:${relation_ref.id}`);
	}
);

export const login = command(
	z.object({ login_code: z.string(), role }),
	async ({ login_code, role }) => {
		const keys_response = await db
			.collection('relation_keys')
			.where(`${role}_login_code`, '==', login_code)
			.limit(1)
			.get();

		if (keys_response.empty) return false;
		return auth.createCustomToken(`${role}:${keys_response.docs[0].id}`);
	}
);
