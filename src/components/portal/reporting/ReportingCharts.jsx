import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

const AXIS = { stroke: '#4b5563', tick: { fill: '#9ca3af', fontSize: 11 } }
const GRID = { stroke: '#2d3548', strokeDasharray: '3 3' }
const TOOLTIP = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 8 },
  labelStyle: { color: '#e5e7eb' },
  itemStyle: { color: '#e5e7eb' },
}

export const CHART_PALETTE = ['#e5b02d', '#38bdf8', '#a78bfa', '#34d399', '#fb7185', '#fbbf24', '#94a3b8']

export function MonthlyBarChart({ data, dataKey = 'value', xKey = 'name', title }) {
  if (!data?.length) {
    return (
      <div className="h-[260px] flex items-center justify-center rounded-lg border border-dashed border-night-600 text-sm text-gray-500">
        Pas assez de données pour l histogramme.
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-night-600 bg-night-900/40 p-4">
      {title ? <h4 className="text-sm font-semibold text-white mb-3">{title}</h4> : null}
      <div className="h-[240px] sm:h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis
              dataKey={xKey}
              tick={AXIS.tick}
              stroke={AXIS.stroke}
              interval="preserveStartEnd"
              minTickGap={14}
              angle={0}
              textAnchor="middle"
              height={34}
            />
            <YAxis tick={AXIS.tick} stroke={AXIS.stroke} width={36} />
            <Tooltip {...TOOLTIP} />
            <Bar dataKey={dataKey} fill="#e5b02d" radius={[4, 4, 0, 0]} maxBarSize={42} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function DonutPieChart({ data, title }) {
  if (!data?.length) {
    return (
      <div className="h-[260px] flex items-center justify-center rounded-lg border border-dashed border-night-600 text-sm text-gray-500">
        Pas assez de données pour le diagramme.
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-night-600 bg-night-900/40 p-4">
      {title ? <h4 className="text-sm font-semibold text-white mb-3">{title}</h4> : null}
      <div className="h-[240px] sm:h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={88}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
