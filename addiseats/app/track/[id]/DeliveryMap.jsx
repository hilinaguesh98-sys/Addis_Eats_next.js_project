'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
import { isValidCoordinates } from '../../../lib/location'
import { DELIVERY_ORIGIN, DELIVERY_TRANSIT_DURATION_MS, getDeliveryLocation } from '../../../lib/delivery-locations'

const courierIcon = L.divIcon({
  className: 'delivery-map-icon',
  html: '<span aria-hidden="true" style="display:grid;place-items:center;width:36px;height:36px;background:white;color:white;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px #0004;font-size:18px">🛻</span>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

const deliveryIcon = L.divIcon({
  className: 'delivery-map-icon',
  html: '<span aria-hidden="true" style="display:grid;place-items:center;width:36px;height:36px;background:white;color:white;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px #0004;font-size:18px">🏠</span>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function FitMarkers({ positions }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(L.latLngBounds(positions), { padding: [36, 36], maxZoom: 14 })
  }, [map, positions])
  return null
}

function getPositionAlongRoute(route, progress) {
  if (route.length < 2 || progress <= 0) return route[0]
  if (progress >= 1) return route[route.length - 1]

  const segments = route.slice(1).map((point, index) => ({
    start: route[index],
    end: point,
    distance: L.latLng(route[index]).distanceTo(L.latLng(point)),
  }))
  const totalDistance = segments.reduce((total, segment) => total + segment.distance, 0)
  const targetDistance = totalDistance * progress
  let traversedDistance = 0

  for (const segment of segments) {
    if (traversedDistance + segment.distance >= targetDistance) {
      const segmentProgress = segment.distance === 0
        ? 0
        : (targetDistance - traversedDistance) / segment.distance
      return [
        segment.start[0] + (segment.end[0] - segment.start[0]) * segmentProgress,
        segment.start[1] + (segment.end[1] - segment.start[1]) * segmentProgress,
      ]
    }
    traversedDistance += segment.distance
  }

  return route[route.length - 1]
}

export default function DeliveryMap({
  deliveryCoordinates,
  courierLocation,
  neighborhood,
  originCoordinates,
  status,
  statusUpdatedAt,
}) {
  const origin = isValidCoordinates(originCoordinates) ? originCoordinates : DELIVERY_ORIGIN
  const destination = isValidCoordinates(deliveryCoordinates)
    ? deliveryCoordinates
    : getDeliveryLocation(neighborhood)
  const [now, setNow] = useState(() => Date.now())
  const [route, setRoute] = useState([])
  const [routeLoading, setRouteLoading] = useState(true)
  const [routeError, setRouteError] = useState('')

  useEffect(() => {
    if (!isValidCoordinates(destination)) {
      setRoute([])
      setRouteLoading(false)
      setRouteError('')
      return undefined
    }

    const controller = new AbortController()
    const routeUrl = new URL(
      `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`,
    )
    routeUrl.searchParams.set('overview', 'full')
    routeUrl.searchParams.set('geometries', 'geojson')
    routeUrl.searchParams.set('steps', 'false')

    setRoute([])
    setRouteLoading(true)
    setRouteError('')

    async function loadRoute() {
      try {
        const response = await fetch(routeUrl, { signal: controller.signal })
        if (!response.ok) throw new Error(`Routing service returned ${response.status}`)
        const result = await response.json()
        const coordinates = result.routes?.[0]?.geometry?.coordinates
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
          throw new Error('No drivable route was returned')
        }

        const roadPositions = coordinates.map((coordinate) => {
          if (!Array.isArray(coordinate) || coordinate.length < 2) {
            throw new Error('The routing service returned invalid road geometry')
          }
          const [longitude, latitude] = coordinate
          if (!isValidCoordinates({ latitude, longitude })) {
            throw new Error('The routing service returned invalid road geometry')
          }
          return [Number(latitude), Number(longitude)]
        })
        setRoute(roadPositions)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setRouteError('Could not load a road route. Please refresh the page to try again.')
        }
      } finally {
        if (!controller.signal.aborted) setRouteLoading(false)
      }
    }

    loadRoute()
    return () => controller.abort()
  }, [destination, origin])

  useEffect(() => {
    if (status !== 'On the way' || isValidCoordinates(courierLocation)) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(timer)
  }, [courierLocation, status])

  const endpointPositions = useMemo(() => {
    if (!isValidCoordinates(destination)) return []
    return [
      [Number(origin.latitude), Number(origin.longitude)],
      [Number(destination.latitude), Number(destination.longitude)],
    ]
  }, [destination, origin])

  if (!endpointPositions.length) {
    return <div className="delivery-map-placeholder" role="status">
      Choose a delivery area at checkout to see its route on the map.
    </div>
  }

  if (routeLoading) {
    return <div className="delivery-map-placeholder" role="status">
      Finding a road route...
    </div>
  }

  if (routeError || !route.length) {
    return <div className="delivery-map-placeholder" role="alert">
      {routeError || 'No road route is available for this delivery area.'}
    </div>
  }

  const progress = status === 'Delivered'
    ? 1
    : status === 'On the way'
      ? Math.min(1, Math.max(0, (now - new Date(statusUpdatedAt).getTime()) / DELIVERY_TRANSIT_DURATION_MS))
      : 0
  const simulatedCourier = getPositionAlongRoute(route, progress)
  const markerLocation = status !== 'Delivered' && isValidCoordinates(courierLocation)
    ? [Number(courierLocation.latitude), Number(courierLocation.longitude)]
    : simulatedCourier
  const markerPosition = markerLocation
  const markerTitle = isValidCoordinates(courierLocation) ? 'Last verified courier location' : 'Delivery'

  return <div className="delivery-map-frame" role="group" aria-label="Interactive map showing the dispatch point, road route, and delivery area">
    <MapContainer center={endpointPositions[0]} zoom={13} scrollWheelZoom style={{ height: '360px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitMarkers positions={route} />
      <Polyline positions={route} pathOptions={{ color: '#f47d16', weight: 5 }} />
      <Marker position={markerPosition} icon={courierIcon} title={markerTitle}>
        <Tooltip permanent direction="top">{markerTitle}</Tooltip>
      </Marker>
      <Marker position={endpointPositions[1]} icon={deliveryIcon} title={`Delivery area: ${neighborhood}`}>
        <Tooltip permanent direction="top">{neighborhood || 'Delivery area'}</Tooltip>
      </Marker>
    </MapContainer>
  </div>
}
