'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
    // Datos básicos del bono
    valor_nominal: string
    valor_comercial: string
    nro_anos: string
    dias_periodo: string
    contador_dias: string
    dias_ano: string
    tasa_efectiva_anual: string
    tasa_descuento_anual: string
    impuesto_renta: string
    fecha_emision: string
    
    // Costos (porcentajes)
    prima: string
    estructuracion: string
    colocacion: string
    flotacion: string
    cavali: string
}

interface DatosCompletos extends FormData {
    tasa_efectiva_periodo: number
    tasa_descuento_periodo: number
    costos_emisor: number
    costos_bonista: number
    numero_periodos: number
    timestamp: number
}

export default function FormularioBono() {
    const router = useRouter()
    const [isCalculating, setIsCalculating] = useState<boolean>(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<FormData>({
        defaultValues: {
            // Datos básicos del bono
            valor_nominal: '1000',
            valor_comercial: '1050',
            nro_anos: '2',
            dias_periodo: '180', // Semestre
            contador_dias: 'ordinario',
            dias_ano: '360',
            tasa_efectiva_anual: '8',
            tasa_descuento_anual: '4.5',
            impuesto_renta: '30',
            fecha_emision: '2025-06-01',
            
            // Costos (porcentajes)
            prima: '1',
            estructuracion: '1',
            colocacion: '0.25',
            flotacion: '0.45',
            cavali: '0.5',
        }
    })

    const valores = watch()

    // Cálculos automáticos
    const calcularTasaEfectivaPeriodo = (): number => {
        const tasaAnual = parseFloat(valores.tasa_efectiva_anual || '0') / 100
        const diasPeriodo = parseFloat(valores.dias_periodo || '180')
        const diasAno = parseFloat(valores.dias_ano || '360')
        return Math.pow(1 + tasaAnual, diasPeriodo / diasAno) - 1
    }

    const calcularTasaDescuentoPeriodo = (): number => {
        const tasaAnual = parseFloat(valores.tasa_descuento_anual || '0') / 100
        const diasPeriodo = parseFloat(valores.dias_periodo || '180')
        const diasAno = parseFloat(valores.dias_ano || '360')
        return Math.pow(1 + tasaAnual, diasPeriodo / diasAno) - 1
    }

    const calcularCostosEmisir = (): number => {
        const valorComercial = parseFloat(valores.valor_comercial || '0')
        const estructuracion = parseFloat(valores.estructuracion || '0') / 100
        const colocacion = parseFloat(valores.colocacion || '0') / 100
        const flotacion = parseFloat(valores.flotacion || '0') / 100
        const cavali = parseFloat(valores.cavali || '0') / 100
        
        return valorComercial * (estructuracion + colocacion + flotacion + cavali)
    }

    const calcularCostosBonista = (): number => {
        const valorComercial = parseFloat(valores.valor_comercial || '0')
        const flotacion = parseFloat(valores.flotacion || '0') / 100
        const cavali = parseFloat(valores.cavali || '0') / 100
        
        return valorComercial * (flotacion + cavali)
    }

    const calcularNumeroPeriodos = (): number => {
        const nroAnos = parseFloat(valores.nro_anos || '0')
        const diasPeriodo = parseFloat(valores.dias_periodo || '180')
        const diasAno = parseFloat(valores.dias_ano || '360')
        return Math.round((nroAnos * diasAno) / diasPeriodo)
    }

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setIsCalculating(true)
        
        try {
            // Preparar datos para enviar a la página de resultados
            const datosCompletos: DatosCompletos = {
                ...data,
                // Cálculos automáticos
                tasa_efectiva_periodo: calcularTasaEfectivaPeriodo(),
                tasa_descuento_periodo: calcularTasaDescuentoPeriodo(),
                costos_emisor: calcularCostosEmisir(),
                costos_bonista: calcularCostosBonista(),
                numero_periodos: calcularNumeroPeriodos(),
                // Timestamp para identificar el cálculo
                timestamp: Date.now()
            }

            // Guardar en localStorage para acceso en la página de resultados
            localStorage.setItem('datosBono', JSON.stringify(datosCompletos))
            
            // Navegar a resultados
            router.push('/dashboard/resultados')
            
        } catch (error) {
            console.error('Error al procesar los datos:', error)
            alert('Error al procesar los datos. Por favor, revisa los valores ingresados.')
        } finally {
            setIsCalculating(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Datos Básicos del Bono */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos Básicos del Bono</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Nominal <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('valor_nominal', { 
                                    required: 'El valor nominal es requerido',
                                    min: { value: 0.01, message: 'Debe ser mayor a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1000"
                            />
                            {errors.valor_nominal && (
                                <p className="text-red-500 text-xs mt-1">{errors.valor_nominal.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Comercial <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('valor_comercial', { 
                                    required: 'El valor comercial es requerido',
                                    min: { value: 0.01, message: 'Debe ser mayor a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1050"
                            />
                            {errors.valor_comercial && (
                                <p className="text-red-500 text-xs mt-1">{errors.valor_comercial.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número de Años <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.5"
                                {...register('nro_anos', { 
                                    required: 'El número de años es requerido',
                                    min: { value: 0.5, message: 'Debe ser mayor a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="2"
                            />
                            {errors.nro_anos && (
                                <p className="text-red-500 text-xs mt-1">{errors.nro_anos.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Días por Período <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('dias_periodo', { required: 'Selecciona el período' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="30">Mensual (30 días)</option>
                                <option value="90">Trimestral (90 días)</option>
                                <option value="180">Semestral (180 días)</option>
                                <option value="360">Anual (360 días)</option>
                            </select>
                            {errors.dias_periodo && (
                                <p className="text-red-500 text-xs mt-1">{errors.dias_periodo.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contador de Días <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('contador_dias', { required: 'Selecciona el contador' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ordinario">Ordinario</option>
                                <option value="exacto">Exacto</option>
                            </select>
                            {errors.contador_dias && (
                                <p className="text-red-500 text-xs mt-1">{errors.contador_dias.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Días por Año <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('dias_ano', { required: 'Selecciona los días por año' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="360">360 días</option>
                                <option value="365">365 días</option>
                            </select>
                            {errors.dias_ano && (
                                <p className="text-red-500 text-xs mt-1">{errors.dias_ano.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Emisión <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                {...register('fecha_emision', { required: 'La fecha de emisión es requerida' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {errors.fecha_emision && (
                                <p className="text-red-500 text-xs mt-1">{errors.fecha_emision.message}</p>
                            )}
                        </div>

                    </div>
                </div>

                {/* Tasas */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tasa Efectiva Anual (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                {...register('tasa_efectiva_anual', { 
                                    required: 'La tasa efectiva anual es requerida',
                                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="8"
                            />
                            {errors.tasa_efectiva_anual && (
                                <p className="text-red-500 text-xs mt-1">{errors.tasa_efectiva_anual.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tasa Anual de Descuento (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                {...register('tasa_descuento_anual', { 
                                    required: 'La tasa de descuento anual es requerida',
                                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="4.5"
                            />
                            {errors.tasa_descuento_anual && (
                                <p className="text-red-500 text-xs mt-1">{errors.tasa_descuento_anual.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Impuesto a la Renta (%) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                {...register('impuesto_renta', { 
                                    required: 'El impuesto a la renta es requerido',
                                    min: { value: 0, message: 'Debe ser mayor o igual a 0' },
                                    max: { value: 100, message: 'Debe ser menor o igual a 100' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="30"
                            />
                            {errors.impuesto_renta && (
                                <p className="text-red-500 text-xs mt-1">{errors.impuesto_renta.message}</p>
                            )}
                        </div>

                    </div>
                </div>

                {/* Costos y Comisiones */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Costos y Comisiones (%)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prima (%) <span className="text-blue-500">(Ni emisor ni bonista)</span>
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                {...register('prima', { 
                                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1"
                            />
                            {errors.prima && (
                                <p className="text-red-500 text-xs mt-1">{errors.prima.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estructuración (%) <span className="text-red-500">(Emisor)</span>
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                {...register('estructuracion', { 
                                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="1"
                            />
                            {errors.estructuracion && (
                                <p className="text-red-500 text-xs mt-1">{errors.estructuracion.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Colocación (%) <span className="text-red-500">(Emisor)</span>
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                {...register('colocacion', { 
                                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.25"
                            />
                            {errors.colocacion && (
                                <p className="text-red-500 text-xs mt-1">{errors.colocacion.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Flotación (%) <span className="text-purple-500">(Ambos)</span>
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                {...register('flotacion', { 
                                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.45"
                            />
                            {errors.flotacion && (
                                <p className="text-red-500 text-xs mt-1">{errors.flotacion.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CAVALI (%) <span className="text-purple-500">(Ambos)</span>
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                {...register('cavali', { 
                                    min: { value: 0, message: 'Debe ser mayor o igual a 0' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.5"
                            />
                            {errors.cavali && (
                                <p className="text-red-500 text-xs mt-1">{errors.cavali.message}</p>
                            )}
                        </div>

                    </div>
                </div>

                {/* Cálculos Automáticos (Solo lectura) */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Cálculos Automáticos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tasa Efectiva por Período (%)
                            </label>
                            <input
                                type="text"
                                value={(calcularTasaEfectivaPeriodo() * 100).toFixed(5)}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tasa Descuento por Período (%)
                            </label>
                            <input
                                type="text"
                                value={(calcularTasaDescuentoPeriodo() * 100).toFixed(5)}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Número Total de Períodos
                            </label>
                            <input
                                type="text"
                                value={calcularNumeroPeriodos()}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Costos Iniciales Emisor
                            </label>
                            <input
                                type="text"
                                value={calcularCostosEmisir().toFixed(2)}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Costos Iniciales Bonista
                            </label>
                            <input
                                type="text"
                                value={calcularCostosBonista().toFixed(2)}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                            />
                        </div>

                    </div>
                </div>

                {/* Botón de envío */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isCalculating}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCalculating ? 'Calculando...' : 'Calcular Flujo de Caja'}
                    </button>
                </div>

            </form>
        </div>
    )
}
