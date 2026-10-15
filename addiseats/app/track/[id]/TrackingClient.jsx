'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { etb, relative, when } from '../../../lib/format'
import { hasValidTimestamp, isValidCoordinates } from '../../../lib/location'
import { DELIVERY_ORIGIN, getDeliveryLocation } from '../../../lib/delivery-locations'
import { ORDER_STATUSES } from '../../../lib/order-statuses'
import '../tracking.css'

const DeliveryMap = dynamic(() => import('./DeliveryMap'), {
  ssr: false,
  loading: () => <div className="delivery-map-placeholder" role="status">Loading delivery map…</div>,
})

const finishedStatuses = new Set(['Delivered', 'Cancelled'])

function validHistory(history, status, updatedAt) {
  const entries = Array.isArray(history)
    ? history.filter((entry) => ORDER_STATUSES.includes(entry?.status) && hasValidTimestamp(entry.updatedAt))
    : []
  return entries.length ? entries : [{ status, updatedAt }]
}

export default function TrackingClient({ initialOrder }) {
  const initialUpdatedAt = initialOrder.updatedAt || initialOrder.createdAt
  const [status, setStatus] = useState(initialOrder.status)
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt)
  const [history, setHistory] = useState(() => validHistory(initialOrder.statusHistory, initialOrder.status, initialUpdatedAt))
  const [courierLocation, setCourierLocation] = useState(() => (
    isValidCoordinates(initialOrder.courierLocation) ? initialOrder.courierLocation : null
  ))
  const [connection, setConnection] = useState(finishedStatuses.has(initialOrder.status) ? 'closed' : 'connecting')
  const [now, setNow] = useState(null)
  const latestVersion = useRef(Number(initialOrder.version) || 0)
  const latestUpdatedAt = useRef(initialUpdatedAt)
  const latestLocationAt = useRef(initialOrder.courierLocation?.updatedAt || '')

  useEffect(() => {
    setNow(Date.now())
    const timer = window.setInterval(() => setNow(Date.now()), 15000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (finishedStatuses.has(initialOrder.status)) return undefined

    const source = new EventSource(`/api/orders/${encodeURIComponent(initialOrder.id)}/stream`)
    source.onopen = () => setConnection('connected')
    source.onerror = () => {
      setConnection(source.readyState === EventSource.CLOSED ? 'disconnected' : 'reconnecting')
    }

    const onCourierLocation = (event) => {
      try {
        const payload = JSON.parse(event.data)
        const location = payload.courierLocation
        if (payload.orderId !== initialOrder.id
          || Number(payload.version) !== latestVersion.current
          || !isValidCoordinates(location)
          || !hasValidTimestamp(location.updatedAt)
          || new Date(location.updatedAt).getTime() <= new Date(latestLocationAt.current || 0).getTime()) return
        latestLocationAt.current = location.updatedAt
        setCourierLocation(location)
      } catch {
        setConnection('reconnecting')
      }
    }

    const onStatus = (event) => {
      try {
        const payload = JSON.parse(event.data)
        const incomingVersion = Number(payload.version)
        const incomingTime = payload.updatedAt
        const incomingStatus = payload.status
        if (payload.orderId !== initialOrder.id
          || !Number.isSafeInteger(incomingVersion)
          || incomingVersion < latestVersion.current
          || !ORDER_STATUSES.includes(incomingStatus)
          || !hasValidTimestamp(incomingTime)
          || new Date(incomingTime).getTime() < new Date(latestUpdatedAt.current).getTime()) return

        if (incomingVersion === latestVersion.current) return
        latestVersion.current = incomingVersion
        latestUpdatedAt.current = incomingTime
        setStatus(incomingStatus)
        setUpdatedAt(incomingTime)
        setHistory(validHistory(payload.statusHistory, incomingStatus, incomingTime))

        if (finishedStatuses.has(incomingStatus)) {
          source.close()
          setConnection('closed')
        }
      } catch {
        setConnection('reconnecting')
      }
    }
    source.addEventListener('status', onStatus)
    source.addEventListener('courier-location', onCourierLocation)

    return () => {
      source.removeEventListener('status', onStatus)
      source.removeEventListener('courier-location', onCourierLocation)
      source.close()
    }
  }, [initialOrder.id, initialOrder.status])

  const connectionLabel = connection === 'connected'
    ? 'Connected — live updates are available'
    : connection === 'reconnecting'
      ? 'Reconnecting to live updates…'
      : connection === 'disconnected'
        ? 'Disconnected — showing the last server update'
        : connection === 'closed'
          ? status === 'Delivered' ? 'Tracking complete — delivery delivered' : 'Tracking closed'
          : 'Connecting to live updates…'

  return <div className="page-wrap container">
    <Link className="back" href={`/orders/${encodeURIComponent(initialOrder.id)}`}>← Order details</Link>
    <div className="page-title">
      <p className="eyebrow">LIVE DELIVERY TRACKING</p>
      <h1>Order #{initialOrder.id}</h1>
      <p>Follow your order from the Bole dispatch point to your selected delivery area.</p>
    </div>
    <section className="tracking-live-status" aria-live="polite">
      <div><span className="tracking-status-label">Current status</span><h2>{status}</h2><p>Updated {now === null ? when(updatedAt) : `${relative(updatedAt, now)} · ${when(updatedAt)}`} (EAT)</p></div>
      <span className={`tracking-connection tracking-connection-${connection}`} role="status"><span aria-hidden="true">●</span> {connectionLabel}</span>
    </section>
    <div className="delivery-tracking-layout">
      <section className="delivery-map-panel" aria-labelledby="delivery-map-heading">
        <h2 id="delivery-map-heading">Delivery route</h2>
        <DeliveryMap
          deliveryCoordinates={initialOrder.deliveryCoordinates || getDeliveryLocation(initialOrder.neighborhood)}
          courierLocation={courierLocation}
          neighborhood={initialOrder.neighborhood}
          originCoordinates={initialOrder.originCoordinates || DELIVERY_ORIGIN}
          status={status}
          statusUpdatedAt={updatedAt}
        />
        {courierLocation
          ? <p className="delivery-map-note">Last verified courier GPS: {courierLocation.latitude}, {courierLocation.longitude} · {when(courierLocation.updatedAt)} (EAT).</p>
          : <p className="delivery-map-note">The moving courier pin follows a demo route between approximate area centres; this is not live GPS. Preparing lasts 7 seconds; the route simulation then runs for 7 seconds before delivery.</p>}
      </section>
      <aside className="delivery-address-panel" aria-labelledby="delivery-address-heading">
        <h2 id="delivery-address-heading">Delivery information</h2>
        <dl>
          <div><dt>Recipient</dt><dd>{initialOrder.name}</dd></div>
          <div><dt>Phone</dt><dd>{initialOrder.phone}</dd></div>
          <div><dt>Neighbourhood</dt><dd>{initialOrder.neighborhood || 'Not provided'}</dd></div>
          {initialOrder.address && <div><dt>Delivery address</dt><dd>{initialOrder.address}</dd></div>}
          <div><dt>Order placed</dt><dd>{when(initialOrder.createdAt || initialOrder.date)} (EAT)</dd></div>
          <div><dt>Route</dt><dd>{initialOrder.originCoordinates?.name || DELIVERY_ORIGIN.name} → {initialOrder.neighborhood || 'Delivery area'}</dd></div>
          <div><dt>Courier location</dt><dd>{courierLocation ? `Last verified at ${when(courierLocation.updatedAt)} (EAT)` : status === 'Delivered' ? 'Reached the selected delivery area (demo route).' : 'Simulated route position; live courier GPS is not connected.'}</dd></div>
        </dl>
        <div className="tracking-order-total"><span>Order total</span><strong>{etb(initialOrder.total)}</strong></div>
        <Link className="orange-button" href="/orders">View order history</Link>
      </aside>
    </div>
    <section className="tracking-timeline" aria-labelledby="tracking-timeline-heading">
      <h2 id="tracking-timeline-heading">Order status timeline</h2>
      <ol>
        {history.map((entry, index) => <li key={`${entry.status}-${entry.updatedAt}-${index}`}>
          <strong>{entry.status}</strong>
          <time dateTime={entry.updatedAt}>{when(entry.updatedAt)} (EAT)</time>
        </li>)}
      </ol>
      {status === 'Delivered' && <p role="status">Delivery completed at {when(updatedAt)} (EAT).</p>}
    </section>
  </div>
}
