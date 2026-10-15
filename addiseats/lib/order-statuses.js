export const ORDER_STATUSES = ['Preparing', 'On the way', 'Delivered', 'Cancelled']

export function getOrderStatus(order) {
  return order?.status || 'Preparing'
}
