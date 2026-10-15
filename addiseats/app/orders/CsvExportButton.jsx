'use client'

import { downloadCsv } from '../../lib/csv'
import { etb, when } from '../../lib/format'
import { useState } from 'react'

const columns = [
  { key: 'id', label: 'Order ID' },
  { key: 'date', label: 'Order date (EAT)' },
  { key: 'name', label: 'Customer' },
  { key: 'phone', label: 'Phone' },
  { key: 'neighborhood', label: 'Neighbourhood' },
  { key: 'address', label: 'Delivery address' },
  { key: 'status', label: 'Status' },
  { key: 'total', label: 'Total (ETB)' },
]

export default function CsvExportButton({ orders }) {
  const [feedback, setFeedback] = useState('')

  const exportOrders = () => {
    try {
      const rows = orders.map((order) => ({
        id: order.id,
        date: when(order.createdAt || order.date),
        name: order.name,
        phone: order.phone,
        neighborhood: order.neighborhood || 'Not provided',
        address: order.address,
        status: order.status,
        total: etb(order.total),
      }))
      if (downloadCsv('addiseats-order-history.csv', rows, columns)) {
        setFeedback(`${rows.length} ${rows.length === 1 ? 'order' : 'orders'} exported.`)
      } else {
        setFeedback('CSV export is unavailable in this browser.')
      }
    } catch {
      setFeedback('The CSV export could not be created. Please try again.')
    }
  }

  return <div className="csv-export-control">
    <button className="csv-export-button" type="button" onClick={exportOrders}>Export order history CSV</button>
    <span className="sr-only" role="status" aria-live="polite">{feedback}</span>
  </div>
}
