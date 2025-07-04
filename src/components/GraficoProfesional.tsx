'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts'

interface GraficoProfesionalProps {
  datosBono: any
  tipo: 'flujo' | 'comparativo' | 'composicion' | 'rendimiento'
}

const COLORES = {
  emisor: '#ef4444',
  emisorEscudo: '#f97316', 
  bonista: '#22c55e',
  amortizacion: '#3b82f6',
  interes: '#8b5cf6',
  prima: '#f59e0b'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">Período {label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">
              {entry.name}: <span className="font-medium">${entry.value?.toLocaleString()}</span>
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function GraficoProfesional({ datosBono, tipo }: GraficoProfesionalProps) {
  const [datosGrafico, setDatosGrafico] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (datosBono) {
      procesarDatos()
    }
  }, [datosBono, tipo])

  const procesarDatos = () => {
    try {
      // Simular el cálculo de la tabla de flujo de caja
      const {
        valor_nominal,
        valor_comercial, 
        numero_periodos,
        tasa_efectiva_periodo,
        costos_emisor,
        costos_bonista,
        prima,
        impuesto_renta
      } = datosBono

      const valorNominal = parseFloat(valor_nominal) || 0
      const valorComercial = parseFloat(valor_comercial) || 0
      const numPeriodos = parseInt(numero_periodos) || 4
      const tasaPeriodo = parseFloat(tasa_efectiva_periodo) || 0
      const costosEmisor = parseFloat(costos_emisor) || 0
      const costosBonista = parseFloat(costos_bonista) || 0
      const impuesto = parseFloat(impuesto_renta) / 100 || 0
      const primaPorcentaje = parseFloat(prima) / 100 || 0
      const primaValor = valorNominal * primaPorcentaje

      const datos = []
      let saldoPendiente = valorNominal
      const amortizacionPorPeriodo = valorNominal / numPeriodos

      // Período 0 (inicial)
      const flujoEmisor0 = valorComercial - costosEmisor
      const flujoBonista0 = -(valorComercial + costosBonista)
      
      datos.push({
        periodo: 0,
        saldo: valorNominal,
        amortizacion: 0,
        interes: 0,
        prima: 0,
        escudo: 0,
        flujoEmisor: flujoEmisor0,
        flujoEmisorEscudo: flujoEmisor0,
        flujoBonista: flujoBonista0,
        cuota: 0
      })

      // Períodos 1 a n
      for (let periodo = 1; periodo <= numPeriodos; periodo++) {
        const interes = saldoPendiente * tasaPeriodo
        const amortizacion = amortizacionPorPeriodo
        const cuota = interes + amortizacion
        
        // Prima solo en el último período
        const primaEnPeriodo = periodo === numPeriodos ? primaValor : 0
        
        // Escudo fiscal
        const escudo = interes * impuesto

        // Flujos
        const flujoEmisor = -(interes + amortizacion + primaEnPeriodo)
        const flujoEmisorEscudo = flujoEmisor + escudo
        const flujoBonista = interes + amortizacion + primaEnPeriodo

        datos.push({
          periodo,
          saldo: saldoPendiente - amortizacion,
          amortizacion,
          interes,
          prima: primaEnPeriodo,
          escudo,
          flujoEmisor,
          flujoEmisorEscudo,
          flujoBonista,
          cuota
        })

        saldoPendiente -= amortizacion
      }

      setDatosGrafico(datos)
      setLoading(false)
    } catch (error) {
      console.error('Error procesando datos:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!datosGrafico.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No hay datos disponibles para mostrar
      </div>
    )
  }

  const renderGraficoFlujo = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={datosGrafico.slice(1)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="periodo" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="flujoEmisor" 
          stroke={COLORES.emisor}
          strokeWidth={3}
          name="Flujo Emisor"
          dot={{ fill: COLORES.emisor, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="flujoEmisorEscudo" 
          stroke={COLORES.emisorEscudo}
          strokeWidth={3}
          name="Flujo Emisor c/Escudo"
          dot={{ fill: COLORES.emisorEscudo, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="flujoBonista" 
          stroke={COLORES.bonista}
          strokeWidth={3}
          name="Flujo Bonista"
          dot={{ fill: COLORES.bonista, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  const renderGraficoComparativo = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={datosGrafico.slice(1)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="periodo" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="amortizacion" fill={COLORES.amortizacion} name="Amortización" />
        <Bar dataKey="interes" fill={COLORES.interes} name="Interés" />
        <Bar dataKey="prima" fill={COLORES.prima} name="Prima" />
      </BarChart>
    </ResponsiveContainer>
  )

  const renderGraficoComposicion = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={datosGrafico.slice(1)}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="periodo" 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          axisLine={{ stroke: '#d1d5db' }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="amortizacion" 
          stackId="1" 
          stroke={COLORES.amortizacion}
          fill={COLORES.amortizacion}
          fillOpacity={0.7}
          name="Amortización"
        />
        <Area 
          type="monotone" 
          dataKey="interes" 
          stackId="1" 
          stroke={COLORES.interes}
          fill={COLORES.interes}
          fillOpacity={0.7}
          name="Interés"
        />
        <Area 
          type="monotone" 
          dataKey="prima" 
          stackId="1" 
          stroke={COLORES.prima}
          fill={COLORES.prima}
          fillOpacity={0.7}
          name="Prima"
        />
      </AreaChart>
    </ResponsiveContainer>
  )

  const renderGraficoRendimiento = () => {
    const datosRendimiento = [
      { 
        name: 'TCEA Emisor', 
        value: 6.66, 
        color: COLORES.emisor,
        descripcion: 'Costo efectivo anual para el emisor'
      },
      { 
        name: 'TCEA Emisor c/Escudo', 
        value: 4.26, 
        color: COLORES.emisorEscudo,
        descripcion: 'Costo efectivo con beneficio fiscal'
      },
      { 
        name: 'TREA Bonista', 
        value: 4.63, 
        color: COLORES.bonista,
        descripcion: 'Rentabilidad efectiva del bonista'
      }
    ]

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={datosRendimiento}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}%`}
            >
              {datosRendimiento.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="space-y-4">
          {datosRendimiento.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <p className="text-sm text-gray-600">{item.descripcion}</p>
                <p className="text-lg font-bold" style={{ color: item.color }}>
                  {item.value}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderGrafico = () => {
    switch (tipo) {
      case 'flujo':
        return renderGraficoFlujo()
      case 'comparativo':
        return renderGraficoComparativo()
      case 'composicion':
        return renderGraficoComposicion()
      case 'rendimiento':
        return renderGraficoRendimiento()
      default:
        return renderGraficoFlujo()
    }
  }

  return (
    <div className="w-full">
      {renderGrafico()}
    </div>
  )
}
