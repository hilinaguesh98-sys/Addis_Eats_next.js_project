import { scryptSync, timingSafeEqual } from 'node:crypto'

const users = [
  {
    id: 'user-customer-1',
    name: 'Hilina Guesh',
    email: 'hilina@gmail.com',
    role: 'customer',
    salt: 'customer-demo-salt',
    passwordHash: '531c10c661219262468725613727515cfa6669005beae561e1ab6ddf614d50c235ddb36aa725bd6f6e0b65e635ba09e19592b71b1ddcbbdc2e499dae17ba96a9'
  },
  {
    id: 'user-staff-1',
    name: 'Addis Eats Staff',
    email: 'stuff@gmail.com',
    role: 'staff',
    salt: 'staff-demo-salt',
    passwordHash: '230103efe7f9bd85f455179862ea750a2831b5d72152e64e099ca8def9cc4ca259d4aaf565fa43ffacba9b2a0fa34830acdac44b1992b03599e458e748f4e184'
  }
]

const dummyHash = Buffer.from(users[0].passwordHash, 'hex')

export function authenticateUser(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') return null

  const normalizedEmail = email.trim().toLowerCase()
  const user = users.find((entry) => entry.email === normalizedEmail)
  const expected = user ? Buffer.from(user.passwordHash, 'hex') : dummyHash
  const salt = user ? user.salt : 'unknown-user-salt'
  const actual = scryptSync(password, salt, expected.length)

  if (!timingSafeEqual(actual, expected) || !user) return null
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}