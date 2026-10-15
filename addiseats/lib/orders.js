import { dishes, getImageUrl } from './data'
import { DELIVERY_PREPARING_DURATION_MS, DELIVERY_TRANSIT_DURATION_MS, getDeliveryLocation } from './delivery-locations'
import { getOrderStatus, ORDER_STATUSES } from './order-statuses'

const store = globalThis.__addisOrders || (globalThis.__addisOrders = new Map())
const idempotencyStore = globalThis.__addisOrderIdempotency || (globalThis.__addisOrderIdempotency = new Map())

export class IdempotencyConflictError extends Error {
  constructor() {
    super('This idempotency key was already used for a different order.')
    this.name = 'IdempotencyConflictError'
  }
}

export class FinalizedOrderStatusError extends Error {
  constructor() {
    super('Delivered or cancelled orders cannot be changed.')
    this.name = 'FinalizedOrderStatusError'
  }
}

export function createOrder(payload, idempotencyKey) {
  if (!payload.userId) throw new Error('An authenticated order owner is required.')

  const requestSignature = JSON.stringify({
    name: payload.name,
    phone: payload.phone,
    neighborhood: payload.neighborhood,
    items: payload.items.map(({ id, qty }) => ({ id, qty })),
  })
  const requestKey = `${payload.userId}:${idempotencyKey}`
  const previousRequest = idempotencyStore.get(requestKey)
  if (previousRequest) {
    if (previousRequest.requestSignature !== requestSignature) throw new IdempotencyConflictError()
    const previousOrder = store.get(previousRequest.orderId)
    if (previousOrder) return publicOrder(advanceOrderProgress(previousOrder))
  }

  const items = payload.items.map((item) => {
    const dish = dishes.find((entry) => entry.id === item.id)
    if (!dish) return null
    return { id: dish.id, name: dish.name, price: dish.price, image: getImageUrl(dish.image), imageWidth: dish.image.width, imageHeight: dish.image.height, qty: Number(item.qty) }
  }).filter(Boolean)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const total = subtotal + 80

  const existingNumbers = [...store.values()]
    .map((order) => Number(String(order.id).replace(/^AE\s*[-]?/i, '')))
    .filter((value) => Number.isFinite(value))

  const nextNumber = existingNumbers.length ? Math.max(...existingNumbers) + 1 : 12
  const id = `AE${nextNumber}`
  const createdAt = new Date().toISOString()

  const order = {
    id,
    userId: payload.userId,
    name: payload.name,
    phone: payload.phone,
    address: payload.address || '',
    neighborhood: String(payload.neighborhood || 'Not provided').trim() || 'Not provided',
    originCoordinates: payload.originCoordinates || null,
    deliveryCoordinates: payload.deliveryCoordinates || getDeliveryLocation(payload.neighborhood) || null,
    items,
    subtotal,
    delivery: 80,
    total,
    status: 'Preparing',
    date: createdAt,
    createdAt,
    updatedAt: createdAt,
    version: 1,
    statusHistory: [{ status: 'Preparing', updatedAt: createdAt }],
  }
  store.set(id, order)
  idempotencyStore.set(requestKey, { requestSignature, orderId: id })
  return publicOrder(order)
}

function publicOrder({ userId, ...order }) {
  return { ...order, status: getOrderStatus(order) }
}

function advanceOrderProgress(order) {
  if (['Delivered', 'Cancelled'].includes(order.status)) return order

  let current = order
  const createdAt = new Date(order.createdAt).getTime()
  const now = Date.now()

  if (current.status === 'Preparing' && now - createdAt >= DELIVERY_PREPARING_DURATION_MS) {
    current = recordStatus(current, 'On the way', new Date(createdAt + DELIVERY_PREPARING_DURATION_MS).toISOString())
  }

  if (current.status === 'On the way') {
    const departureAt = new Date(current.updatedAt).getTime()
    if (now - departureAt >= DELIVERY_TRANSIT_DURATION_MS) {
      current = recordStatus(current, 'Delivered', new Date(departureAt + DELIVERY_TRANSIT_DURATION_MS).toISOString())
    }
  }

  if (current !== order) store.set(order.id, current)
  return current
}

function recordStatus(order, status, updatedAt) {
  return {
    ...order,
    status,
    updatedAt,
    version: (order.version || 0) + 1,
    statusHistory: [...(order.statusHistory || []), { status, updatedAt }],
  }
}

export function getOrderForUser(id, userId) {
  const order = store.get(id)
  return order?.userId === userId ? publicOrder(advanceOrderProgress(order)) : null
}

export function getOrderForSession(id, session) {
  if (!session?.id) return null
  if (session.role === 'staff') {
    const order = store.get(id)
    return order ? publicOrder(advanceOrderProgress(order)) : null
  }
  return getOrderForUser(id, session.id)
}

export function getOrder(id) {
  const order = store.get(id)
  return order ? publicOrder(advanceOrderProgress(order)) : null
}

export function getOrdersForUser(userId) {
  return [...store.values()]
    .filter((order) => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((order) => publicOrder(advanceOrderProgress(order)))
}

export function getOrders() {
  return [...store.values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((order) => publicOrder(advanceOrderProgress(order)))
}

export function updateOrderStatus(id, status) {
  if (status !== 'Cancelled') return null
  const storedOrder = store.get(id)
  const order = storedOrder ? advanceOrderProgress(storedOrder) : null
  if (!order) return null
  if (order.status === status) return publicOrder(order)
  if (['Delivered', 'Cancelled'].includes(order.status)) throw new FinalizedOrderStatusError()

  const updatedOrder = recordStatus(order, status, new Date().toISOString())
  store.set(id, updatedOrder)
  return publicOrder(updatedOrder)
}

export { ORDER_STATUSES }
