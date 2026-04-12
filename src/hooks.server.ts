import { validate_key } from '$lib/server/auth'

export async function handle({ event, resolve }) {
    event.locals.auth_view = await validate_key()
    console.log('hook', event.locals.auth_view)

    return resolve(event)
}