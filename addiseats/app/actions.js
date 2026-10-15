'use server'

import { revalidatePath } from 'next/cache'
import { getDish } from '../lib/data'
import { DELIVERY_ORIGIN, getDeliveryLocation } from '../lib/delivery-locations'
import { createOrder, updateOrderStatus as saveOrderStatus, ORDER_STATUSES } from '../lib/orders'
import { getSession } from '../lib/session'

export async function placeOrder(input, idempotencyKey) {
  const session = await getSession()
  if (!session) return { error: 'Sign in before placing an order.' }
  if (typeof idempotencyKey !== 'string' || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
    return { error: 'Your order request could not be verified. Please try again.' }
  }

  const name = String(input?.name || '').trim()
  const phone = String(input?.phone || '').trim()
  const neighborhood = String(input?.neighborhood || '').trim()
  if (!name || !phone || !neighborhood) return { error: 'Name, phone and neighbourhood are required.' }
  const deliveryLocation = getDeliveryLocation(neighborhood)
  if (!deliveryLocation) return { error: 'Choose a delivery area from the available locations.' }
  if (!Array.isArray(input?.items) || input.items.length === 0) return { error: 'Your cart is empty.' }
  const items = input.items.map((item) => ({ id: String(item.id), qty: Number(item.qty) }))
  for (const item of items) {
    if (!getDish(item.id) || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 20) return { error: 'Invalid cart item.' }
  }
  try {
    return {
      order: createOrder({
        items,
        name,
        phone,
        neighborhood,
        deliveryCoordinates: deliveryLocation,
        originCoordinates: DELIVERY_ORIGIN,
        userId: session.id,
      }, idempotencyKey),
    }
  } catch (error) {
    if (error?.name === 'IdempotencyConflictError') {
      return { error: 'This order request was already used with different details. Please refresh your cart and try again.' }
    }
    throw error
  }
}

export async function updateOrderStatus(orderId, status) {
  const session = await getSession()
  if (!session || session.role !== 'staff') return { error: 'Only staff can cancel orders.' }
  if (typeof orderId !== 'string' || !orderId.trim() || status !== 'Cancelled' || !ORDER_STATUSES.includes(status)) {
    return { error: 'Staff can only cancel orders.' }
  }

  let order
  try {
    order = saveOrderStatus(orderId, status)
  } catch (error) {
    if (error?.name === 'FinalizedOrderStatusError') return { error: error.message }
    throw error
  }
  if (!order) return { error: 'Order not found.' }

  revalidatePath('/kitchen')
  revalidatePath('/dashboard')
  revalidatePath('/orders')
  revalidatePath(`/orders/${orderId}`)
  revalidatePath(`/track/${orderId}`)
  revalidatePath(`/order-confirmation/${orderId}`)
  return { order }
}
