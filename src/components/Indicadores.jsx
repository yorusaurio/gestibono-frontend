'use client'

import { useEffect, useState } from 'react'
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ScaleIcon,
  PresentationChartLineIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon
} from '@heroicons/react/24/solid'

export default function Indicadores() {
  const [resumen, setResumen] = useState(null)
  const [parametros, setParametros] = useState(null)
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculoBono = sessionStorage.getItem('calculoBono')
    if (calculoBono) {
      const datos = JSON.parse(calculoBono)
      setResumen(datos.resumen || null)
      setParametros(datos)
      setResultados(datos.resultados || [])
    }
    setLoading(false)
  }, [])

  // Calcular indicadores avanzados
  const calcularIndicadores = () => {
    if (!resumen || !parametros || resultados.length === 0) return {}

    const valorNominal = parseFloat(parametros.valor_nominal || 0)
    const valorComercial = parseFloat(parametros.valor_comercial || valorNominal)
    const prima = valorComercial - valorNominal
    const utilidad = prima // La utilidad es la diferencia entre precio comercial y nominal

    // Calcular totales de flujos
    const totalImpuestos = resultados.reduce((sum, r) => sum + (r.impuestoRenta || 0), 0)
    const totalEscudoFiscal = resultados.reduce((sum, r) => sum + (r.escudoFiscal || 0), 0)
    const flujoNetoBonista = resultados.reduce((sum, r) => sum + (r.flujoNetoBonista || 0), 0)
    const flujoNetoEmisor = resultados.reduce((sum, r) => sum + (r.flujoNetoEmisor || 0), 0)

    const nroPeriodos = parseInt(parametros.nro_periodos || 0)
    
    // Frecuencia anual según tipo de período
    const frecuenciaAnual = {
      'MENSUAL': 12,
      'BIMESTRAL': 6,
      'TRIMESTRAL': 4,
      'CUATRIMESTRAL': 3,
      'SEMESTRAL': 2,
      'ANUAL': 1
    }[parametros.frecuencia_pago] || 12

    const periodosAnuales = nroPeriodos / frecuenciaAnual

    // TCEA Emisor (sin escudo fiscal)
    let tceaEmisor = 0
    if (valorComercial > 0 && resumen.totalCuotas > 0) {
      const factorCosto = resumen.totalCuotas / valorComercial
      tceaEmisor = (Math.pow(factorCosto, 1 / periodosAnuales) - 1) * 100
    }

    // TCEA con Escudo Fiscal
    let tceaConEscudo = 0
    if (valorComercial > 0 && Math.abs(flujoNetoEmisor) > 0) {
      const costoNetoConEscudo = Math.abs(flujoNetoEmisor)
      const factorCostoConEscudo = costoNetoConEscudo / valorComercial
      tceaConEscudo = (Math.pow(factorCostoConEscudo, 1 / periodosAnuales) - 1) * 100
    }

    // TREA Bonista (rentabilidad efectiva anual)
    let treaBonista = 0
    if (valorComercial > 0 && flujoNetoBonista > 0) {
      const factorRentabilidad = flujoNetoBonista / valorComercial
      treaBonista = (Math.pow(factorRentabilidad, 1 / periodosAnuales) - 1) * 100
    }

    return {
      valorNominal,
      valorComercial, // Este es el "Precio actual"
      prima,
      utilidad,
      totalIntereses: resumen.totalIntereses,
      totalAmortizacion: resumen.totalAmortizacion,
      totalCuotas: resumen.totalCuotas,
      totalImpuestos,
      totalEscudoFiscal,
      flujoNetoBonista,
      flujoNetoEmisor: Math.abs(flujoNetoEmisor),
      costosEmisor: resumen.costosEmisor || 0,
      costosInversionista: resumen.costosInversionista || 0,
      tceaEmisor: isFinite(tceaEmisor) ? tceaEmisor : 0,
      tceaConEscudo: isFinite(tceaConEscudo) ? tceaConEscudo : 0,
      treaBonista: isFinite(treaBonista) ? treaBonista : 0
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando indicadores...</p>
      </div>
    )
  }

  if (!resumen || !parametros || resultados.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-yellow-600 text-4xl mb-3">📈</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay datos para mostrar</h3>
          <p className="text-gray-600">Complete el formulario de cálculo para ver los indicadores aquí.</p>
        </div>
      </div>
    )
  }

  const indicadores = calcularIndicadores()

  // Indicadores principales (los que solicitas específicamente)
  const indicadoresPrincipales = [
    {
      label: 'Precio Actual',
      value: indicadores.valorComercial,
      prefijo: 'S/ ',
      icon: <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      label: 'Utilidad',
      value: indicadores.utilidad,
      prefijo: indicadores.utilidad >= 0 ? 'S/ +' : 'S/ ',
      icon: <ArrowTrendingUpIcon className={`h-6 w-6 ${indicadores.utilidad >= 0 ? 'text-green-600' : 'text-red-600'}`} />,
      bg: indicadores.utilidad >= 0 ? 'bg-green-50' : 'bg-red-50',
      border: indicadores.utilidad >= 0 ? 'border-green-200' : 'border-red-200'
    },
    {
      label: 'TCEA Emisor',
      value: indicadores.tceaEmisor,
      sufijo: '%',
      decimales: 4,
      icon: <ChartBarIcon className="h-6 w-6 text-red-600" />,
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      label: 'TCEA c/Escudo',
      value: indicadores.tceaConEscudo,
      sufijo: '%',
      decimales: 4,
      icon: <ShieldCheckIcon className="h-6 w-6 text-orange-600" />,
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    {
      label: 'TREA Bonista',
      value: indicadores.treaBonista,
      sufijo: '%',
      decimales: 4,
      icon: <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-200'
    }
  ]

  const indicadoresBasicos = [
    {
      label: 'Valor Nominal',
      value: indicadores.valorNominal,
      prefijo: 'S/ ',
      icon: <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      label: 'Valor Comercial',
      value: indicadores.valorComercial,
      prefijo: 'S/ ',
      icon: <PresentationChartLineIcon className="h-6 w-6 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    {
      label: 'Prima / Descuento',
      value: indicadores.prima,
      prefijo: indicadores.prima >= 0 ? 'S/ +' : 'S/ ',
      icon: <ArrowTrendingUpIcon className={`h-6 w-6 ${indicadores.prima >= 0 ? 'text-green-600' : 'text-red-600'}`} />,
      bg: indicadores.prima >= 0 ? 'bg-green-50' : 'bg-red-50',
      border: indicadores.prima >= 0 ? 'border-green-200' : 'border-red-200'
    }
  ]

  const indicadoresFinancieros = [
    {
      label: 'Total Intereses',
      value: indicadores.totalIntereses,
      prefijo: 'S/ ',
      icon: <ChartBarIcon className="h-6 w-6 text-yellow-600" />,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200'
    },
    {
      label: 'Total Cuotas',
      value: indicadores.totalCuotas,
      prefijo: 'S/ ',
      icon: <CalculatorIcon className="h-6 w-6 text-indigo-600" />,
      bg: 'bg-indigo-50',
      border: 'border-indigo-200'
    },
    {
      label: 'Costos Totales',
      value: indicadores.costosEmisor + indicadores.costosInversionista,
      prefijo: 'S/ ',
      icon: <ClockIcon className="h-6 w-6 text-red-600" />,
      bg: 'bg-red-50',
      border: 'border-red-200'
    }
  ]

  const indicadoresFiscales = []
  
  if (parametros.impuesto_renta) {
    indicadoresFiscales.push({
      label: 'Total Impuestos',
      value: indicadores.totalImpuestos,
      prefijo: 'S/ ',
      icon: <DocumentTextIcon className="h-6 w-6 text-red-600" />,
      bg: 'bg-red-50',
      border: 'border-red-200'
    })
  }

  if (parametros.escudo_fiscal) {
    indicadoresFiscales.push({
      label: 'Escudo Fiscal',
      value: indicadores.totalEscudoFiscal,
      prefijo: 'S/ ',
      icon: <ShieldCheckIcon className="h-6 w-6 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-200'
    })
  }

  const indicadoresRentabilidad = [
    {
      label: 'Flujo Neto Bonista',
      value: indicadores.flujoNetoBonista,
      prefijo: 'S/ ',
      icon: <BanknotesIcon className="h-6 w-6 text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    {
      label: 'Flujo Neto Emisor',
      value: indicadores.flujoNetoEmisor,
      prefijo: 'S/ ',
      icon: <BanknotesIcon className="h-6 w-6 text-purple-600" />,
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    }
  ]

  const formatValue = (indicador) => {
    if (typeof indicador.value !== 'number') return indicador.value

    const decimales = indicador.decimales || 2
    const value = indicador.value.toLocaleString('es-PE', { 
      minimumFractionDigits: decimales, 
      maximumFractionDigits: decimales 
    })

    return `${indicador.prefijo || ''}${value}${indicador.sufijo || ''}`
  }

  const SeccionIndicadores = ({ titulo, indicadores, className = '' }) => (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800">{titulo}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicadores.map((indicador, idx) => (
          <div
            key={idx}
            className={`rounded-xl ${indicador.bg} ${indicador.border} border p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-700 mb-1">{indicador.label}</h4>
              <p className="text-2xl font-bold text-gray-900 truncate">
                {formatValue(indicador)}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">{indicador.icon}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <SeccionIndicadores 
        titulo="Indicadores Principales" 
        indicadores={indicadoresPrincipales} 
        className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200"
      />
      
      <SeccionIndicadores 
        titulo="Valores del Bono" 
        indicadores={indicadoresBasicos} 
      />
      
      <SeccionIndicadores 
        titulo="Indicadores Financieros" 
        indicadores={indicadoresFinancieros} 
      />
      
      {indicadoresFiscales.length > 0 && (
        <SeccionIndicadores 
          titulo="Aspectos Fiscales" 
          indicadores={indicadoresFiscales} 
        />
      )}
      
      <SeccionIndicadores 
        titulo="Flujos Netos" 
        indicadores={indicadoresRentabilidad} 
      />
    </div>
  )
}
