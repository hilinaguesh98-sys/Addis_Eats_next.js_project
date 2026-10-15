import { getOrderForSession } from '../../../../../lib/orders'
import { getSession } from '../../../../../lib/session'
import { hasValidTimestamp, isValidCoordinates } from '../../../../../lib/location'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const encoder = new TextEncoder()
const terminalStatuses = new Set(['Delivered', 'Cancelled'])

function eventMessage(order) {
  return `id: ${order.id}:${order.version}\nevent: status\ndata: ${JSON.stringify({
    orderId: order.id,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    version: order.version,
    statusHistory: order.statusHistory,
    courierLocation: order.courierLocation || null,
  })}\n\n`
}

function courierLocationMessage(order) {
  return `id: ${order.id}:${order.version}:location:${encodeURIComponent(order.courierLocation.updatedAt)}\nevent: courier-location\ndata: ${JSON.stringify({
    orderId: order.id,
    version: order.version,
    courierLocation: order.courierLocation,
  })}\n\n`
}

export async function GET(request, { params }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const initialOrder = getOrderForSession(id, session)
  if (!initialOrder) return Response.json({ error: 'Order not found' }, { status: 404 })

  let intervalId
  let closed = false
  let previousVersion = null
  let previousLocation
  let controllerRef
  const closeStream = () => {
    if (closed) return
    closed = true
    if (intervalId) clearInterval(intervalId)
    request.signal.removeEventListener('abort', closeStream)
    if (controllerRef) controllerRef.close()
  }
  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller
      const send = (order) => {
        if (closed) return
        const location = order.courierLocation || null
        if (order.version !== previousVersion) {
          previousVersion = order.version
          controller.enqueue(encoder.encode(eventMessage(order)))
        }
        if (location && JSON.stringify(location) !== previousLocation) {
          previousLocation = JSON.stringify(location)
          if (isValidCoordinates(location) && hasValidTimestamp(location.updatedAt)) {
            controller.enqueue(encoder.encode(courierLocationMessage(order)))
          }
        }
        if (terminalStatuses.has(order.status)) {
          closeStream()
        }
      }

      request.signal.addEventListener('abort', closeStream, { once: true })
      send(initialOrder)
      if (closed) return

      intervalId = setInterval(() => {
        if (request.signal.aborted) {
          closeStream()
          return
        }
        const order = getOrderForSession(id, session)
        if (!order) {
          closeStream()
          return
        }
        send(order)
      }, 1000)
    },
    cancel() {
      closeStream()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
