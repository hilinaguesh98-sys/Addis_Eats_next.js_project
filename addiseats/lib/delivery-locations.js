export const DELIVERY_PREPARING_DURATION_MS = 7000
export const DELIVERY_TRANSIT_DURATION_MS = 10000

export const DELIVERY_ORIGIN = {
  name: 'Addis Eats Dispatch · Bole',
  latitude: 8.9956,
  longitude: 38.7858,
}

export const DELIVERY_LOCATIONS = [
  { name: 'Bole', latitude: 8.9952, longitude: 38.7892 },
  { name: 'Piassa', latitude: 9.0351, longitude: 38.7469 },
  { name: 'Kazanchis', latitude: 9.0122, longitude: 38.7666 },
  { name: 'Mexico', latitude: 8.9951, longitude: 38.7412 },
  { name: 'Megenagna', latitude: 9.0127, longitude: 38.8091 },
  { name: 'Gerji', latitude: 8.995, longitude: 38.8315 },
  { name: 'Saris', latitude: 8.9608, longitude: 38.7478 },
  { name: 'CMC', latitude: 9.0305, longitude: 38.8374 },
  { name: 'Old Airport', latitude: 8.9914, longitude: 38.7661 },
]

export function getDeliveryLocation(name) {
  return DELIVERY_LOCATIONS.find((location) => location.name === name) || null
}
