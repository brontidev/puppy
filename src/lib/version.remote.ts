import { prerender } from '$app/server';
import packageJson from '../../package.json';

export const get_app_version = prerender(async () => {
	return packageJson.version;
});
