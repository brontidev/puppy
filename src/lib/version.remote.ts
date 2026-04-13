import { prerender } from '$app/server';
import { version } from '../../package.json';

export const get_app_version = prerender(async () => {
	return version;
});
