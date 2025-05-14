import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded shadow text-sm">
        <p className="font-semibold text-gray-800">Período {label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-gray-700">
            {entry.name}: <span className="font-medium">S/ {entry.value.toFixed(2)}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function GraficoFlujo() {
  const data = [
    { periodo: 1, emisor: -1500, inversionista: 1450 },
    { periodo: 2, emisor: -1450, inversionista: 1400 },
    { periodo: 3, emisor: -1400, inversionista: 1350 },
    { periodo: 4, emisor: -1350, inversionista: 1300 }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Flujo de Caja: Emisor vs Inversionista</h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="periodo"
            tick={{ fill: '#374151', fontSize: 12 }}
            label={{ value: 'Período', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis
            tick={{ fill: '#374151', fontSize: 12 }}
            label={{
              value: 'Flujo (S/)',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fill: '#374151',
              fontSize: 12
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="emisor"
            stroke="#dc2626"
            name="Emisor"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="inversionista"
            stroke="#059669"
            name="Inversionista"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
