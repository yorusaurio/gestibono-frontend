'use client'

import { useEffect, useState } from 'react'

export default function TablaResultados() {
  const [datos, setDatos] = useState([])
  const [parametros, setParametros] = useState(null)
  const [loading, setLoading] = useState(true)
  const [vistaActual, setVistaActual] = useState('completa') // 'completa', 'emisor', 'bonista'

  useEffect(() => {
    const calculoBono = sessionStorage.getItem('calculoBono')
    if (calculoBono) {
      const datos = JSON.parse(calculoBono)
      setDatos(datos.resultados || [])
      setParametros(datos)
    }
    setLoading(false)
  }, [])

  // Headers para la vista completa del cronograma
  const headersCompleta = [
    { key: 'periodo', label: 'N°', width: 'w-16' },
    { key: 'fecha', label: 'Fecha de Pago', width: 'w-28' },
    { key: 'saldoInicial', label: 'Saldo Inicial', width: 'w-32' },
    { key: 'intereses', label: 'Interés', width: 'w-28' },
    { key: 'amortizacion', label: 'Amortización', width: 'w-32' },
    { key: 'cuota', label: 'Cuota Total', width: 'w-32' },
    { key: 'saldoFinal', label: 'Saldo Final', width: 'w-32' }
  ]

  // Headers para vista del emisor (con escudo fiscal)
  const headersEmisor = [
    { key: 'periodo', label: 'N°', width: 'w-16' },
    { key: 'fecha', label: 'Fecha', width: 'w-28' },
    { key: 'cuota', label: 'Cuota Bruta', width: 'w-32' },
    { key: 'escudoFiscal', label: 'Escudo Fiscal', width: 'w-32' },
    { key: 'flujoNetoEmisor', label: 'Flujo Neto', width: 'w-32' }
  ]

  // Headers para vista del bonista (con impuestos)
  const headersBonista = [
    { key: 'periodo', label: 'N°', width: 'w-16' },
    { key: 'fecha', label: 'Fecha', width: 'w-28' },
    { key: 'cuota', label: 'Cuota Bruta', width: 'w-32' },
    { key: 'impuestoRenta', label: 'Imp. Renta', width: 'w-28' },
    { key: 'flujoNetoBonista', label: 'Flujo Neto', width: 'w-32' }
  ]

  const getHeaders = () => {
    switch (vistaActual) {
      case 'emisor': return headersEmisor
      case 'bonista': return headersBonista
      default: return headersCompleta
    }
  }

  const formatoMoneda = (valor) => {
    if (typeof valor !== 'number') return valor
    return `S/ ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatoFecha = (fecha) => {
    if (!fecha) return ''
    try {
      return new Date(fecha).toLocaleDateString('es-PE')
    } catch {
      return fecha
    }
  }

  const formatoValor = (valor, key) => {
    if (key === 'fecha') return formatoFecha(valor)
    if (key === 'periodo') return valor
    return formatoMoneda(valor)
  }

  const calcularTotales = () => {
    if (datos.length === 0) return {}
    
    return {
      totalIntereses: datos.reduce((sum, fila) => sum + (fila.intereses || 0), 0),
      totalAmortizacion: datos.reduce((sum, fila) => sum + (fila.amortizacion || 0), 0),
      totalCuotas: datos.reduce((sum, fila) => sum + (fila.cuota || 0), 0),
      totalImpuestos: datos.reduce((sum, fila) => sum + (fila.impuestoRenta || 0), 0),
      totalEscudoFiscal: datos.reduce((sum, fila) => sum + (fila.escudoFiscal || 0), 0),
      flujoNetoTotalBonista: datos.reduce((sum, fila) => sum + (fila.flujoNetoBonista || 0), 0),
      flujoNetoTotalEmisor: datos.reduce((sum, fila) => sum + (fila.flujoNetoEmisor || 0), 0)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando resultados...</p>
      </div>
    )
  }

  if (datos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-yellow-600 text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay datos para mostrar</h3>
          <p className="text-gray-600">Complete el formulario de cálculo para ver los resultados aquí.</p>
        </div>
      </div>
    )
  }

  const totales = calcularTotales()
  const headers = getHeaders()

  return (
    <div className="space-y-6">
      {/* Información del bono */}
      {parametros && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Información del Bono</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Método:</span>
              <p className="text-gray-800">{parametros.metodo}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Valor Nominal:</span>
              <p className="text-gray-800">{formatoMoneda(parseFloat(parametros.valor_nominal || 0))}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Tasa:</span>
              <p className="text-gray-800">{parametros.valor_tasa}% {parametros.tipo_tasa}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Frecuencia:</span>
              <p className="text-gray-800">{parametros.frecuencia_pago}</p>
            </div>
            {parametros.fecha_emision && (
              <div>
                <span className="font-medium text-gray-600">Fecha Emisión:</span>
                <p className="text-gray-800">{formatoFecha(parametros.fecha_emision)}</p>
              </div>
            )}
            {parametros.impuesto_renta && (
              <div>
                <span className="font-medium text-gray-600">Impuesto Renta:</span>
                <p className="text-gray-800">{parametros.tasa_impuesto_renta}%</p>
              </div>
            )}
            {parametros.escudo_fiscal && (
              <div>
                <span className="font-medium text-gray-600">Escudo Fiscal:</span>
                <p className="text-green-600">✓ Aplicado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selector de vista */}
      <div className="flex flex-wrap gap-2 bg-white p-4 rounded-lg border border-gray-200">
        <button
          onClick={() => setVistaActual('completa')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            vistaActual === 'completa'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cronograma Completo
        </button>
        <button
          onClick={() => setVistaActual('bonista')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            vistaActual === 'bonista'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Flujo del Bonista
        </button>
        <button
          onClick={() => setVistaActual('emisor')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            vistaActual === 'emisor'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Flujo del Emisor
        </button>
      </div>

      {/* Tabla de resultados */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {headers.map((h) => (
                  <th 
                    key={h.key} 
                    className={`px-4 py-3 text-left font-semibold text-gray-700 ${h.width || ''}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {datos.map((fila, idx) => (
                <tr
                  key={idx}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  {headers.map(({ key }) => (
                    <td key={key} className="px-4 py-3 whitespace-nowrap text-gray-800">
                      {formatoValor(fila[key], key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fila de totales */}
        <div className="bg-gray-100 border-t border-gray-300 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {vistaActual === 'completa' && (
              <>
                <div>
                  <span className="font-medium text-gray-600">Total Intereses:</span>
                  <p className="font-semibold text-blue-600">{formatoMoneda(totales.totalIntereses)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Amortización:</span>
                  <p className="font-semibold text-green-600">{formatoMoneda(totales.totalAmortizacion)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Cuotas:</span>
                  <p className="font-semibold text-purple-600">{formatoMoneda(totales.totalCuotas)}</p>
                </div>
              </>
            )}
            
            {vistaActual === 'bonista' && (
              <>
                <div>
                  <span className="font-medium text-gray-600">Total Cuotas Brutas:</span>
                  <p className="font-semibold text-blue-600">{formatoMoneda(totales.totalCuotas)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Impuestos:</span>
                  <p className="font-semibold text-red-600">{formatoMoneda(totales.totalImpuestos)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Flujo Neto Total:</span>
                  <p className="font-semibold text-green-600">{formatoMoneda(totales.flujoNetoTotalBonista)}</p>
                </div>
              </>
            )}
            
            {vistaActual === 'emisor' && (
              <>
                <div>
                  <span className="font-medium text-gray-600">Total Cuotas:</span>
                  <p className="font-semibold text-blue-600">{formatoMoneda(totales.totalCuotas)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Escudo Fiscal:</span>
                  <p className="font-semibold text-green-600">{formatoMoneda(totales.totalEscudoFiscal)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Flujo Neto Total:</span>
                  <p className="font-semibold text-purple-600">{formatoMoneda(totales.flujoNetoTotalEmisor)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notas explicativas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Notas:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          {vistaActual === 'completa' && (
            <>
              <li>• <strong>Cronograma Completo:</strong> Muestra el plan de pagos detallado con saldos, intereses y amortizaciones</li>
              <li>• Las fechas se calculan automáticamente según la frecuencia de pago establecida</li>
            </>
          )}
          {vistaActual === 'bonista' && (
            <>
              <li>• <strong>Flujo del Bonista:</strong> Muestra los ingresos del inversionista después de impuestos</li>
              <li>• El flujo neto es la cuota bruta menos el impuesto a la renta (si aplica)</li>
            </>
          )}
          {vistaActual === 'emisor' && (
            <>
              <li>• <strong>Flujo del Emisor:</strong> Muestra los egresos de la empresa emisora con beneficios fiscales</li>
              <li>• El escudo fiscal reduce el costo efectivo del financiamiento</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
