export default function TablaResultados() {
  const datos = [
    {
      periodo: 1,
      fecha_pago: '2025-06-01',
      saldo_inicial: 10000,
      interes: 500,
      amortizacion: 1000,
      cuota_total: 1500,
      saldo_final: 9000,
      flujo_emisor: -1500,
      flujo_inversionista: 1450,
      flujo_descuento: 1387.65
    },
    {
      periodo: 2,
      fecha_pago: '2025-12-01',
      saldo_inicial: 9000,
      interes: 450,
      amortizacion: 1000,
      cuota_total: 1450,
      saldo_final: 8000,
      flujo_emisor: -1450,
      flujo_inversionista: 1400,
      flujo_descuento: 1305.22
    }
    // Más filas reales luego...
  ]

  const headers = [
    { key: 'periodo', label: 'Período' },
    { key: 'fecha_pago', label: 'Fecha de Pago' },
    { key: 'saldo_inicial', label: 'Saldo Inicial' },
    { key: 'interes', label: 'Interés' },
    { key: 'amortizacion', label: 'Amortización' },
    { key: 'cuota_total', label: 'Cuota Total' },
    { key: 'saldo_final', label: 'Saldo Final' },
    { key: 'flujo_emisor', label: 'Flujo Emisor' },
    { key: 'flujo_inversionista', label: 'Flujo Inversionista' },
    { key: 'flujo_descuento', label: 'Flujo Descontado' }
  ]

  const formatoMoneda = (valor) =>
    typeof valor === 'number' ? `S/ ${valor.toFixed(2)}` : valor

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full text-sm text-gray-800 bg-white border border-gray-200">
        <thead className="bg-gray-100 text-gray-900 sticky top-0 z-10 shadow-sm">
          <tr>
            {headers.map((h) => (
              <th key={h.key} className="px-4 py-3 text-left font-semibold">
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.map((fila, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {headers.map(({ key }) => (
                <td key={key} className="px-4 py-2 whitespace-nowrap">
                  {formatoMoneda(fila[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
