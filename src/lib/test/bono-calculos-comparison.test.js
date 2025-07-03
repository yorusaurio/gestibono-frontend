// Test para comparar nuestros cálculos con la librería calculos.js existente

import { calcularMetodoAleman } from '../../lib/calculos.js'

describe('Comparación con calculos.js', () => {
  test('Verificar cálculos existentes con los mismos datos', () => {
    console.log('=== USANDO LIBRERÍA CALCULOS.JS ===')
    
    // Datos de entrada idénticos al test integral
    const input = {
      valor_nominal: 1000,
      plazo_total: 2, // 2 años
      frecuencia_pago: 2, // Semestral (2 veces por año)
      tipo_tasa: 'Efectiva',
      valor_tasa: 8, // 8% anual
      frecuencia_capitaliza: 2, // Semestral para efectiva
      prima: 50, // Prima de 5% = 50 en valor nominal 1000
      costos_emisor: 23.1,
      costos_inversionista: 9.98,
      tasa_descuento: 8 // Misma tasa para descuento
    }
    
    console.log('Datos de entrada:', input)
    
    const resultado = calcularMetodoAleman(input)
    
    console.log('\n=== RESULTADOS DE CALCULOS.JS ===')
    console.log('Indicadores:', resultado.indicadores)
    
    console.log('\nTabla de amortización:')
    resultado.tabla.forEach((fila, index) => {
      console.log(`Período ${index + 1}:`, {
        saldo_inicial: fila.saldo_inicial.toFixed(2),
        interes: fila.interes.toFixed(2),
        amortizacion: fila.amortizacion.toFixed(2),
        cuota_total: fila.cuota_total.toFixed(2),
        saldo_final: fila.saldo_final.toFixed(2),
        flujo_descuento: fila.flujo_descuento.toFixed(2)
      })
    })
    
    // Comparar algunos valores clave
    console.log('\n=== VALORES CLAVE CALCULADOS ===')
    console.log('Precio del bono (calculos.js):', resultado.indicadores.precio_bono)
    console.log('TCEA (calculos.js):', resultado.indicadores.TCEA + '%')
    console.log('TREA (calculos.js):', resultado.indicadores.TREA + '%')
    
    // Estos deberían estar más cerca de nuestros valores esperados
    expect(resultado.indicadores.precio_bono).toBeDefined()
    expect(resultado.indicadores.TCEA).toBeDefined()
    expect(resultado.indicadores.TREA).toBeDefined()
  })
})
