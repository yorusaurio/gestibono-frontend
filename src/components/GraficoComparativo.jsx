import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

export default function GraficoComparativo() {
  const data = [
    { periodo: 1, saldo: 10000, interes: 500, amortizacion: 1000 },
    { periodo: 2, saldo: 9000, interes: 450, amortizacion: 1000 },
    { periodo: 3, saldo: 8000, interes: 400, amortizacion: 1000 }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Comparación de Componentes por Período</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="periodo"
            tick={{ fill: '#374151', fontSize: 12 }}
            label={{ value: 'Período', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis
            tick={{ fill: '#374151', fontSize: 12 }}
            label={{
              value: 'Monto (S/)',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fill: '#374151',
              fontSize: 12
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="saldo" fill="#2563eb" name="Saldo" radius={[4, 4, 0, 0]} />
          <Bar dataKey="interes" fill="#f59e0b" name="Interés" radius={[4, 4, 0, 0]} />
          <Bar dataKey="amortizacion" fill="#16a34a" name="Amortización" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
