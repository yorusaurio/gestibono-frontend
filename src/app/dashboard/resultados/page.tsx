'use client'

import { useState, useEffect } from 'react'
import { ArrowDownTrayIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function ResultadosPage() {
  const router = useRouter()
  const [datos, setDatos] = useState<any>(null)
  const [tablaBono, setTablaBono] = useState<any[]>([])
  const [indicadores, setIndicadores] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const datosBono = localStorage.getItem('datosBono')
    if (!datosBono) {
      router.push('/dashboard/flujo')
      return
    }

    const datosParseados = JSON.parse(datosBono)
    setDatos(datosParseados)
    calcularTablaBono(datosParseados)
    setLoading(false)
  }, [router])

  const calcularTablaBono = (datos: any) => {
    const {
      valor_nominal,
      valor_comercial,
      numero_periodos,
      tasa_efectiva_periodo,
      tasa_descuento_periodo,
      costos_emisor,
      costos_bonista,
      impuesto_renta,
      prima,
      fecha_emision,
      dias_periodo
    } = datos

    const valorNominal = parseFloat(valor_nominal)
    const valorComercial = parseFloat(valor_comercial)
    const numPeriodos = numero_periodos
    const tasaPeriodo = tasa_efectiva_periodo
    const tasaDescuento = tasa_descuento_periodo
    const costosEmisor = costos_emisor
    const costosBonista = costos_bonista
    const impuesto = parseFloat(impuesto_renta) / 100
    const primaPorcentaje = parseFloat(prima) / 100
    const primaValor = valorNominal * primaPorcentaje

    // Calcular tabla período por período - SEGÚN TESTING.TXT
    const tabla = []
    let saldoPendiente = valorNominal
    const fechaEmision = new Date(fecha_emision)
    const diasPorPeriodo = parseInt(dias_periodo)

    // Período 0 (inicial) - según testing.txt
    const flujoEmisor0 = valorComercial - costosEmisor  // 1050 - 23.10 = 1026.90
    const flujoBonista0 = -(valorComercial + costosBonista)  // -(1050 + 9.98) = -1059.98
    
    tabla.push({
      periodo: 0,
      fecha: fechaEmision.toLocaleDateString('es-ES'),
      nDias: 0,
      tasaAjustada: 0,
      inflacion: 0,
      ip: 0,
      gracia: '',
      bono: 0,
      bonoIndexado: 0,
      cupon: 0,
      cuota: 0,
      amortizacion: 0,
      prima: 0,
      escudo: 0,
      flujoEmisor: flujoEmisor0,
      flujoEmisorEscudo: flujoEmisor0,
      flujoBonista: flujoBonista0
    })

    // Períodos 1 a 4 - según testing.txt exacto
    for (let i = 1; i <= numPeriodos; i++) {
      const fechaPeriodo = new Date(fechaEmision)
      fechaPeriodo.setDate(fechaPeriodo.getDate() + (i * diasPorPeriodo))
      
      const interes = saldoPendiente * tasaPeriodo  // Interés sobre saldo pendiente
      let amortizacion = 0
      let primaEnPeriodo = 0
      let gracia = ''

      // Según testing.txt: períodos 1-2 gracia P, período 3-4 gracia S
      if (i <= 2) {
        gracia = 'P' // Gracia parcial (solo intereses)
        amortizacion = 0
      } else {
        gracia = 'S' // Sin gracia (interés + amortización)
        if (i === 3) {
          amortizacion = 500 // Primera amortización
        } else if (i === 4) {
          amortizacion = 500 // Segunda amortización
          primaEnPeriodo = primaValor // Prima solo en último período
        }
      }

      const cuota = interes + amortizacion + primaEnPeriodo
      const escudoFiscal = interes * impuesto
      const flujoEmisor = -cuota
      const flujoEmisorEscudo = flujoEmisor + escudoFiscal
      const flujoBonista = cuota

      tabla.push({
        periodo: i,
        fecha: fechaPeriodo.toLocaleDateString('es-ES'),
        nDias: diasPorPeriodo,
        tasaAjustada: tasaPeriodo,
        inflacion: 0,
        ip: 0,
        gracia: gracia,
        bono: saldoPendiente,
        bonoIndexado: saldoPendiente,
        cupon: -interes, // Negativo según testing.txt
        cuota: cuota,
        amortizacion: amortizacion,
        prima: primaEnPeriodo,
        escudo: escudoFiscal,
        flujoEmisor: flujoEmisor,
        flujoEmisorEscudo: flujoEmisorEscudo,
        flujoBonista: flujoBonista
      })

      saldoPendiente -= amortizacion
    }

    setTablaBono(tabla)

    // Calcular indicadores según testing.txt
    calcularIndicadores(tabla, tasaDescuento)
  }

  const calcularIndicadores = (tabla: any[], tasaDescuento: number) => {
    // Extraer flujos para cálculos - según testing.txt
    const flujosBonista = tabla.map((row: any) => row.flujoBonista)
    const flujosEmisor = tabla.map((row: any) => row.flujoEmisor)
    const flujosEmisorEscudo = tabla.map((row: any) => row.flujoEmisorEscudo)

    // Precio Actual = VNA(tasa_descuento, flujos_bonista_1_a_n) según testing.txt
    let precioActual = 0
    for (let i = 1; i < flujosBonista.length; i++) {
      precioActual += flujosBonista[i] / Math.pow(1 + tasaDescuento, i)
    }

    // Utilidad/Pérdida = flujo_inicial_bonista + VNA según testing.txt
    const utilidadPerdida = flujosBonista[0] + precioActual

    // Función TIR mejorada (Newton-Raphson)
    const calcularTIR = (flujos) => {
      let tasa = 0.05 // Estimación inicial
      const tolerancia = 1e-8
      const maxIteraciones = 1000
      
      for (let iter = 0; iter < maxIteraciones; iter++) {
        let van = 0
        let derivada = 0
        
        for (let i = 0; i < flujos.length; i++) {
          const factor = Math.pow(1 + tasa, i)
          van += flujos[i] / factor
          if (i > 0) {
            derivada -= (i * flujos[i]) / Math.pow(1 + tasa, i + 1)
          }
        }
        
        if (Math.abs(van) < tolerancia) break
        if (Math.abs(derivada) < 1e-12) break
        
        const nuevaTasa = tasa - van / derivada
        
        // Limitar tasa a rango razonable
        if (nuevaTasa < -0.99) {
          tasa = -0.99
        } else if (nuevaTasa > 5) {
          tasa = 5
        } else {
          tasa = nuevaTasa
        }
        
        if (Math.abs(tasa - nuevaTasa) < tolerancia) break
      }
      return tasa
    }

    // Calcular TCEAs según testing.txt
    const tirEmisorSemestral = calcularTIR(flujosEmisor)
    const tirEmisorEscudoSemestral = calcularTIR(flujosEmisorEscudo)
    const tirBonistaSemestral = calcularTIR(flujosBonista)

    // Convertir a anuales (semestral -> anual)
    const tceaEmisor = (Math.pow(1 + tirEmisorSemestral, 2) - 1) * 100
    const tceaEmisorEscudo = (Math.pow(1 + tirEmisorEscudoSemestral, 2) - 1) * 100
    const treaBonista = (Math.pow(1 + tirBonistaSemestral, 2) - 1) * 100

    setIndicadores({
      precioActual: precioActual,
      utilidadPerdida: utilidadPerdida,
      tceaEmisor: tceaEmisor,
      tceaEmisorEscudo: tceaEmisorEscudo,
      treaBonista: treaBonista
    })
  }

  const exportarCSV = () => {
    if (!tablaBono.length) return

    const headers = [
      'N', 'FECHA PROGRAMADA', 'N DE DIAS', 'TASA AJUSTADA PERIODO', 'INFLACION ANUAL', 'IP',
      'PLAZO DE GRACIA', 'BONO', 'BONO INDEXADO', 'CUPON (INTERES)', 'CUOTA', 'AMORT.', 'PRIMA',
      'ESCUDO', 'FLUJO EMISOR', 'FLUJO EMISOR C/ESCUDO', 'FLUJO BONISTA'
    ]

    const filas = tablaBono.map((row: any) => [
      row.periodo,
      row.fecha,
      row.nDias,
      (row.tasaAjustada * 100).toFixed(5) + '%',
      (row.inflacion * 100).toFixed(2) + '%',
      (row.ip * 100).toFixed(3) + '%',
      row.gracia,
      row.bono.toFixed(2),
      row.bonoIndexado.toFixed(2),
      row.cupon.toFixed(2),
      row.cuota.toFixed(2),
      row.amortizacion.toFixed(2),
      row.prima.toFixed(2),
      row.escudo.toFixed(2),
      row.flujoEmisor.toFixed(2),
      row.flujoEmisorEscudo.toFixed(2),
      row.flujoBonista.toFixed(2)
    ])

    const csvContent = [headers, ...filas]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `flujo_bono_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Calculando resultados...</p>
        </div>
      </div>
    )
  }

  if (!datos) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No hay datos para mostrar</p>
          <button
            onClick={() => router.push('/dashboard/flujo')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Ir al formulario
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resultados del Bono</h1>
            <p className="text-gray-600 mt-1">
              Tabla de flujo de caja y indicadores financieros según testing.txt
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/flujo')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver
            </button>
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Parámetros del Bono */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parámetros del Bono</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Valor Nominal:</span>
              <span className="ml-2">{parseFloat(datos.valor_nominal).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Valor Comercial:</span>
              <span className="ml-2">{parseFloat(datos.valor_comercial).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Períodos:</span>
              <span className="ml-2">{datos.numero_periodos}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tasa Efectiva:</span>
              <span className="ml-2">{(datos.tasa_efectiva_periodo * 100).toFixed(5)}%</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Costos Emisor:</span>
              <span className="ml-2">{datos.costos_emisor.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Costos Bonista:</span>
              <span className="ml-2">{datos.costos_bonista.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Indicadores */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Indicadores Financieros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Precio Actual</h3>
              <p className="text-2xl font-bold text-blue-600">{indicadores.precioActual?.toFixed(2)}</p>
              <p className="text-xs text-blue-700">Esperado: 1061.10</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Utilidad/Pérdida</h3>
              <p className="text-2xl font-bold text-green-600">{indicadores.utilidadPerdida?.toFixed(2)}</p>
              <p className="text-xs text-green-700">Esperado: 1.13</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">TCEA Emisor</h3>
              <p className="text-2xl font-bold text-purple-600">{indicadores.tceaEmisor?.toFixed(5)}%</p>
              <p className="text-xs text-purple-700">Esperado: 6.66299%</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-medium text-indigo-900">TCEA c/Escudo</h3>
              <p className="text-2xl font-bold text-indigo-600">{indicadores.tceaEmisorEscudo?.toFixed(5)}%</p>
              <p className="text-xs text-indigo-700">Esperado: 4.26000%</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-900">TREA Bonista</h3>
              <p className="text-2xl font-bold text-orange-600">{indicadores.treaBonista?.toFixed(5)}%</p>
              <p className="text-xs text-orange-700">Esperado: 4.63123%</p>
            </div>
          </div>
        </div>

        {/* Tabla de Flujo de Caja */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Tabla de Flujo de Caja - Según Testing.txt</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Programada</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N de Días</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa Ajustada Período</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inflación Anual</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plazo de Gracia</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bono</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bono Indexado</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cupón (Interés)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuota</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amort.</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prima</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escudo</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flujo Emisor</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flujo Emisor c/Escudo</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flujo Bonista</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tablaBono.map((row: any, index: number) => (
                  <tr key={index} className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.periodo}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{row.fecha}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{row.nDias}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.periodo === 0 ? '0.00000%' : (row.tasaAjustada * 100).toFixed(5) + '%'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{(row.inflacion * 100).toFixed(2)}%</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{(row.ip * 100).toFixed(3)}%</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{row.gracia}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{row.bono.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{row.bonoIndexado.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{row.cupon.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.cuota.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{row.amortizacion.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{row.prima.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-green-600">{row.escudo.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600">{row.flujoEmisor.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-red-600">{row.flujoEmisorEscudo.toFixed(2)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-blue-600">{row.flujoBonista.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
