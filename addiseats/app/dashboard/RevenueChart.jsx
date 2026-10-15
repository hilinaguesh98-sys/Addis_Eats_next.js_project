'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { etb } from '../../lib/format'

function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{label}</strong><p>{etb(payload[0].value)}</p></div>
}

function CountTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{label}</strong><p>{Number(payload[0].value || 0)} orders</p></div>
}

export default function RevenueChart({ revenueData, dailyData }) {
  const revenueWidth = Math.max(
    720,
    revenueData.length * 180,
    ...revenueData.map((row) => row.neighborhood.length * 8 + 160)
  )

  return <div className="dashboard-charts">
    <section className="dashboard-chart-panel" aria-labelledby="revenue-chart-heading">
      <div className="chart-heading">
        <div><h2 id="revenue-chart-heading">Revenue by neighbourhood</h2><p id="revenue-chart-description">Order totals, including delivery fees; cancelled orders are excluded.</p></div>
        <span>ETB</span>
      </div>
      {revenueData.length
        ? <>
          <div className="chart-canvas chart-horizontal-scroll" role="img" aria-label="Bar chart of Ethiopian birr revenue grouped by neighbourhood. A data table follows.">
            <div className="chart-min-width" style={{ width: `max(100%, ${revenueWidth}px)` }}>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={revenueData} margin={{ top: 12, right: 20, left: 12, bottom: 90 }} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="neighborhood" type="category" scale="band" angle={-38} textAnchor="end" interval={0} height={105} tick={{ fontSize: 12 }} />
                  <YAxis width={112} tickFormatter={(value) => etb(value)} />
                  <Tooltip content={<MoneyTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#f47d16" barSize={48} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-table-wrap">
            <table className="chart-data-table">
              <caption>Revenue by neighbourhood data (ETB)</caption>
              <thead><tr><th scope="col">Neighbourhood</th><th scope="col">Revenue</th></tr></thead>
              <tbody>{revenueData.map((row) => <tr key={row.neighborhood}><th scope="row">{row.neighborhood}</th><td>{etb(row.revenue)}</td></tr>)}</tbody>
            </table>
          </div>
        </>
        : <p className="dashboard-chart-empty">No non-cancelled orders to include in revenue.</p>}
    </section>
    <section className="dashboard-chart-panel" aria-labelledby="orders-chart-heading">
      <div className="chart-heading">
        <div><h2 id="orders-chart-heading">Orders per day — Last 7 days (orders)</h2><p id="orders-chart-description">Daily order count using Addis Ababa calendar days (EAT).</p></div>
        <span>Orders / day</span>
      </div>
      <div className="chart-canvas" role="img" aria-label="Line chart showing the number of orders each day during the last seven days. A data table follows.">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={dailyData} margin={{ top: 12, right: 16, left: 4, bottom: 24 }} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={14} />
            <YAxis allowDecimals={false} domain={[0, 'auto']} width={38} />
            <Tooltip content={<CountTooltip />} />
            <Line type="monotone" dataKey="orders" name="Orders" stroke="#f47d16" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-table-wrap">
        <table className="chart-data-table">
          <caption>Orders per day — Last 7 days (orders)</caption>
          <thead><tr><th scope="col">Date (EAT)</th><th scope="col">Orders</th></tr></thead>
          <tbody>{dailyData.map((row) => <tr key={row.date}><th scope="row">{row.label}</th><td>{row.orders}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  </div>
}
