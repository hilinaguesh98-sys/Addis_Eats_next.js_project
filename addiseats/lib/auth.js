import { getSession } from './session'

export async function requireUser() {
	const session = await getSession()
	if (!session) throw new Error('Unauthorized')
	return session
}

export const getUser = getSession
