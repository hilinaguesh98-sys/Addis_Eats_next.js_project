export const ORDER_STATUSES = ['Preparing', 'On the way', 'Delivered', 'Cancelled']

const STATUS_DURATION = 7000

export function getOrderStatus(order, now = Date.now()) {
  if (!order.automaticStatus || order.status === 'Cancelled') return order.status

  const elapsed = now - order.createdAt
  if (elapsed < STATUS_DURATION) return 'Preparing'
  if (elapsed < STATUS_DURATION * 2) return 'On the way'
  return 'Delivered'
}
