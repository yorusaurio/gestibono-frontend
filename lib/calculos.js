// lib/calculos.js

/**
 * Calcula la tabla de amortización y métricas para un bono bajo el método alemán.
 * @param {Object} input - Datos de entrada del bono
 * @returns {Object} - Resultados: tabla, métricas e indicadores
 */
export function calcularMetodoAleman(input) {
  const {
    valor_nominal,
    plazo_total,
    frecuencia_pago,
    tipo_tasa,
    valor_tasa,
    frecuencia_capitaliza,
    prima,
    costos_emisor,
    costos_inversionista,
    fecha_emision,
    tipo_gracia,
    nro_periodos_gracia,
    tasa_descuento = valor_tasa // asumimos tasa de descuento igual a tasa si no se indica otra
  } = input

  const n = plazo_total * frecuencia_pago // total de periodos
  const tasa_periodica = tipo_tasa === 'Nominal'
    ? (valor_tasa / 100) / frecuencia_capitaliza
    : Math.pow(1 + (valor_tasa / 100), 1 / frecuencia_pago) - 1

  const amortizacion = valor_nominal / n
  const tabla = []
  let saldo = valor_nominal

  let flujo_total_emisor = 0
  let flujo_total_inversionista = 0
  let valor_presente_total = 0
  let factor_duracion = 0
  let factor_convexidad = 0

  for (let t = 1; t <= n; t++) {
    const interes = saldo * tasa_periodica
    const cuota = interes + amortizacion
    const saldo_final = saldo - amortizacion

    const flujo_emisor = -cuota - (t === 1 ? costos_emisor : 0)
    const flujo_inversionista = cuota - (t === 1 ? costos_inversionista : 0)

    const descuento = Math.pow(1 + tasa_descuento / 100 / frecuencia_pago, -t)
    const flujo_descuento = flujo_inversionista * descuento

    tabla.push({
      periodo: t,
      saldo_inicial: saldo,
      interes: interes,
      amortizacion: amortizacion,
      cuota_total: cuota,
      saldo_final: saldo_final,
      flujo_emisor,
      flujo_inversionista,
      flujo_descuento
    })

    flujo_total_emisor += flujo_emisor
    flujo_total_inversionista += flujo_inversionista
    valor_presente_total += flujo_descuento

    factor_duracion += t * flujo_descuento
    factor_convexidad += t * (t + 1) * flujo_descuento

    saldo = saldo_final
  }

  // Añadir prima al vencimiento si aplica
  if (prima > 0) {
    const descuento = Math.pow(1 + tasa_descuento / 100 / frecuencia_pago, -n)
    const flujo_prima = prima
    const flujo_descuento_prima = flujo_prima * descuento

    tabla[n - 1].flujo_inversionista += flujo_prima
    tabla[n - 1].flujo_descuento += flujo_descuento_prima
    flujo_total_inversionista += flujo_prima
    valor_presente_total += flujo_descuento_prima
    factor_duracion += n * flujo_descuento_prima
    factor_convexidad += n * (n + 1) * flujo_descuento_prima
  }

  // Indicadores
  const TCEA = Math.pow(-1 / flujo_total_emisor, 1 / n) - 1
  const TREA = Math.pow(flujo_total_inversionista / valor_presente_total, 1 / n) - 1
  const duracion = factor_duracion / valor_presente_total / frecuencia_pago
  const duracion_modificada = duracion / (1 + tasa_descuento / 100 / frecuencia_pago)
  const convexidad = factor_convexidad / (valor_presente_total * Math.pow(1 + tasa_descuento / 100 / frecuencia_pago, 2) * n * (n + 1))

  return {
    tabla,
    indicadores: {
      TCEA: +(TCEA * frecuencia_pago * 100).toFixed(4),
      TREA: +(TREA * frecuencia_pago * 100).toFixed(4),
      duracion: +duracion.toFixed(4),
      duracion_modificada: +duracion_modificada.toFixed(4),
      convexidad: +convexidad.toFixed(4),
      precio_bono: +valor_presente_total.toFixed(2)
    }
  }
}
