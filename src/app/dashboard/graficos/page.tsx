'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChartBarIcon, 
  Squares2X2Icon,
  PresentationChartLineIcon,
  BuildingLibraryIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  EyeIcon as ViewIcon
} from '@heroicons/react/24/outline'
import { 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ComposedChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts'

interface DatosCompletos {
  valor_nominal: string
  valor_comercial: string
  numero_periodos: string
  tasa_efectiva_periodo: string
  costos_emisor: string
  costos_bonista: string
  prima: string
  [key: string]: unknown
}

interface BonoRegistrado {
  id: string
  nombre: string
  valor_nominal: number
  valor_comercial: number
  numero_periodos: number
  tasa_efectiva_anual: number
  fecha_emision: string
  fecha_creacion: number
  datos_completos?: DatosCompletos
  indicadores?: {
    tceaEmisor: number
    tceaEmisorEscudo: number
    treaBonista: number
    precioActual: number
    utilidadPerdida: number
  }
}

type TipoGrafico = 'flujo_avanzado' | 'comparativo_detallado' | 'composicion_elegante' | 'rendimiento_radar' | 'cash_flow_waterfall' | 'riesgo_retorno'

export default function GraficosPage() {
  const router = useRouter()
  const [bonos, setBonos] = useState<BonoRegistrado[]>([])
  const [bonoSeleccionado, setBonoSeleccionado] = useState<BonoRegistrado | null>(null)
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>('flujo_avanzado')
  const [loading, setLoading] = useState(true)
  const [datosGrafico, setDatosGrafico] = useState<Array<Record<string, unknown>>>([])

  const procesarDatosGrafico = useCallback(() => {
    if (!bonoSeleccionado?.datos_completos) return

    const datos = bonoSeleccionado.datos_completos
    
    // Generar tabla de flujo de caja simulada (simplificada para gráficos)
    const valorNominal = parseFloat(datos.valor_nominal) || 1000
    const valorComercial = parseFloat(datos.valor_comercial) || 1050
    const numPeriodos = parseInt(datos.numero_periodos) || 4
    const tasaPeriodo = parseFloat(datos.tasa_efectiva_periodo) || 0.04
    const costosEmisor = parseFloat(datos.costos_emisor) || 0
    const costosBonista = parseFloat(datos.costos_bonista) || 0
    const prima = parseFloat(datos.prima) || 0

    const tabla = []
    let saldoPendiente = valorNominal

    // Período 0 (inicial)
    tabla.push({
      periodo: 0,
      fecha: 'Inicial',
      saldoPendiente: valorNominal,
      interes: 0,
      amortizacion: 0,
      prima: 0,
      flujoEmisor: valorComercial - costosEmisor,
      flujoBonista: -(valorComercial + costosBonista),
      flujoNeto: valorComercial - costosEmisor + valorComercial + costosBonista,
      utilidadAcumulada: 0,
      tceaAcumulada: 0
    })

    // Períodos siguientes
    for (let i = 1; i <= numPeriodos; i++) {
      const interes = saldoPendiente * tasaPeriodo
      let amortizacion = 0
      let primaEnPeriodo = 0

      if (i <= 2) {
        // Gracia parcial
        amortizacion = 0
      } else {
        // Sin gracia
        amortizacion = valorNominal / 2
      }

      if (i === numPeriodos) {
        primaEnPeriodo = prima
      }

      const flujoEmisor = -(interes + amortizacion + primaEnPeriodo)
      const flujoBonista = interes + amortizacion + primaEnPeriodo
      const flujoNeto = flujoEmisor + flujoBonista

      tabla.push({
        periodo: i,
        fecha: `Período ${i}`,
        saldoPendiente: Math.max(0, saldoPendiente - amortizacion),
        interes: interes,
        amortizacion: amortizacion,
        prima: primaEnPeriodo,
        flujoEmisor: flujoEmisor,
        flujoBonista: flujoBonista,
        flujoNeto: flujoNeto,
        utilidadAcumulada: i * 100, // Simulado
        tceaAcumulada: 6.66 + (i * 0.5) // Simulado
      })

      saldoPendiente -= amortizacion
    }

    setDatosGrafico(tabla)
  }, [bonoSeleccionado])

  useEffect(() => {
    cargarBonos()
  }, [])

  useEffect(() => {
    if (bonoSeleccionado) {
      procesarDatosGrafico()
    }
  }, [bonoSeleccionado, tipoGrafico, procesarDatosGrafico])

  const cargarBonos = () => {
    try {
      const bonosGuardados = localStorage.getItem('bonosRegistrados')
      if (bonosGuardados) {
        const bonosParseados = JSON.parse(bonosGuardados)
        const bonosConDatos = bonosParseados.filter((bono: BonoRegistrado) => bono.datos_completos)
        setBonos(bonosConDatos)
        
        // Seleccionar el primer bono por defecto
        if (bonosConDatos.length > 0) {
          setBonoSeleccionado(bonosConDatos[0])
        }
      }
    } catch (error) {
      console.error('Error al cargar bonos:', error)
    } finally {
      setLoading(false)
    }
  }

  const seleccionarBono = (bono: BonoRegistrado) => {
    setBonoSeleccionado(bono)
  }

  const tiposGrafico = [
    {
      tipo: 'flujo_avanzado' as TipoGrafico,
      nombre: 'Flujo de Caja Avanzado',
      descripcion: 'Análisis completo con múltiples métricas',
      icono: PresentationChartLineIcon,
      color: 'from-blue-600 to-purple-600'
    },
    {
      tipo: 'comparativo_detallado' as TipoGrafico,
      nombre: 'Desglose Comparativo',
      descripcion: 'Análisis detallado de componentes',
      icono: ChartBarIcon,
      color: 'from-green-500 to-emerald-600'
    },
    {
      tipo: 'composicion_elegante' as TipoGrafico,
      nombre: 'Composición Elegante',
      descripcion: 'Visualización en áreas apiladas',
      icono: Squares2X2Icon,
      color: 'from-purple-500 to-pink-600'
    },
    {
      tipo: 'rendimiento_radar' as TipoGrafico,
      nombre: 'Radar de Rendimiento',
      descripcion: 'Métricas clave en vista radial',
      icono: BuildingLibraryIcon,
      color: 'from-orange-500 to-red-500'
    },
    {
      tipo: 'cash_flow_waterfall' as TipoGrafico,
      nombre: 'Cascada de Flujos',
      descripcion: 'Waterfall chart profesional',
      icono: ArrowTrendingUpIcon,
      color: 'from-teal-500 to-cyan-600'
    },
    {
      tipo: 'riesgo_retorno' as TipoGrafico,
      nombre: 'Matriz Riesgo-Retorno',
      descripcion: 'Análisis de portfolio avanzado',
      icono: BeakerIcon,
      color: 'from-indigo-500 to-blue-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando análisis gráfico...</p>
        </div>
      </div>
    )
  }

  if (bonos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ChartBarIcon className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay bonos para analizar</h2>
          <p className="text-gray-600 mb-8">
            Necesitas crear y calcular al menos un bono para ver los gráficos de análisis financiero.
          </p>
          <button
            onClick={() => router.push('/dashboard/flujo')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <DocumentChartBarIcon className="h-5 w-5" />
            Crear Primer Bono
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Análisis Gráfico Avanzado
              </h1>
              <p className="text-gray-600">
                Visualización profesional del rendimiento y flujo de caja de tus bonos
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total de bonos analizables</div>
              <div className="text-2xl font-bold text-blue-600">{bonos.length}</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Selector de Bono */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ViewIcon className="h-5 w-5" />
                Seleccionar Bono para Análisis
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bonos.map((bono) => (
                  <div
                    key={bono.id}
                    onClick={() => seleccionarBono(bono)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      bonoSeleccionado?.id === bono.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2">
                        {bono.nombre}
                      </h3>
                      {bonoSeleccionado?.id === bono.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Valor Nominal:</span>
                        <span className="font-medium">${bono.valor_nominal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TEA:</span>
                        <span className="font-medium">{bono.tasa_efectiva_anual}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Períodos:</span>
                        <span className="font-medium">{bono.numero_periodos}</span>
                      </div>
                      {bono.indicadores?.treaBonista && (
                        <div className="flex justify-between">
                          <span>TREA:</span>
                          <span className="font-medium text-green-600">
                            {bono.indicadores.treaBonista.toFixed(2)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selector de Tipo de Gráfico */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Tipo de Análisis
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tiposGrafico.map((tipo) => {
                  const IconoComponente = tipo.icono
                  const isSelected = tipoGrafico === tipo.tipo
                    
                    return (
                      <div
                        key={tipo.tipo}
                        onClick={() => setTipoGrafico(tipo.tipo)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${tipo.color} bg-opacity-20`}>
                            <IconoComponente className={`h-5 w-5 text-white`} />
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {tipo.nombre}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {tipo.descripcion}
                        </p>
                      </div>
                    )
                })}
              </div>
            </div>
          </div>

          {/* Resumen del Bono Seleccionado */}
          {bonoSeleccionado && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg text-white overflow-hidden">
              <div className="px-6 py-4">
                <h2 className="text-xl font-bold mb-4">{bonoSeleccionado.nombre}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      ${bonoSeleccionado.valor_nominal.toLocaleString()}
                    </div>
                    <div className="text-blue-100 text-sm">Valor Nominal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {bonoSeleccionado.tasa_efectiva_anual}%
                    </div>
                    <div className="text-blue-100 text-sm">TEA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {bonoSeleccionado.numero_periodos}
                    </div>
                    <div className="text-blue-100 text-sm">Períodos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {bonoSeleccionado.indicadores?.treaBonista?.toFixed(2) || 'N/A'}%
                    </div>
                    <div className="text-blue-100 text-sm">TREA</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico Principal */}
          {bonoSeleccionado && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  {tiposGrafico.find(t => t.tipo === tipoGrafico)?.nombre}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {tiposGrafico.find(t => t.tipo === tipoGrafico)?.descripcion}
                </p>
              </div>
              <div className="p-6">
                {renderizarGrafico()}
              </div>
            </div>
          )}

          {/* Tabla Comparativa de Todos los Bonos */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DocumentChartBarIcon className="h-5 w-5" />
                Comparativa de Portafolio
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Nominal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TEA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TREA Bonista
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TCEA Emisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilidad/Pérdida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bonos.map((bono) => (
                    <tr key={bono.id} className={bonoSeleccionado?.id === bono.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bono.nombre}</div>
                        <div className="text-sm text-gray-500">{bono.numero_periodos} períodos</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${bono.valor_nominal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bono.tasa_efectiva_anual}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {bono.indicadores?.treaBonista?.toFixed(2) || 'N/A'}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {bono.indicadores?.tceaEmisor?.toFixed(2) || 'N/A'}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (bono.indicadores?.utilidadPerdida || 0) >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bono.indicadores?.utilidadPerdida?.toFixed(2) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => seleccionarBono(bono)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Analizar
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('datosBono', JSON.stringify(bono.datos_completos))
                            router.push('/dashboard/resultados')
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )

  // Función para renderizar diferentes tipos de gráficos
  function renderizarGrafico() {
    if (!datosGrafico.length) {
      return (
        <div className="text-center py-12 text-gray-500">
          <ChartBarIcon className="mx-auto h-12 w-12 mb-4" />
          <p>Procesando datos del gráfico...</p>
        </div>
      )
    }

    const colores = {
      primary: '#3B82F6',
      secondary: '#10B981', 
      accent: '#F59E0B',
      danger: '#EF4444',
      purple: '#8B5CF6',
      teal: '#14B8A6',
      pink: '#EC4899',
      indigo: '#6366F1'
    }

    switch (tipoGrafico) {
      case 'flujo_avanzado':
        return (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="fecha" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  formatter={(value: number | string, name: string) => [
                    typeof value === 'number' ? value.toFixed(2) : value,
                    name
                  ]}
                />
                <Legend />
                <Bar dataKey="flujoEmisor" fill={colores.primary} name="Flujo Emisor" />
                <Bar dataKey="flujoBonista" fill={colores.secondary} name="Flujo Bonista" />
                <Line 
                  type="monotone" 
                  dataKey="utilidadAcumulada" 
                  stroke={colores.accent}
                  strokeWidth={3}
                  name="Utilidad Acumulada"
                  dot={{ fill: colores.accent, strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )

      case 'comparativo_detallado':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosGrafico.slice(1)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                formatter={(value: number | string) => [Math.abs(Number(value)).toFixed(2), '']}
              />
              <Legend />
              <Bar dataKey="interes" stackId="a" fill={colores.danger} name="Interés" />
              <Bar dataKey="amortizacion" stackId="a" fill={colores.primary} name="Amortización" />
              <Bar dataKey="prima" stackId="a" fill={colores.accent} name="Prima" />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'composicion_elegante':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={datosGrafico.slice(1)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorInteres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colores.danger} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colores.danger} stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorAmortizacion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colores.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colores.primary} stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="colorPrima" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colores.accent} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colores.accent} stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                formatter={(value: number | string) => [Math.abs(Number(value)).toFixed(2), '']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="interes"
                stackId="1"
                stroke={colores.danger}
                fill="url(#colorInteres)"
                name="Interés"
              />
              <Area
                type="monotone"
                dataKey="amortizacion"
                stackId="1"
                stroke={colores.primary}
                fill="url(#colorAmortizacion)"
                name="Amortización"
              />
              <Area
                type="monotone"
                dataKey="prima"
                stackId="1"
                stroke={colores.accent}
                fill="url(#colorPrima)"
                name="Prima"
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'rendimiento_radar':
        const datosRadar = [
          {
            name: 'TREA',
            value: bonoSeleccionado?.indicadores?.treaBonista || 0,
            fullMark: 15
          },
          {
            name: 'TCEA',
            value: bonoSeleccionado?.indicadores?.tceaEmisor || 0,
            fullMark: 15
          },
          {
            name: 'Rentabilidad',
            value: ((bonoSeleccionado?.indicadores?.utilidadPerdida || 0) / (bonoSeleccionado?.valor_nominal || 1)) * 100,
            fullMark: 10
          }
        ]

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="80%" 
                data={datosRadar}
              >
                <RadialBar 
                  dataKey="value" 
                  cornerRadius={10} 
                  fill={colores.primary}
                  label={{ position: 'insideStart', fill: '#fff' }}
                />
                <Legend />
                <Tooltip formatter={(value: number | string) => [`${Number(value).toFixed(2)}%`, 'Valor']} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-4">
              {datosRadar.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((Math.abs(item.value) / item.fullMark) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-blue-600 w-12 text-right">
                      {item.value.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'cash_flow_waterfall':
        const datosWaterfall = datosGrafico.slice(1).map((item, index) => ({
          periodo: item.fecha,
          valor: Math.abs(Number(item.flujoEmisor) || 0),
          cumulative: datosGrafico.slice(0, index + 2).reduce((sum, curr) => sum + Math.abs(Number(curr.flujoEmisor) || 0), 0)
        }))

        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={datosWaterfall} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periodo" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                formatter={(value: number | string) => [Number(value).toFixed(2), '']}
              />
              <Legend />
              <Bar dataKey="valor" fill={colores.teal} name="Flujo del Período" />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke={colores.purple}
                strokeWidth={3}
                name="Acumulado"
                dot={{ fill: colores.purple, strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case 'riesgo_retorno':
        const datosRiesgoRetorno = bonos.map(bono => ({
          nombre: bono.nombre,
          riesgo: bono.tasa_efectiva_anual, // Proxy para riesgo
          retorno: bono.indicadores?.treaBonista || 0,
          valorNominal: bono.valor_nominal
        }))

        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={datosRiesgoRetorno} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="riesgo" 
                type="number"
                stroke="#6b7280" 
                fontSize={12}
                label={{ value: 'Riesgo (TEA %)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                label={{ value: 'Retorno (TREA %)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                formatter={(value: number | string, name: string) => [
                  typeof value === 'number' ? value.toFixed(2) + '%' : value,
                  name
                ]}
              />
              <Legend />
              {datosRiesgoRetorno.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Object.values(colores)[index % Object.values(colores).length]} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="text-center py-12 text-gray-500">Tipo de gráfico no implementado</div>
    }
  }
}
