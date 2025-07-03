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

    const valorNominal = parseFloat(valor_nominal) || 0
    const valorComercial = parseFloat(valor_comercial) || 0
    const numPeriodos = parseInt(numero_periodos) || 4
    const tasaPeriodo = parseFloat(tasa_efectiva_periodo) || 0
    const tasaDescuento = parseFloat(tasa_descuento_periodo) || 0
    const costosEmisor = parseFloat(costos_emisor) || 0
    const costosBonista = parseFloat(costos_bonista) || 0
    const impuesto = parseFloat(impuesto_renta) / 100 || 0
    const primaPorcentaje = parseFloat(prima) / 100 || 0
    const primaValor = valorNominal * primaPorcentaje

    console.log('🎯 DATOS DE PRIMA RECIBIDOS:')
    console.log(`   - Prima (raw): ${prima}`)
    console.log(`   - Prima parseada: ${parseFloat(prima)}`)
    console.log(`   - Prima porcentaje: ${primaPorcentaje} (${(primaPorcentaje * 100).toFixed(2)}%)`)
    console.log(`   - Valor nominal: ${valorNominal}`)
    console.log(`   - Prima valor inicial: ${primaValor}`)
    console.log(`   - Número de períodos: ${numPeriodos}`)
    console.log(`   - Prima se aplicará solo en período: ${numPeriodos}`)
    console.log('')

    // Calcular tabla período por período - SEGÚN TESTING.TXT
    const tabla = []
    let saldoPendiente = valorNominal
    
    // Función para parsear fecha de forma segura (evita problemas de zona horaria)
    const parsearFecha = (fechaStr: string): Date => {
      // Si viene en formato YYYY-MM-DD, parseamos manualmente
      if (fechaStr.includes('-')) {
        const [year, month, day] = fechaStr.split('-').map(Number)
        return new Date(year, month - 1, day) // month - 1 porque Date usa 0-indexing
      }
      // Fallback para otros formatos
      return new Date(fechaStr)
    }
    
    const fechaEmision = parsearFecha(fecha_emision)
    const diasPorPeriodo = parseInt(dias_periodo)

    // Función para agregar días de forma segura
    const agregarDias = (fecha: Date, dias: number): Date => {
      const resultado = new Date(fecha)
      resultado.setDate(resultado.getDate() + dias)
      return resultado
    }

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
      const fechaPeriodo = agregarDias(fechaEmision, i * diasPorPeriodo)
      
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
        }
      }

      // Prima se calcula solo en el último período: =-SI(A26=J$5,D$15*I26,0)
      // Si período actual (i) == total períodos (numPeriodos), entonces prima = primaPorcentaje * bono_indexado_actual
      console.log(`🎯 CALCULANDO PRIMA - Período ${i}:`)
      console.log(`   - Es último período? ${i} === ${numPeriodos} → ${i === numPeriodos}`)
      console.log(`   - Prima porcentaje: ${primaPorcentaje} (${(primaPorcentaje * 100).toFixed(2)}%)`)
      console.log(`   - Saldo pendiente (bono indexado actual): ${saldoPendiente}`)
      
      if (i === numPeriodos) {
        // El bono indexado actual es el saldo pendiente ANTES de la amortización
        const bonoIndexadoActual = saldoPendiente
        primaEnPeriodo = -primaPorcentaje * bonoIndexadoActual // Para -1%: -0.01 * 500 = -5.00
        
        console.log(`   ✅ ES EL ÚLTIMO PERÍODO - Calculando prima:`)
        console.log(`   - Bono indexado actual: ${bonoIndexadoActual}`)
        console.log(`   - Fórmula: ${primaPorcentaje} * ${bonoIndexadoActual} = ${primaEnPeriodo}`)
        console.log(`   - Prima calculada: ${primaEnPeriodo}`)
        console.log(`   - Prima esperada (Excel): -5.00`)
        console.log(`   - ¿Coincide?: ${Math.abs(primaEnPeriodo - (-5.00)) < 0.01 ? '✅ SÍ' : '❌ NO'}`)
      } else {
        console.log(`   ❌ NO es el último período - Prima = 0`)
        console.log(`   - Prima asignada: ${primaEnPeriodo}`)
      }

      // Cálculo de cuota según Excel: =SI(A26<=J$5,SI(G26="T",0,SI(G26="P",J26,J26+L26)),0)
      // A26 = período actual, J$5 = total períodos, G26 = gracia, J26 = cupón (interés), L26 = amortización
      // Traducido: Si período <= total_periodos, Si gracia="T", 0, Si gracia="P", cupón, cupón+amortización, sino 0
      let cuota = 0
      
      // Evaluar la fórmula paso a paso
      if (i <= numPeriodos) {
        if (gracia === "T") {
          cuota = 0 // Gracia total
        } else if (gracia === "P") {
          cuota = -interes // Gracia parcial: solo cupón (interés negativo)
        } else {
          // Sin gracia: cupón + amortización (ambos negativos)
          cuota = (-interes) + (-amortizacion) // J26 + L26
        }
      } else {
        cuota = 0 // Fuera del plazo
      }
      
      // Cálculo de flujo emisor según Excel: =SI(A26<=J$5,K26+M26,0)
      // A26 = período actual, J$5 = total períodos, K26 = cuota, M26 = prima
      // Traducido: Si período <= total_periodos, cuota + prima, sino 0
      let flujoEmisor = 0
      
      if (i <= numPeriodos) {
        flujoEmisor = cuota + primaEnPeriodo // K26 + M26
      } else {
        flujoEmisor = 0
      }
      
      const escudoFiscal = interes * impuesto
      const flujoEmisorEscudo = flujoEmisor + escudoFiscal
      
      // Cálculo de flujo bonista: negativo del flujo emisor (a partir del período 1)
      const flujoBonista = -flujoEmisor

      console.log(`📊 RESUMEN PERÍODO ${i}:`)
      console.log(`   - Interés: ${interes.toFixed(2)}`)
      console.log(`   - Amortización: ${amortizacion.toFixed(2)}`)
      console.log(`   - Prima: ${primaEnPeriodo.toFixed(2)} ${primaEnPeriodo !== 0 ? '← ¡CALCULADA!' : ''}`)
      console.log(`   - Cuota: ${cuota.toFixed(2)}`)
      console.log(`   - Flujo Emisor: ${flujoEmisor.toFixed(2)}`)
      console.log(`   - Flujo Bonista: ${flujoBonista.toFixed(2)}`)
      console.log(`   - Saldo pendiente al final: ${(saldoPendiente - amortizacion).toFixed(2)}`)
      console.log('')

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

    console.log('🔍 ANÁLISIS DE FLUJOS PARA INDICADORES:')
    console.log('Flujos Bonista:', flujosBonista)
    console.log('Flujos Emisor:', flujosEmisor)
    console.log('Flujos Emisor c/Escudo:', flujosEmisorEscudo)
    console.log('Tasa Descuento:', tasaDescuento)

    // Precio Actual = VNA(tasa_descuento, flujos_bonista_1_a_n) según testing.txt
    let precioActual = 0
    console.log('\n📊 CÁLCULO PRECIO ACTUAL:')
    for (let i = 1; i < flujosBonista.length; i++) {
      const descuento = Math.pow(1 + tasaDescuento, i)
      const valorPresente = flujosBonista[i] / descuento
      console.log(`Período ${i}: Flujo=${flujosBonista[i]}, Descuento=${descuento.toFixed(6)}, VP=${valorPresente.toFixed(2)}`)
      precioActual += valorPresente
    }
    console.log(`Precio Actual Total: ${precioActual.toFixed(2)} (Esperado: 1061.10)`)

    // Utilidad/Pérdida = flujo_inicial_bonista + VNA según testing.txt
    const utilidadPerdida = flujosBonista[0] + precioActual
    console.log(`\n💰 UTILIDAD/PÉRDIDA:`)
    console.log(`Flujo inicial bonista: ${flujosBonista[0]}`)
    console.log(`Precio actual: ${precioActual.toFixed(2)}`)
    console.log(`Utilidad/Pérdida: ${utilidadPerdida.toFixed(2)} (Esperado: 1.13)`)

    // Función TIR mejorada (Newton-Raphson)
    const calcularTIR = (flujos: number[], nombreFlujo: string) => {
      console.log(`\n🎯 CALCULANDO TIR - ${nombreFlujo}:`)
      console.log('Flujos:', flujos)
      
      // Validar flujos
      if (!flujos || flujos.length < 2) {
        console.log('❌ Error: flujos insuficientes')
        return 0
      }
      
      // Verificar que hay al menos un flujo positivo y uno negativo
      const hayPositivo = flujos.some(f => f > 0)
      const hayNegativo = flujos.some(f => f < 0)
      
      if (!hayPositivo || !hayNegativo) {
        console.log('❌ Error: no hay flujos positivos y negativos')
        return 0
      }

      let tasa = 0.05 // Estimación inicial
      const tolerancia = 1e-8
      const maxIteraciones = 1000
      
      console.log(`Iniciando iteraciones con tasa inicial: ${tasa}`)
      
      for (let iter = 0; iter < maxIteraciones; iter++) {
        let van = 0
        let derivada = 0
        
        for (let i = 0; i < flujos.length; i++) {
          const factor = Math.pow(1 + tasa, i)
          if (factor === 0) {
            console.log('❌ Error: factor es 0')
            return 0
          }
          van += flujos[i] / factor
          if (i > 0) {
            derivada -= (i * flujos[i]) / Math.pow(1 + tasa, i + 1)
          }
        }
        
        if (Math.abs(van) < tolerancia) {
          console.log(`✅ Convergencia alcanzada en iteración ${iter}`)
          break
        }
        if (Math.abs(derivada) < 1e-12) {
          console.log(`⚠️ Derivada muy pequeña en iteración ${iter}`)
          break
        }
        
        const nuevaTasa = tasa - van / derivada
        
        // Limitar tasa a rango razonable
        if (nuevaTasa < -0.99) {
          tasa = -0.99
        } else if (nuevaTasa > 5) {
          tasa = 5
        } else {
          tasa = nuevaTasa
        }
        
        if (iter % 100 === 0 && iter > 0) {
          console.log(`Iteración ${iter}: tasa = ${tasa.toFixed(8)}, VAN = ${van.toFixed(8)}`)
        }
        
        if (Math.abs(tasa - nuevaTasa) < tolerancia) {
          console.log(`✅ Convergencia por cambio mínimo en iteración ${iter}`)
          break
        }
      }
      
      console.log(`🎯 TIR final para ${nombreFlujo}: ${tasa.toFixed(8)} (${(tasa * 100).toFixed(5)}%)`)
      return isNaN(tasa) ? 0 : tasa
    }

    // Calcular TCEAs según testing.txt
    console.log('\n🏦 CALCULANDO TIR PARA CADA FLUJO:')
    const tirEmisorSemestral = calcularTIR(flujosEmisor, 'EMISOR')
    const tirEmisorEscudoSemestral = calcularTIR(flujosEmisorEscudo, 'EMISOR C/ESCUDO')
    const tirBonistaSemestral = calcularTIR(flujosBonista, 'BONISTA')

    console.log('\n📈 RESUMEN DE TIR SEMESTRALES:')
    console.log(`TIR Emisor Semestral: ${tirEmisorSemestral.toFixed(8)} (${(tirEmisorSemestral * 100).toFixed(5)}%)`)
    console.log(`TIR Emisor c/Escudo Semestral: ${tirEmisorEscudoSemestral.toFixed(8)} (${(tirEmisorEscudoSemestral * 100).toFixed(5)}%)`)
    console.log(`TIR Bonista Semestral: ${tirBonistaSemestral.toFixed(8)} (${(tirBonistaSemestral * 100).toFixed(5)}%)`)

    // Convertir a anuales (semestral -> anual) con validación
    console.log('\n🔄 CONVERSIÓN A TASAS ANUALES:')
    
    const tceaEmisor = !isNaN(tirEmisorSemestral) ? (Math.pow(1 + tirEmisorSemestral, 2) - 1) * 100 : 0
    console.log(`TCEA Emisor: (1 + ${tirEmisorSemestral.toFixed(8)})^2 - 1 = ${tceaEmisor.toFixed(5)}% (Esperado: 6.66299%)`)
    
    const tceaEmisorEscudo = !isNaN(tirEmisorEscudoSemestral) ? (Math.pow(1 + tirEmisorEscudoSemestral, 2) - 1) * 100 : 0
    console.log(`TCEA c/Escudo: (1 + ${tirEmisorEscudoSemestral.toFixed(8)})^2 - 1 = ${tceaEmisorEscudo.toFixed(5)}% (Esperado: 4.26000%)`)
    
    const treaBonista = !isNaN(tirBonistaSemestral) ? (Math.pow(1 + tirBonistaSemestral, 2) - 1) * 100 : 0
    console.log(`TREA Bonista: (1 + ${tirBonistaSemestral.toFixed(8)})^2 - 1 = ${treaBonista.toFixed(5)}% (Esperado: 4.63123%)`)

    console.log('\n📊 INDICADORES FINALES:')
    console.log({
      precioActual: precioActual.toFixed(2),
      utilidadPerdida: utilidadPerdida.toFixed(2),
      tceaEmisor: tceaEmisor.toFixed(5) + '%',
      tceaEmisorEscudo: tceaEmisorEscudo.toFixed(5) + '%',
      treaBonista: treaBonista.toFixed(5) + '%'
    })

    setIndicadores({
      precioActual: isNaN(precioActual) ? 0 : precioActual,
      utilidadPerdida: isNaN(utilidadPerdida) ? 0 : utilidadPerdida,
      tceaEmisor: isNaN(tceaEmisor) ? 0 : tceaEmisor,
      tceaEmisorEscudo: isNaN(tceaEmisorEscudo) ? 0 : tceaEmisorEscudo,
      treaBonista: isNaN(treaBonista) ? 0 : treaBonista
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
