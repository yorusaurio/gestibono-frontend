'use client'

import { useEffect, useState } from 'react'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ScaleIcon,
  PresentationChartLineIcon,
  CalculatorIcon
} from '@heroicons/react/24/solid'

export default function Indicadores() {
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculoBono = sessionStorage.getItem('calculoBono')
    if (calculoBono) {
      const datos = JSON.parse(calculoBono)
      setResumen(datos.resumen || null)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cargando indicadores...</p>
      </div>
    )
  }

  if (!resumen) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No hay datos para mostrar. Por favor, complete el formulario primero.</p>
      </div>
    )
  }

  const indicadores = [
    {
      label: 'Valor Nominal',
      value: resumen.valorNominal,
      prefijo: 'S/',
      icon: <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />,
      bg: 'bg-blue-50'
    },
    {
      label: 'Valor Comercial',
      value: resumen.valorComercial,
      prefijo: 'S/',
      icon: <PresentationChartLineIcon className="h-6 w-6 text-green-600" />,
      bg: 'bg-green-50'
    },
    {
      label: 'Total Intereses',
      value: resumen.totalIntereses,
      prefijo: 'S/',
      icon: <ChartBarIcon className="h-6 w-6 text-yellow-600" />,
      bg: 'bg-yellow-50'
    },
    {
      label: 'Total Amortización',
      value: resumen.totalAmortizacion,
      prefijo: 'S/',
      icon: <ScaleIcon className="h-6 w-6 text-purple-600" />,
      bg: 'bg-purple-50'
    },
    {
      label: 'Total Cuotas',
      value: resumen.totalCuotas,
      prefijo: 'S/',
      icon: <CalculatorIcon className="h-6 w-6 text-indigo-600" />,
      bg: 'bg-indigo-50'
    },
    {
      label: 'Costos Totales',
      value: resumen.costosEmisor + resumen.costosInversionista,
      prefijo: 'S/',
      icon: <ClockIcon className="h-6 w-6 text-red-600" />,
      bg: 'bg-red-50'
    }
  ]

  const formatValue = (indicador) => {
    const value = typeof indicador.value === 'number' 
      ? indicador.value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : indicador.value

    return `${indicador.prefijo || ''}${value}${indicador.sufijo || ''}`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {indicadores.map((indicador, idx) => (
        <div
          key={idx}
          className={`rounded-xl ${indicador.bg} p-5 flex items-center justify-between shadow-sm border`}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-700">{indicador.label}</h3>
            <p className="text-3xl font-bold text-gray-900">
              {formatValue(indicador)}
            </p>
          </div>
          <div className="ml-4">{indicador.icon}</div>
        </div>
      ))}
    </div>
  )
}
