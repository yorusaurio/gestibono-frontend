'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Decimal from 'decimal.js'

// Importar las clases de lógica financiera
import { MetodoAleman } from '@/lib/estrategia/aleman'
import { MetodoFrances } from '@/lib/estrategia/frances'
import { CuotaInicial, ETipoDeCuotaInicial } from '@/lib/cuota-inicial'
import { Tasa, TipoTasa } from '@/lib/tasa'
import { IntervaloDeTasa } from '@/lib/intervalo-de-tasa'
import { EPeriodo } from '@/lib/periodo'
import { IntervaloDeTiempo } from '@/lib/intervalo-de-tiempo'
import { PeriodoDeGracia, EPeriodoDeGracia } from '@/lib/periodo-de-gracia'

export default function FormularioBono() {
  const router = useRouter()
  const [isCalculating, setIsCalculating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      // Datos básicos del bono
      valor_nominal: '',
      valor_comercial: '',
      nro_periodos: '',
      frecuencia_pago: 'MENSUAL',
      metodo: 'Alemán',
      
      // Tasa de interés
      tipo_tasa: 'Efectiva',
      valor_tasa: '',
      frecuencia_capitalizacion: 'ANUAL',
      
      // Período de gracia
      tipo_gracia: 'Ninguno',
      nro_periodos_gracia: '0',
      
      // Cuota inicial
      tiene_cuota_inicial: false,
      tipo_cuota_inicial: 'Porcentual',
      valor_cuota_inicial: '0',
      
      // Costos
      costos_emisor: '0',
      costos_inversionista: '0',
    }
  })

  const tipoGracia = watch('tipo_gracia')
  const tieneCuotaInicial = watch('tiene_cuota_inicial')
  const tipoTasa = watch('tipo_tasa')

  const onSubmit = async (data) => {
    setIsCalculating(true)
    
    try {
      // Convertir datos del formulario a la lógica financiera
      const valorNominal = new Decimal(data.valor_nominal)
      const valorComercial = new Decimal(data.valor_comercial || data.valor_nominal)
      const nroPeriodos = parseInt(data.nro_periodos)
      
      // Crear cuota inicial
      const cuotaInicial = new CuotaInicial(
        data.tiene_cuota_inicial ? 
          (data.tipo_cuota_inicial === 'Porcentual' ? ETipoDeCuotaInicial.Porcentual : ETipoDeCuotaInicial.Valor) :
          ETipoDeCuotaInicial.Valor,
        data.tiene_cuota_inicial ? parseFloat(data.valor_cuota_inicial) : 0
      )

      // Crear tasa de interés
      const tasa = new Tasa(
        data.tipo_tasa === 'Nominal' ? TipoTasa.Nominal : TipoTasa.Efectiva,
        parseFloat(data.valor_tasa),
        EPeriodo.Anual, // Período base
        data.tipo_tasa === 'Nominal' ? 
          EPeriodo[data.frecuencia_capitalizacion] : 
          EPeriodo.Diaria
      )

      // Crear intervalo de tasa (para todo el período)
      const intervaloDeTasa = new IntervaloDeTasa(tasa, 1, nroPeriodos)

      // Crear plazo
      const plazo = new IntervaloDeTiempo(nroPeriodos, EPeriodo[data.frecuencia_pago])

      // Crear períodos de gracia
      let periodosDeGracia = []
      if (data.tipo_gracia !== 'Ninguno' && parseInt(data.nro_periodos_gracia) > 0) {
        const nroGracia = parseInt(data.nro_periodos_gracia)
        for (let i = 1; i <= nroGracia; i++) {
          periodosDeGracia.push(new PeriodoDeGracia(
            i, 
            data.tipo_gracia === 'Total' ? EPeriodoDeGracia.Total : EPeriodoDeGracia.Parcial
          ))
        }
      }

      // Crear plan de pago según método seleccionado
      let planDePago
      const parametros = {
        deuda: valorComercial,
        cuotaInicial,
        tasas: [intervaloDeTasa],
        frecuenciaDePago: EPeriodo[data.frecuencia_pago],
        plazo,
        periodosDeGracia
      }

      if (data.metodo === 'Alemán') {
        planDePago = new MetodoAleman(parametros)
      } else {
        planDePago = new MetodoFrances(parametros)
      }

      // Calcular el plan de pago
      planDePago.calcularPlanDePago()

      // Generar tabla de resultados
      const resultados = []
      let pagoActual = planDePago.pagoBase.pagoSiguiente

      while (pagoActual) {
        resultados.push({
          periodo: pagoActual.periodo,
          saldoInicial: pagoActual.saldoInicial.toNumber(),
          intereses: pagoActual.intereses.toNumber(),
          amortizacion: pagoActual.amortizacion.toNumber(),
          cuota: pagoActual.cuota.toNumber(),
          saldoFinal: pagoActual.saldoFinal.toNumber()
        })
        pagoActual = pagoActual.pagoSiguiente
      }

      // Guardar resultados en sessionStorage y navegar
      const datosCompletos = {
        ...data,
        resultados,
        resumen: {
          valorNominal: valorNominal.toNumber(),
          valorComercial: valorComercial.toNumber(),
          totalIntereses: resultados.reduce((sum, r) => sum + r.intereses, 0),
          totalAmortizacion: resultados.reduce((sum, r) => sum + r.amortizacion, 0),
          totalCuotas: resultados.reduce((sum, r) => sum + r.cuota, 0),
          costosEmisor: parseFloat(data.costos_emisor),
          costosInversionista: parseFloat(data.costos_inversionista)
        }
      }

      sessionStorage.setItem('calculoBono', JSON.stringify(datosCompletos))
      
      // Navegar a resultados
      router.push('/dashboard/resultados')
      
    } catch (error) {
      console.error('Error en el cálculo:', error)
      alert('Error en el cálculo. Por favor revise los datos ingresados.')
    } finally {
      setIsCalculating(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full border ${hasError ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500`

  const Label = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* DATOS BÁSICOS DEL BONO */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos Básicos del Bono</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label>Valor Nominal (S/)</Label>
            <input 
              type="number" 
              step="0.01"
              {...register('valor_nominal', { 
                required: 'Campo requerido',
                min: { value: 0.01, message: 'Debe ser mayor a 0' }
              })} 
              className={inputClass(errors.valor_nominal)} 
            />
            {errors.valor_nominal && (
              <p className="text-red-600 text-xs mt-1">{errors.valor_nominal.message}</p>
            )}
          </div>
          
          <div>
            <Label>Valor Comercial (S/)</Label>
            <input 
              type="number" 
              step="0.01"
              placeholder="Opcional - Por defecto igual al nominal"
              {...register('valor_comercial')} 
              className={inputClass(false)} 
            />
          </div>

          <div>
            <Label>Número de Períodos</Label>
            <input 
              type="number" 
              {...register('nro_periodos', { 
                required: 'Campo requerido',
                min: { value: 1, message: 'Mínimo 1 período' }
              })} 
              className={inputClass(errors.nro_periodos)} 
            />
            {errors.nro_periodos && (
              <p className="text-red-600 text-xs mt-1">{errors.nro_periodos.message}</p>
            )}
          </div>

          <div>
            <Label>Frecuencia de Pago</Label>
            <select {...register('frecuencia_pago')} className={inputClass(false)}>
              <option value="MENSUAL">Mensual</option>
              <option value="BIMESTRAL">Bimestral</option>
              <option value="TRIMESTRAL">Trimestral</option>
              <option value="CUATRIMESTRAL">Cuatrimestral</option>
              <option value="SEMESTRAL">Semestral</option>
              <option value="ANUAL">Anual</option>
            </select>
          </div>

          <div>
            <Label>Método de Amortización</Label>
            <select {...register('metodo')} className={inputClass(false)}>
              <option value="Alemán">Alemán</option>
              <option value="Francés">Francés</option>
            </select>
          </div>
        </div>
      </section>

      {/* TASA DE INTERÉS */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Tasa de Interés</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label>Tipo de Tasa</Label>
            <select {...register('tipo_tasa')} className={inputClass(false)}>
              <option value="Efectiva">Efectiva</option>
              <option value="Nominal">Nominal</option>
            </select>
          </div>

          <div>
            <Label>Valor de la Tasa (%)</Label>
            <input 
              type="number" 
              step="0.01"
              {...register('valor_tasa', { 
                required: 'Campo requerido',
                min: { value: 0, message: 'Debe ser mayor o igual a 0' }
              })} 
              className={inputClass(errors.valor_tasa)} 
            />
            {errors.valor_tasa && (
              <p className="text-red-600 text-xs mt-1">{errors.valor_tasa.message}</p>
            )}
          </div>

          {tipoTasa === 'Nominal' && (
            <div>
              <Label>Frecuencia de Capitalización</Label>
              <select {...register('frecuencia_capitalizacion')} className={inputClass(false)}>
                <option value="DIARIA">Diaria</option>
                <option value="MENSUAL">Mensual</option>
                <option value="TRIMESTRAL">Trimestral</option>
                <option value="SEMESTRAL">Semestral</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* CUOTA INICIAL */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Cuota Inicial</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              {...register('tiene_cuota_inicial')} 
              className="mr-2"
            />
            <Label>¿Tiene cuota inicial?</Label>
          </div>

          {tieneCuotaInicial && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label>Tipo de Cuota Inicial</Label>
                <select {...register('tipo_cuota_inicial')} className={inputClass(false)}>
                  <option value="Porcentual">Porcentual (%)</option>
                  <option value="Valor">Valor Fijo (S/)</option>
                </select>
              </div>

              <div>
                <Label>Valor de la Cuota Inicial</Label>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('valor_cuota_inicial', { 
                    required: tieneCuotaInicial ? 'Campo requerido' : false,
                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                  })} 
                  className={inputClass(errors.valor_cuota_inicial)} 
                />
                {errors.valor_cuota_inicial && (
                  <p className="text-red-600 text-xs mt-1">{errors.valor_cuota_inicial.message}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PERÍODO DE GRACIA */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Período de Gracia</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label>Tipo de Gracia</Label>
            <select {...register('tipo_gracia')} className={inputClass(false)}>
              <option value="Ninguno">Ninguno</option>
              <option value="Total">Total</option>
              <option value="Parcial">Parcial</option>
            </select>
          </div>

          {tipoGracia !== 'Ninguno' && (
            <div>
              <Label>Número de Períodos con Gracia</Label>
              <input 
                type="number" 
                {...register('nro_periodos_gracia', {
                  min: { value: 1, message: 'Mínimo 1 período' }
                })} 
                className={inputClass(errors.nro_periodos_gracia)} 
              />
              {errors.nro_periodos_gracia && (
                <p className="text-red-600 text-xs mt-1">{errors.nro_periodos_gracia.message}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* COSTOS ADICIONALES */}
      <section className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Costos Adicionales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label>Costos del Emisor (S/)</Label>
            <input 
              type="number" 
              step="0.01"
              {...register('costos_emisor')} 
              className={inputClass(false)} 
            />
          </div>

          <div>
            <Label>Costos del Inversionista (S/)</Label>
            <input 
              type="number" 
              step="0.01"
              {...register('costos_inversionista')} 
              className={inputClass(false)} 
            />
          </div>
        </div>
      </section>

      {/* BOTÓN DE ENVÍO */}
      <div className="text-center">
        <button 
          type="submit" 
          disabled={isCalculating}
          className={`px-8 py-3 rounded-md font-semibold text-white transition ${
            isCalculating 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isCalculating ? 'Calculando...' : 'Calcular Flujo de Caja'}
        </button>
      </div>
    </form>
  )
}
