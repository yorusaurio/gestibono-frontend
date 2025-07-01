'use client'

import { useEffect, useState } from 'react'

export default function TablaResultados() {
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculoBono = sessionStorage.getItem('calculoBono')
    if (calculoBono) {
      const datos = JSON.parse(calculoBono)
      setDatos(datos.resultados || [])
    }
    setLoading(false)
  }, [])

  const headers = [
    { key: 'periodo', label: 'Período' },
    { key: 'saldoInicial', label: 'Saldo Inicial' },
    { key: 'intereses', label: 'Interés' },
    { key: 'amortizacion', label: 'Amortización' },
    { key: 'cuota', label: 'Cuota Total' },
    { key: 'saldoFinal', label: 'Saldo Final' }
  ]

  const formatoMoneda = (valor) =>
    typeof valor === 'number' ? `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : valor

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cargando resultados...</p>
      </div>
    )
  }

  if (datos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay datos para mostrar. Por favor, complete el formulario primero.</p>
      </div>
    )
  }

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
