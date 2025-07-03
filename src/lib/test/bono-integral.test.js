import Decimal from 'decimal.js'
import { MetodoAleman } from '../estrategia/aleman'
import { CuotaInicial, ETipoDeCuotaInicial } from '../cuota-inicial'
import { Tasa, TipoTasa } from '../tasa'
import { IntervaloDeTasa } from '../intervalo-de-tasa'
import { EPeriodo } from '../periodo'
import { IntervaloDeTiempo } from '../intervalo-de-tiempo'

describe('Test Integral Bono - Datos Específicos', () => {
  test('Cálculo completo con datos del usuario', () => {
    console.log('=== INICIANDO TEST INTEGRAL - BONO VAC ALEMÁN ===')
    
    // Parámetros de entrada (según estructura JSON del Excel)
    const valorNominal = new Decimal(1000)
    const valorComercial = new Decimal(1050)
    const nroPeriodos = 4
    const tasaEfectivaAnualDecimal = 8.000 // 8% anual efectiva
    const tasaDescuentoAnualDecimal = 4.5 // 4.5% anual de descuento
    const frecuenciaPago = EPeriodo.Semestral
    const costosEmisor = 23.10
    const costosInversionista = 9.98
    const tasaImpuesto = 30 // 30%
    const primaPorcentaje = 1.0 // 1% del valor nominal
    const prima = valorNominal.toNumber() * primaPorcentaje / 100 // 10, no 50
    
    // Calcular tasas semestrales equivalentes
    const tasaEfectivaSemestral = Math.pow(1 + tasaEfectivaAnualDecimal / 100, 180/360) - 1
    const tasaDescuentoSemestral = Math.pow(1 + tasaDescuentoAnualDecimal / 100, 180/360) - 1
    
    console.log('Parámetros de entrada:')
    console.log('- Valor Nominal:', valorNominal.toNumber())
    console.log('- Valor Comercial:', valorComercial.toNumber())
    console.log('- Períodos:', nroPeriodos)
    console.log('- Frecuencia:', 'Semestral')
    console.log('- Tasa Efectiva Anual:', tasaEfectivaAnualDecimal + '%')
    console.log('- Tasa Efectiva Semestral:', (tasaEfectivaSemestral * 100).toFixed(5) + '%')
    console.log('- Tasa Descuento Anual:', tasaDescuentoAnualDecimal + '%')
    console.log('- Tasa Descuento Semestral:', (tasaDescuentoSemestral * 100).toFixed(5) + '%')
    console.log('- Prima:', prima)
    console.log('- Costos Emisor:', costosEmisor)
    console.log('- Costos Inversionista:', costosInversionista)
    console.log('- Tasa Impuesto:', tasaImpuesto + '%')
    
    // Crear cuota inicial (sin cuota inicial)
    const cuotaInicial = new CuotaInicial(ETipoDeCuotaInicial.Valor, 0)
    
    // Crear tasa de interés efectiva anual
    const tasa = new Tasa(TipoTasa.Efectiva, tasaEfectivaAnualDecimal, EPeriodo.Anual, EPeriodo.Anual)
    console.log('Tasa creada:', tasa)
    
    // Crear intervalo de tasa
    const intervaloDeTasa = new IntervaloDeTasa(tasa, 1, nroPeriodos)
    
    // Crear plazo
    const plazo = new IntervaloDeTiempo(nroPeriodos, frecuenciaPago)
    
    // Sin períodos de gracia
    const periodosDeGracia = []
    
    console.log('\n=== CREANDO PLAN DE PAGO ===')
    
    // Crear plan de pago con método alemán (basado en VALOR NOMINAL según JSON)
    const plan = new MetodoAleman({
      deuda: valorNominal,  // Usar valor nominal, no comercial
      cuotaInicial,
      tasas: [intervaloDeTasa],
      frecuenciaDePago: frecuenciaPago,
      plazo,
      periodosDeGracia
    })
    
    // Calcular el plan de pago
    try {
      plan.calcularPlanDePago()
      console.log('Plan de pago calculado exitosamente')
    } catch (error) {
      console.error('Error al calcular plan de pago:', error)
      throw error
    }
    
    console.log('\n=== RESULTADOS DEL PLAN DE PAGO ===')
    
    // Recopilar los pagos
    const pagos = []
    let pago = plan.pagoBase.pagoSiguiente
    let totalIntereses = 0
    let totalAmortizacion = 0
    let totalCuotas = 0
    
    while (pago) {
      const pagoData = {
        periodo: pago.periodo,
        saldoInicial: pago.saldoInicial.toNumber(),
        intereses: pago.intereses.toNumber(),
        amortizacion: pago.amortizacion.toNumber(),
        cuota: pago.cuota.toNumber(),
        saldoFinal: pago.saldoFinal.toNumber()
      }
      
      totalIntereses += pagoData.intereses
      totalAmortizacion += pagoData.amortizacion
      totalCuotas += pagoData.cuota
      
      pagos.push(pagoData)
      console.log(`Período ${pagoData.periodo}:`, pagoData)
      
      pago = pago.pagoSiguiente
    }
    
    console.log('\nTotales:')
    console.log('- Total Intereses:', totalIntereses.toFixed(2))
    console.log('- Total Amortización:', totalAmortizacion.toFixed(2))
    console.log('- Total Cuotas:', totalCuotas.toFixed(2))
    
    console.log('\n=== CALCULANDO FLUJOS CON IMPUESTOS ===')
    
    // Calcular flujos con impuestos y escudo fiscal
    let totalImpuestos = 0
    let totalEscudoFiscal = 0
    let flujoNetoBonista = 0
    let flujoNetoEmisor = 0
    
    pagos.forEach((pagoData, index) => {
      // Impuesto a la renta sobre intereses
      const impuestoRenta = pagoData.intereses * (tasaImpuesto / 100)
      totalImpuestos += impuestoRenta
      
      // Escudo fiscal (mismo valor que impuesto)
      const escudoFiscal = impuestoRenta
      totalEscudoFiscal += escudoFiscal
      
      // Flujo neto bonista (cuota - impuesto)
      const flujoNetoBonistaPeriodo = pagoData.cuota - impuestoRenta
      flujoNetoBonista += flujoNetoBonistaPeriodo
      
      // Flujo neto emisor (-cuota + escudo fiscal)
      const flujoNetoEmisorPeriodo = -pagoData.cuota + escudoFiscal
      flujoNetoEmisor += flujoNetoEmisorPeriodo
      
      console.log(`Período ${pagoData.periodo} - Fiscales:`)
      console.log(`  Impuesto Renta: ${impuestoRenta.toFixed(2)}`)
      console.log(`  Escudo Fiscal: ${escudoFiscal.toFixed(2)}`)
      console.log(`  Flujo Neto Bonista: ${flujoNetoBonistaPeriodo.toFixed(2)}`)
      console.log(`  Flujo Neto Emisor: ${flujoNetoEmisorPeriodo.toFixed(2)}`)
    })
    
    console.log('\nTotales Fiscales:')
    console.log('- Total Impuestos:', totalImpuestos.toFixed(2))
    console.log('- Total Escudo Fiscal:', totalEscudoFiscal.toFixed(2))
    console.log('- Flujo Neto Total Bonista:', flujoNetoBonista.toFixed(2))
    console.log('- Flujo Neto Total Emisor:', Math.abs(flujoNetoEmisor).toFixed(2))
    
    console.log('\n=== CALCULANDO INDICADORES PRINCIPALES ===')
    
    // Según el JSON del Excel, el precio actual se calcula con los flujos del bonista
    // usando la tasa de descuento (no la tasa efectiva del bono)
    
    // Calcular flujos del bonista (cuota - impuesto + prima en último período)
    const flujosBonistaParaPrecio = []
    pagos.forEach((pagoData, index) => {
      const impuestoRenta = pagoData.intereses * (tasaImpuesto / 100)
      let flujoBonista = pagoData.cuota - impuestoRenta
      
      // Agregar prima solo en el último período
      if (index === pagos.length - 1) {
        flujoBonista += prima
      }
      
      flujosBonistaParaPrecio.push(flujoBonista)
    })
    
    console.log('Flujos del bonista para precio actual:', flujosBonistaParaPrecio.map(f => f.toFixed(2)))
    
    // 1. Precio Actual: Descontar flujos del bonista usando tasa de descuento
    let precioActual = 0
    
    console.log('\nCalculando precio actual:')
    console.log('Tasa descuento semestral:', (tasaDescuentoSemestral * 100).toFixed(5) + '%')
    
    flujosBonistaParaPrecio.forEach((flujo, index) => {
      const periodo = index + 1
      const descuento = Math.pow(1 + tasaDescuentoSemestral, -periodo)
      const valorPresente = flujo * descuento
      precioActual += valorPresente
      console.log(`Período ${periodo}: Flujo=${flujo.toFixed(2)}, Descuento=${descuento.toFixed(6)}, VP=${valorPresente.toFixed(2)}`)
    })
    
    console.log('1. Precio Actual (total):', precioActual.toFixed(2))
    
    // 2. Utilidad/Pérdida: Diferencia entre precio actual y flujo inicial bonista
    const flujoInicialBonista = valorComercial.toNumber() + costosInversionista
    const utilidadAbsoluta = precioActual - flujoInicialBonista
    console.log('2. Flujo Inicial Bonista:', flujoInicialBonista.toFixed(2))
    console.log('3. Utilidad/Pérdida (absoluta):', utilidadAbsoluta.toFixed(2))
    
    console.log('\n=== CALCULANDO TASA INTERNA DE RETORNO ===')
    
    // Para el cálculo de TIR necesitamos usar una aproximación más robusta
    // Función auxiliar mejorada para TIR
    const calcularTIRSimple = (flujos) => {
      // Verificar si hay cambio de signo (requisito para TIR)
      let signoPositivo = false
      let signoNegativo = false
      
      flujos.forEach(f => {
        if (f > 0) signoPositivo = true
        if (f < 0) signoNegativo = true
      })
      
      if (!signoPositivo || !signoNegativo) {
        console.log('Warning: No hay cambio de signo en los flujos para TIR')
        return null
      }
      
      // Método de bisección para encontrar la TIR
      let tasaMin = -0.5 // -50%
      let tasaMax = 1.0   // 100%
      const precision = 0.000001
      
      for (let i = 0; i < 100; i++) {
        const tasaPrueba = (tasaMin + tasaMax) / 2
        let vpn = 0
        
        // Calcular VPN con la tasa de prueba
        for (let j = 0; j < flujos.length; j++) {
          vpn += flujos[j] / Math.pow(1 + tasaPrueba, j)
        }
        
        if (Math.abs(vpn) < precision) {
          return tasaPrueba
        }
        
        if (vpn > 0) {
          tasaMin = tasaPrueba
        } else {
          tasaMax = tasaPrueba
        }
        
        if (Math.abs(tasaMax - tasaMin) < precision) {
          return (tasaMin + tasaMax) / 2
        }
      }
      
      console.log('Warning: TIR no convergió')
      return null // No convergió
    }
    
    // 3. TCEA Emisor (sin escudo fiscal)
    // Flujo inicial: (valor comercial - costos emisor) según JSON
    const flujoInicialEmisor = valorComercial.toNumber() - costosEmisor
    const flujosEmisor = [flujoInicialEmisor]
    
    // Usar los flujos reales del plan de pagos (negativos para el emisor)
    pagos.forEach(p => flujosEmisor.push(-p.cuota))
    
    console.log('Flujos del emisor:', flujosEmisor.map(f => f.toFixed(2)))
    
    const tirSemestralEmisor = calcularTIRSimple(flujosEmisor)
    const tceaEmisor = tirSemestralEmisor ? (Math.pow(1 + tirSemestralEmisor, 2) - 1) * 100 : 0
    console.log('3. TCEA Emisor:', tceaEmisor.toFixed(5) + '%')
    
    // 4. TCEA Emisor con Escudo Fiscal
    const flujosEmisorConEscudo = [flujoInicialEmisor]
    pagos.forEach(p => {
      const escudoFiscal = p.intereses * (tasaImpuesto / 100)
      const flujoNeto = -p.cuota + escudoFiscal
      flujosEmisorConEscudo.push(flujoNeto)
    })
    
    console.log('Flujos del emisor con escudo:', flujosEmisorConEscudo.map(f => f.toFixed(2)))
    
    const tirSemestralConEscudo = calcularTIRSimple(flujosEmisorConEscudo)
    const tceaConEscudo = tirSemestralConEscudo ? (Math.pow(1 + tirSemestralConEscudo, 2) - 1) * 100 : 0
    console.log('4. TCEA Emisor c/Escudo:', tceaConEscudo.toFixed(5) + '%')
    
    // 5. TREA Bonista
    const flujoInicialBonistaTREA = -(valorComercial.toNumber() + costosInversionista)
    const flujosBonista = [flujoInicialBonistaTREA]
    pagos.forEach(p => {
      const impuesto = p.intereses * (tasaImpuesto / 100)
      const flujoNeto = p.cuota - impuesto
      flujosBonista.push(flujoNeto)
    })
    
    // Agregar prima neta al final
    const impuestoPrima = 0 // La prima no genera impuestos (es ganancia de capital)
    const primaFlujoBonista = prima - impuestoPrima
    if (flujosBonista.length > 4) {
      flujosBonista[4] += primaFlujoBonista // Sumar a último flujo
    }
    
    console.log('Flujos del bonista:', flujosBonista.map(f => f.toFixed(2)))
    
    const tirSemestralBonista = calcularTIRSimple(flujosBonista)
    const treaBonista = tirSemestralBonista ? (Math.pow(1 + tirSemestralBonista, 2) - 1) * 100 : 0
    console.log('5. TREA Bonista:', treaBonista.toFixed(5) + '%')
    
    console.log('\n=== COMPARACIÓN CON VALORES ESPERADOS (EXCEL) ===')
    console.log('RESULTADO                | CALCULADO    | ESPERADO     | DIFERENCIA')
    console.log('-------------------------|--------------|--------------|------------')
    console.log(`Precio Actual            | ${precioActual.toFixed(2).padStart(10)} | ${(1061.10).toFixed(2).padStart(10)} | ${(precioActual - 1061.10).toFixed(2).padStart(8)}`)
    console.log(`Utilidad/Pérdida         | ${utilidadAbsoluta.toFixed(2).padStart(10)} | ${(1.13).toFixed(2).padStart(10)} | ${(utilidadAbsoluta - 1.13).toFixed(2).padStart(8)}`)
    console.log(`TCEA Emisor              | ${tceaEmisor.toFixed(5).padStart(9)}% | ${(6.66299).toFixed(5).padStart(9)}% | ${(tceaEmisor - 6.66299).toFixed(5).padStart(7)}%`)
    console.log(`TCEA c/Escudo            | ${tceaConEscudo.toFixed(5).padStart(9)}% | ${(4.26000).toFixed(5).padStart(9)}% | ${(tceaConEscudo - 4.26000).toFixed(5).padStart(7)}%`)
    console.log(`TREA Bonista             | ${treaBonista.toFixed(5).padStart(9)}% | ${(4.63123).toFixed(5).padStart(9)}% | ${(treaBonista - 4.63123).toFixed(5).padStart(7)}%`)
    
    // Verificaciones con tolerancia (valores corregidos según Excel)
    expect(precioActual).toBeCloseTo(1061.10, 1)
    expect(utilidadAbsoluta).toBeCloseTo(1.13, 1)
    expect(tceaEmisor).toBeCloseTo(6.66299, 1)
    expect(tceaConEscudo).toBeCloseTo(4.26000, 1)
    expect(treaBonista).toBeCloseTo(4.63123, 1)
  })
})

// Función auxiliar para calcular TIR usando método de Newton-Raphson
function calcularTIR(flujos, periodosAnuales, precision = 0.000001, maxIteraciones = 1000) {
  let tir = 0.1 // Estimación inicial 10%
  
  for (let i = 0; i < maxIteraciones; i++) {
    let vpn = 0
    let derivada = 0
    
    // Calcular VPN y su derivada
    for (let j = 0; j < flujos.length; j++) {
      const factor = Math.pow(1 + tir, j)
      vpn += flujos[j] / factor
      derivada -= (j * flujos[j]) / Math.pow(1 + tir, j + 1)
    }
    
    // Nueva estimación usando Newton-Raphson
    const nuevaTir = tir - vpn / derivada
    
    if (Math.abs(nuevaTir - tir) < precision) {
      // Convertir a tasa anual
      return Math.pow(1 + nuevaTir, periodosAnuales) - 1
    }
    
    tir = nuevaTir
  }
  
  throw new Error('No se pudo converger en el cálculo de TIR')
}
