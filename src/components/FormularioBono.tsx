'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface CostoComision {
    id: string
    nombre: string
    porcentaje: string
    aplicaA: 'emisor' | 'bonista' | 'ambos' | 'ninguno'
}

interface FormData {
    // Datos básicos del bono
    nombre: string // Agregar nombre del bono
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
}

interface DatosCompletos extends FormData {
    tasa_efectiva_periodo: number
    tasa_descuento_periodo: number
    costos_emisor: number
    costos_bonista: number
    numero_periodos: number
    costos_comisiones: CostoComision[]
    prima: number // Agregar prima como campo numérico
    timestamp: number
}

export default function FormularioBono() {
    const router = useRouter()
    const [isCalculating, setIsCalculating] = useState<boolean>(false)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [bonoId, setBonoId] = useState<string | null>(null)
    const [costosComisiones, setCostosComisiones] = useState<CostoComision[]>([
        { id: '1', nombre: 'Prima', porcentaje: '1', aplicaA: 'ninguno' },
        { id: '2', nombre: 'Estructuración', porcentaje: '1', aplicaA: 'emisor' },
        { id: '3', nombre: 'Colocación', porcentaje: '0.25', aplicaA: 'emisor' },
        { id: '4', nombre: 'Flotación', porcentaje: '0.45', aplicaA: 'ambos' },
        { id: '5', nombre: 'CAVALI', porcentaje: '0.5', aplicaA: 'ambos' },
    ])

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue
    } = useForm<FormData>({
        defaultValues: {
            // Datos básicos del bono
            nombre: '',
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
        }
    })

    // Cargar datos existentes si viene de una edición/duplicación
    useEffect(() => {
        const datosBono = localStorage.getItem('datosBono')
        if (datosBono) {
            try {
                const datos = JSON.parse(datosBono)
                console.log('Datos cargados para edición:', datos)
                
                // Cargar datos en el formulario
                setValue('nombre', datos.nombre || '')
                setValue('valor_nominal', datos.valor_nominal || '1000')
                setValue('valor_comercial', datos.valor_comercial || '1050')
                setValue('nro_anos', datos.nro_anos || '2')
                setValue('dias_periodo', datos.dias_periodo || '180')
                setValue('contador_dias', datos.contador_dias || 'ordinario')
                setValue('dias_ano', datos.dias_ano || '360')
                setValue('tasa_efectiva_anual', datos.tasa_efectiva_anual || '8')
                setValue('tasa_descuento_anual', datos.tasa_descuento_anual || '4.5')
                setValue('impuesto_renta', datos.impuesto_renta || '30')
                setValue('fecha_emision', datos.fecha_emision || '2025-06-01')
                
                // Cargar costos y comisiones si existen
                if (datos.costos_comisiones) {
                    setCostosComisiones(datos.costos_comisiones)
                }
                
                // Verificar si es una edición (tiene ID) o duplicación
                if (datos.id) {
                    setIsEditing(true)
                    setBonoId(datos.id)
                }
                
                // Limpiar el localStorage para evitar cargas no deseadas
                localStorage.removeItem('datosBono')
            } catch (error) {
                console.error('Error al cargar datos del bono:', error)
            }
        }
    }, [setValue])

    const valores = watch()

    // Funciones para manejar costos y comisiones
    const agregarCosto = () => {
        const nuevoCosto: CostoComision = {
            id: Date.now().toString(),
            nombre: '',
            porcentaje: '0',
            aplicaA: 'emisor'
        }
        setCostosComisiones([...costosComisiones, nuevoCosto])
    }

    const eliminarCosto = (id: string) => {
        setCostosComisiones(costosComisiones.filter(costo => costo.id !== id))
    }

    const actualizarCosto = (id: string, campo: keyof CostoComision, valor: string) => {
        setCostosComisiones(costosComisiones.map(costo => 
            costo.id === id ? { ...costo, [campo]: valor } : costo
        ))
    }

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
        return costosComisiones
            .filter(costo => costo.aplicaA === 'emisor' || costo.aplicaA === 'ambos')
            .reduce((total, costo) => {
                const porcentaje = parseFloat(costo.porcentaje || '0') / 100
                return total + (valorComercial * porcentaje)
            }, 0)
    }

    const calcularCostosBonista = (): number => {
        const valorComercial = parseFloat(valores.valor_comercial || '0')
        return costosComisiones
            .filter(costo => costo.aplicaA === 'bonista' || costo.aplicaA === 'ambos')
            .reduce((total, costo) => {
                const porcentaje = parseFloat(costo.porcentaje || '0') / 100
                return total + (valorComercial * porcentaje)
            }, 0)
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
            // Extraer prima de los costos/comisiones
            const costoPrima = costosComisiones.find(c => c.nombre.toLowerCase() === 'prima')
            const primaValue = costoPrima ? parseFloat(costoPrima.porcentaje) : 0
            
            // Preparar datos para enviar a la página de resultados
            const datosCompletos: DatosCompletos = {
                ...data,
                // Cálculos automáticos
                tasa_efectiva_periodo: calcularTasaEfectivaPeriodo(),
                tasa_descuento_periodo: calcularTasaDescuentoPeriodo(),
                costos_emisor: calcularCostosEmisir(),
                costos_bonista: calcularCostosBonista(),
                numero_periodos: calcularNumeroPeriodos(),
                costos_comisiones: costosComisiones,
                prima: primaValue, // Agregar prima como campo independiente
                // Timestamp para identificar el cálculo
                timestamp: Date.now()
            }

            console.log('Datos completos a enviar:', datosCompletos)
            console.log('Prima extraída:', primaValue)

            // Crear el bono para guardar en la lista (solo si es nuevo, no si es edición)
            if (!isEditing) {
                const nuevoBono = {
                    id: Date.now().toString(),
                    nombre: data.nombre || 'Bono sin nombre',
                    valor_nominal: parseFloat(data.valor_nominal),
                    valor_comercial: parseFloat(data.valor_comercial),
                    numero_periodos: calcularNumeroPeriodos(),
                    tasa_efectiva_anual: parseFloat(data.tasa_efectiva_anual),
                    fecha_emision: data.fecha_emision,
                    fecha_creacion: Date.now(),
                    datos_completos: datosCompletos // Guardamos todos los datos para poder recrear el bono
                }

                // Guardar en la lista de bonos registrados
                const bonosExistentes = localStorage.getItem('bonosRegistrados')
                const bonos = bonosExistentes ? JSON.parse(bonosExistentes) : []
                bonos.push(nuevoBono)
                localStorage.setItem('bonosRegistrados', JSON.stringify(bonos))
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

    const getColorBadge = (aplicaA: string) => {
        switch (aplicaA) {
            case 'emisor': return 'bg-red-100 text-red-800'
            case 'bonista': return 'bg-green-100 text-green-800'
            case 'ambos': return 'bg-purple-100 text-purple-800'
            case 'ninguno': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEditing ? 'Editar Bono' : 'Crear Nuevo Bono'}
                </h1>
                <p className="text-gray-600 mt-1">
                    {isEditing 
                        ? 'Modifica los parámetros del bono existente' 
                        : 'Completa los datos para simular el flujo de caja con método alemán'
                    }
                </p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Datos Básicos del Bono */}
                <div className="border-b pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos Básicos del Bono</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del Bono <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('nombre', { 
                                    required: 'El nombre del bono es obligatorio',
                                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black"
                                placeholder="Ej: Bono Corporativo ABC - Emisión 2025"
                            />
                            {errors.nombre && (
                                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                            )}
                        </div>
                        
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Costos y Comisiones (%)</h2>
                        <button
                            type="button"
                            onClick={agregarCosto}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Agregar Costo
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {costosComisiones.map((costo) => (
                            <div key={costo.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre del Costo
                                    </label>
                                    <input
                                        type="text"
                                        value={costo.nombre}
                                        onChange={(e) => actualizarCosto(costo.id, 'nombre', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-gray-900"
                                        placeholder="Ej: Prima, Estructuración"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Porcentaje (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={costo.porcentaje}
                                        onChange={(e) => actualizarCosto(costo.id, 'porcentaje', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-gray-900"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aplica a
                                    </label>
                                    <select
                                        value={costo.aplicaA}
                                        onChange={(e) => actualizarCosto(costo.id, 'aplicaA', e.target.value as CostoComision['aplicaA'])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-gray-900"
                                    >
                                        <option value="emisor">Emisor</option>
                                        <option value="bonista">Bonista</option>
                                        <option value="ambos">Ambos</option>
                                        <option value="ninguno">Ninguno</option>
                                    </select>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getColorBadge(costo.aplicaA)}`}>
                                        {costo.aplicaA === 'emisor' && 'Emisor'}
                                        {costo.aplicaA === 'bonista' && 'Bonista'}
                                        {costo.aplicaA === 'ambos' && 'Ambos'}
                                        {costo.aplicaA === 'ninguno' && 'Ninguno'}
                                    </span>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => eliminarCosto(costo.id)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1" />
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {costosComisiones.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>No hay costos agregados. Haz clic en "Agregar Costo" para comenzar.</p>
                            </div>
                        )}
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 font-medium"
                            />
                        </div>

                    </div>
                </div>

                {/* Botón de envío */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isCalculating}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCalculating ? 'Calculando...' : (isEditing ? 'Actualizar y Calcular' : 'Calcular Flujo de Caja')}
                    </button>
                </div>

            </form>
        </div>
    )
}
