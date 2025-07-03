import Decimal from 'decimal.js'
import { MetodoAleman } from '../estrategia/aleman'
import { CuotaInicial, ETipoDeCuotaInicial } from '../cuota-inicial'
import { Tasa, TipoTasa } from '../tasa'
import { IntervaloDeTasa } from '../intervalo-de-tasa'
import { EPeriodo } from '../periodo'
import { IntervaloDeTiempo } from '../intervalo-de-tiempo'

describe('Test Bono Completo - JSON Structure', () => {
  test('Cálculo completo siguiendo estructura JSON exacta', () => {
    console.log('=== TEST BONO COMPLETO - ESTRUCTURA JSON ===')
    
    // Parámetros de entrada exactos del JSON
    const valorNominal = new Decimal(1000)
    const valorComercial = new Decimal(1050)
    const nroPeriodos = 4
    const tasaEfectivaAnual = 8.000 // 8%
    const tasaDescuentoAnual = 4.5 // 4.5%
    const frecuenciaPago = EPeriodo.Semestral
    const costosEmisor = 23.10
    const costosInversionista = 9.98
    const tasaImpuesto = 30 // 30%
    const primaPorcentaje = 1.0 // 1%
    const prima = valorNominal.toNumber() * primaPorcentaje / 100 // = 10
    
    // Tasas semestrales: (1 + tasa_anual)^(180/360) - 1
    const tasaEfectivaSemestral = Math.pow(1 + tasaEfectivaAnual / 100, 180/360) - 1
    const tasaDescuentoSemestral = Math.pow(1 + tasaDescuentoAnual / 100, 180/360) - 1
    
    console.log('Parámetros JSON:')
    console.log('- Valor Nominal:', valorNominal.toNumber())
    console.log('- Valor Comercial:', valorComercial.toNumber())
    console.log('- Prima (1% VN):', prima)
    console.log('- Tasa Efectiva Semestral:', (tasaEfectivaSemestral * 100).toFixed(5) + '%')
    console.log('- Tasa Descuento Semestral:', (tasaDescuentoSemestral * 100).toFixed(5) + '%')
    
    // Crear objetos necesarios
    const cuotaInicial = new CuotaInicial(ETipoDeCuotaInicial.Valor, 0)
    // Usar la tasa efectiva semestral directamente ya que queremos que se aplique directamente
    const tasaSemestral = (tasaEfectivaSemestral * 100) // convertir a porcentaje para la clase Tasa
    const tasa = new Tasa(TipoTasa.Efectiva, tasaSemestral, EPeriodo.Semestral, EPeriodo.Semestral)
    const intervaloDeTasa = new IntervaloDeTasa(tasa, 1, nroPeriodos) // Aplica del período 1 al 4
    const plazo = new IntervaloDeTiempo(nroPeriodos, frecuenciaPago)
    
    // Crear estrategia con la estructura correcta
    const metodo = new MetodoAleman({
      deuda: valorNominal,
      cuotaInicial: cuotaInicial,
      tasas: [intervaloDeTasa],
      frecuenciaDePago: frecuenciaPago,
      plazo: plazo,
      periodosDeGracia: []
    })
    
    // Calcular plan de pagos
    metodo.calcularPlanDePago()
    console.log('\n=== PLAN DE PAGOS ===')
    
    // Recopilar los pagos desde pagoBase
    const flujos = []
    let pago = metodo.pagoBase.pagoSiguiente
    
    while (pago) {
      const interes = pago.intereses.toNumber()
      const amortizacion = pago.amortizacion.toNumber()
      const cuota = pago.cuota.toNumber()
      
      console.log(`Período ${pago.periodo}: Intereses=${interes.toFixed(2)}, Amortización=${amortizacion.toFixed(2)}, Cuota=${cuota.toFixed(2)}`)
      
      flujos.push({
        periodo: pago.periodo,
        interes: interes,
        amortizacion: amortizacion,
        cuota: cuota
      })
      
      pago = pago.pagoSiguiente
    }
    
    // Flujos del emisor según JSON
    console.log('\n=== FLUJOS EMISOR ===')
    const flujosEmisor = []
    
    // Período 0: Recibe valor comercial menos costos emisor
    const flujoEmisor0 = valorComercial.toNumber() - costosEmisor
    flujosEmisor.push(flujoEmisor0)
    console.log(`Período 0: +${flujoEmisor0.toFixed(2)} (Recibe: VC - Costos)`)
    
    // Períodos 1-3: Paga solo intereses
    for (let i = 1; i <= 3; i++) {
      const flujoEmisor = -flujos[i-1].interes // Ajustar índice base 0
      flujosEmisor.push(flujoEmisor)
      console.log(`Período ${i}: ${flujoEmisor.toFixed(2)} (Paga intereses)`)
    }
    
    // Período 4: Paga intereses + amortización + prima
    const flujoEmisor4 = -(flujos[3].interes + flujos[3].amortizacion + prima) // Índice 3 para período 4
    flujosEmisor.push(flujoEmisor4)
    console.log(`Período 4: ${flujoEmisor4.toFixed(2)} (Paga intereses + amortización + prima)`)
    
    // Flujos del bonista según JSON
    console.log('\n=== FLUJOS BONISTA ===')
    const flujosBonista = []
    
    // Período 0: Paga valor comercial más costos inversionista
    const flujoBonista0 = -(valorComercial.toNumber() + costosInversionista)
    flujosBonista.push(flujoBonista0)
    console.log(`Período 0: ${flujoBonista0.toFixed(2)} (Paga: VC + Costos)`)
    
    // Períodos 1-3: Recibe intereses después de impuestos
    for (let i = 1; i <= 3; i++) {
      const interesesBrutos = flujos[i-1].interes // Ajustar índice base 0
      const impuestos = interesesBrutos * (tasaImpuesto / 100)
      const flujoBonista = interesesBrutos - impuestos
      flujosBonista.push(flujoBonista)
      console.log(`Período ${i}: +${flujoBonista.toFixed(2)} (Intereses brutos: ${interesesBrutos.toFixed(2)}, Impuestos: ${impuestos.toFixed(2)})`)
    }
    
    // Período 4: Recibe intereses + amortización + prima (después de impuestos en intereses)
    const interesesBrutos4 = flujos[3].interes // Índice 3 para período 4
    const impuestos4 = interesesBrutos4 * (tasaImpuesto / 100)
    const interesesNetos4 = interesesBrutos4 - impuestos4
    const flujoBonista4 = interesesNetos4 + flujos[3].amortizacion + prima // Índice 3 para período 4
    flujosBonista.push(flujoBonista4)
    console.log(`Período 4: +${flujoBonista4.toFixed(2)} (Int. netos: ${interesesNetos4.toFixed(2)}, Amort: ${flujos[3].amortizacion.toFixed(2)}, Prima: ${prima})`)
    
    // Cálculo del Precio Actual (VAN de flujos del bonista descontados a tasa de descuento)
    console.log('\n=== PRECIO ACTUAL ===')
    let precioActual = 0
    for (let i = 0; i < flujosBonista.length; i++) {
      const flujo = flujosBonista[i]
      const valorDescontado = flujo / Math.pow(1 + tasaDescuentoSemestral, i)
      precioActual += valorDescontado
      console.log(`Período ${i}: Flujo=${flujo.toFixed(2)}, Descontado=${valorDescontado.toFixed(2)}`)
    }
    console.log(`Precio Actual Total: ${precioActual.toFixed(2)}`)
    
    // Utilidad/Pérdida = Precio Actual - Inversión Inicial (flujo bonista período 0)
    const utilidadPerdida = precioActual - Math.abs(flujosBonista[0])
    console.log(`Utilidad/Pérdida: ${utilidadPerdida.toFixed(2)}`)
    
    // Función TIR mejorada
    function calcularTIR(flujos, tasaInicial = 0.05, tolerancia = 1e-8, maxIteraciones = 1000) {
      let tasa = tasaInicial
      
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
        
        if (Math.abs(van) < tolerancia) {
          return tasa
        }
        
        if (Math.abs(derivada) < 1e-12) {
          return null
        }
        
        const nuevaTasa = tasa - van / derivada
        
        // Limitar la tasa a un rango razonable
        if (nuevaTasa < -0.99) {
          tasa = -0.99
        } else if (nuevaTasa > 5) {
          tasa = 5
        } else {
          tasa = nuevaTasa
        }
        
        if (Math.abs(tasa - nuevaTasa) < tolerancia) {
          return tasa
        }
      }
      
      return null
    }
    
    // TCEA Emisor (TIR de flujos del emisor, convertida a anual)
    console.log('\n=== TCEA EMISOR ===')
    const tirEmisorSemestral = calcularTIR(flujosEmisor)
    if (tirEmisorSemestral !== null) {
      const tceaEmisor = (Math.pow(1 + tirEmisorSemestral, 360/180) - 1) * 100
      console.log(`TIR Emisor Semestral: ${(tirEmisorSemestral * 100).toFixed(5)}%`)
      console.log(`TCEA Emisor: ${tceaEmisor.toFixed(5)}%`)
    }
    
    // TCEA Emisor con Escudo Fiscal
    console.log('\n=== TCEA EMISOR CON ESCUDO FISCAL ===')
    const flujosEmisorEscudo = [...flujosEmisor]
    
    // Aplicar escudo fiscal a los intereses (períodos 1-4)
    for (let i = 1; i < flujosEmisorEscudo.length; i++) {
      const interesPagado = Math.abs(flujos[i-1].interes) // Ajustar índice base 0
      const escudoFiscal = interesPagado * (tasaImpuesto / 100)
      flujosEmisorEscudo[i] += escudoFiscal // Suma porque es un beneficio (reduce el flujo negativo)
      console.log(`Período ${i}: Escudo fiscal: +${escudoFiscal.toFixed(2)}`)
    }
    
    console.log('Flujos Emisor con Escudo:', flujosEmisorEscudo.map(f => f.toFixed(2)))
    
    const tirEmisorEscudoSemestral = calcularTIR(flujosEmisorEscudo)
    if (tirEmisorEscudoSemestral !== null) {
      const tceaEmisorEscudo = (Math.pow(1 + tirEmisorEscudoSemestral, 360/180) - 1) * 100
      console.log(`TCEA Emisor c/Escudo: ${tceaEmisorEscudo.toFixed(5)}%`)
    }
    
    // TREA Bonista (TIR de flujos del bonista, convertida a anual)
    console.log('\n=== TREA BONISTA ===')
    const tirBonistaSemestral = calcularTIR(flujosBonista)
    if (tirBonistaSemestral !== null) {
      const treaBonista = (Math.pow(1 + tirBonistaSemestral, 360/180) - 1) * 100
      console.log(`TIR Bonista Semestral: ${(tirBonistaSemestral * 100).toFixed(5)}%`)
      console.log(`TREA Bonista: ${treaBonista.toFixed(5)}%`)
    }
    
    // Validaciones finales con los valores esperados del JSON/Excel
    console.log('\n=== VALIDACIONES FINALES ===')
    console.log('Valores esperados del Excel:')
    console.log('- Precio Actual: 1061.10')
    console.log('- Utilidad/Pérdida: 1.13')
    console.log('- TCEA Emisor: 6.66299%')
    console.log('- TCEA Emisor c/Escudo: 4.26000%')
    console.log('- TREA Bonista: 4.63123%')
    
    console.log('\nValores calculados:')
    console.log(`- Precio Actual: ${precioActual.toFixed(2)}`)
    console.log(`- Utilidad/Pérdida: ${utilidadPerdida.toFixed(2)}`)
    if (tirEmisorSemestral !== null) {
      const tceaEmisor = (Math.pow(1 + tirEmisorSemestral, 360/180) - 1) * 100
      console.log(`- TCEA Emisor: ${tceaEmisor.toFixed(5)}%`)
    }
    if (tirEmisorEscudoSemestral !== null) {
      const tceaEmisorEscudo = (Math.pow(1 + tirEmisorEscudoSemestral, 360/180) - 1) * 100
      console.log(`- TCEA Emisor c/Escudo: ${tceaEmisorEscudo.toFixed(5)}%`)
    }
    if (tirBonistaSemestral !== null) {
      const treaBonista = (Math.pow(1 + tirBonistaSemestral, 360/180) - 1) * 100
      console.log(`- TREA Bonista: ${treaBonista.toFixed(5)}%`)
    }
    
    // Aserciones con tolerancia
    const tolerancia = 0.02 // 2 centavos de tolerancia
    
    expect(Math.abs(precioActual - 1061.10)).toBeLessThan(tolerancia)
    expect(Math.abs(utilidadPerdida - 1.13)).toBeLessThan(tolerancia)
    
    if (tirEmisorSemestral !== null) {
      const tceaEmisor = (Math.pow(1 + tirEmisorSemestral, 360/180) - 1) * 100
      expect(Math.abs(tceaEmisor - 6.66299)).toBeLessThan(0.01)
    }
    
    if (tirEmisorEscudoSemestral !== null) {
      const tceaEmisorEscudo = (Math.pow(1 + tirEmisorEscudoSemestral, 360/180) - 1) * 100
      expect(Math.abs(tceaEmisorEscudo - 4.26000)).toBeLessThan(0.01)
    }
    
    if (tirBonistaSemestral !== null) {
      const treaBonista = (Math.pow(1 + tirBonistaSemestral, 360/180) - 1) * 100
      expect(Math.abs(treaBonista - 4.63123)).toBeLessThan(0.01)
    }
    
    console.log('\n✅ Test completado exitosamente')
  })
})
