export function isValidCoordinates(location) {
  if (!location || typeof location !== 'object') return false
  if ([location.latitude, location.longitude].some((value) => (
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
  ))) return false
  const latitude = Number(location.latitude)
  const longitude = Number(location.longitude)
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180
}

export function hasValidTimestamp(value) {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(new Date(value).getTime())
}
