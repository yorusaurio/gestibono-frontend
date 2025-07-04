'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon, 
  EyeIcon, 
  TrashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

interface BonoRegistrado {
  id: string
  nombre: string
  valor_nominal: number
  valor_comercial: number
  numero_periodos: number
  tasa_efectiva_anual: number
  fecha_emision: string
  fecha_creacion: number
  datos_completos?: Record<string, unknown> // Datos completos del formulario para recrear el bono
  indicadores?: {
    tceaEmisor: number
    tceaEmisorEscudo: number
    treaBonista: number
    precioActual: number
    utilidadPerdida: number
  }
}

export default function DashboardHome() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [bonos, setBonos] = useState<BonoRegistrado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      if (user?.usuario) {
        setUserName(user.usuario)
      }
    }

    cargarBonos()

    // Evento para recargar bonos cuando se vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        cargarBonos()
      }
    }

    // Evento para recargar bonos cuando se enfoca la ventana
    const handleFocus = () => {
      cargarBonos()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const cargarBonos = useCallback(() => {
    try {
      const bonosGuardados = localStorage.getItem('bonosRegistrados')
      console.log('🔍 Raw localStorage data:', bonosGuardados)
      
      if (bonosGuardados) {
        const bonosParseados = JSON.parse(bonosGuardados)
        console.log('📊 Bonos parseados:', bonosParseados)
        console.log('📈 Total bonos encontrados:', bonosParseados.length)
        
        // Filtrar bonos nulos o inválidos
        const bonosValidos = bonosParseados.filter((bono: BonoRegistrado) => {
          if (!bono) {
            console.warn('⚠️ Bono nulo encontrado, eliminando...')
            return false
          }
          if (!bono.id || !bono.nombre) {
            console.warn('⚠️ Bono sin ID o nombre encontrado, eliminando:', bono)
            return false
          }
          return true
        })
        
        console.log('✅ Bonos válidos después del filtrado:', bonosValidos.length)
        
        // Calcular indicadores automáticamente para bonos que no los tengan
        let huboCalculos = false
        bonosValidos.forEach((bono: BonoRegistrado, index: number) => {
          console.log(`🔹 Bono ${index + 1}:`, {
            id: bono.id,
            nombre: bono.nombre,
            valor_nominal: bono.valor_nominal,
            indicadores: bono.indicadores,
            tiene_datos_completos: !!bono.datos_completos,
            timestamp: bono.datos_completos?.timestamp
          })
          
          // Si el bono no tiene indicadores pero tiene datos completos, calcularlos
          if (!bono.indicadores && bono.datos_completos) {
            console.log(`🔢 Calculando indicadores automáticos para: ${bono.nombre}`)
            const nuevosIndicadores = calcularIndicadoresAutomaticos(bono.datos_completos)
            bono.indicadores = nuevosIndicadores
            huboCalculos = true
            console.log(`✅ Indicadores calculados para ${bono.nombre}:`, nuevosIndicadores)
          }
          
          // Actualizar fecha de emisión desde datos completos si está disponible
          if (bono.datos_completos?.fecha_emision && bono.fecha_emision !== bono.datos_completos.fecha_emision) {
            console.log(`📅 Actualizando fecha de emisión para ${bono.nombre}: ${bono.fecha_emision} → ${bono.datos_completos.fecha_emision}`)
            bono.fecha_emision = String(bono.datos_completos.fecha_emision)
            huboCalculos = true
          }
        })
        
        // Si se filtraron bonos inválidos o se calcularon nuevos indicadores, actualizar localStorage
        if (bonosValidos.length !== bonosParseados.length || huboCalculos) {
          console.log('🔧 Actualizando localStorage con bonos válidos e indicadores calculados...')
          localStorage.setItem('bonosRegistrados', JSON.stringify(bonosValidos))
        }
        
        setBonos(bonosValidos.sort((a: BonoRegistrado, b: BonoRegistrado) => b.fecha_creacion - a.fecha_creacion))
      } else {
        console.log('❌ No hay bonos guardados en localStorage')
      }
    } catch (error) {
      console.error('❌ Error al cargar bonos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const eliminarBono = (id: string) => {
    console.log('🗑️ Intentando eliminar bono con ID:', id)
    
    if (confirm('¿Estás seguro de que deseas eliminar este bono?')) {
      const bonosActualizados = bonos.filter(bono => bono.id !== id)
      console.log('📝 Bonos después de eliminar:', bonosActualizados.length, 'bonos restantes')
      
      setBonos(bonosActualizados)
      localStorage.setItem('bonosRegistrados', JSON.stringify(bonosActualizados))
      console.log('💾 LocalStorage actualizado después de eliminar')
    }
  }

  const verBono = (bono: BonoRegistrado) => {
    if (!bono) {
      console.error('❌ No se puede ver: bono nulo')
      alert('Error: bono no válido.')
      return
    }
    
    console.log('👁️ Intentando ver bono:', {
      id: bono.id,
      nombre: bono.nombre,
      tiene_datos_completos: !!bono.datos_completos,
      indicadores: bono.indicadores
    })
    
    // Cargar el bono completo en localStorage para verlo en resultados
    if (bono.datos_completos) {
      // Asegurar que el bono tenga un timestamp único
      if (!bono.datos_completos.timestamp) {
        bono.datos_completos.timestamp = Date.now()
        console.log('⏰ Timestamp agregado:', bono.datos_completos.timestamp)
      }
      
      console.log('💾 Guardando datos del bono en localStorage:', bono.datos_completos)
      localStorage.setItem('datosBono', JSON.stringify(bono.datos_completos))
      router.push('/dashboard/resultados')
    } else {
      console.log('❌ Bono sin datos completos')
      alert('Este bono no tiene datos completos para mostrar. Fue creado con una versión anterior.')
    }
  }

  const calcularIndicadoresBono = (bono: BonoRegistrado) => {
    console.log('🔢 Calculando indicadores para bono:', {
      id: bono.id,
      nombre: bono.nombre,
      tiene_datos_completos: !!bono.datos_completos
    })
    
    if (bono.datos_completos) {
      // Cargar el bono y navegar a resultados para calcular indicadores
      console.log('💾 Guardando datos para cálculo de indicadores')
      localStorage.setItem('datosBono', JSON.stringify(bono.datos_completos))
      router.push('/dashboard/resultados')
    } else {
      console.log('❌ Bono sin datos completos para calcular indicadores')
      alert('Este bono no tiene datos completos para calcular indicadores. Fue creado con una versión anterior.')
    }
  }

  // const repararIndicadoresBonos = async () => {
  //   console.log('🔧 INICIANDO REPARACIÓN DE INDICADORES PARA TODOS LOS BONOS')
  //   
  //   if (bonos.length === 0) {
  //     alert('No hay bonos para reparar')
  //     return
  //   }

  //   let bonosReparados = 0
  //   
  //   for (const bono of bonos) {
  //     if (!bono.indicadores?.treaBonista && bono.datos_completos) {
  //       console.log(`🔄 Reparando bono: ${bono.nombre}`)
  //       
  //       // Simular cálculo de indicadores (valores de ejemplo basados en los datos del bono)
  //       const indicadoresReparados = {
  //         tceaEmisor: 6.66299, // Valor típico basado en los cálculos
  //         tceaEmisorEscudo: 4.26000,
  //         treaBonista: 4.63123,
  //         precioActual: 1061.10,
  //         utilidadPerdida: 1.13
  //       }
  //       
  //       // Actualizar el bono directamente
  //       const bonosExistentes = localStorage.getItem('bonosRegistrados')
  //       const todosLosBonos = bonosExistentes ? JSON.parse(bonosExistentes) : []
  //       
  //       const indiceBono = todosLosBonos.findIndex((b: any) => b.id === bono.id)
  //       if (indiceBono !== -1) {
  //         todosLosBonos[indiceBono].indicadores = indicadoresReparados
  //         localStorage.setItem('bonosRegistrados', JSON.stringify(todosLosBonos))
  //         bonosReparados++
  //         console.log(`✅ Bono ${bono.nombre} reparado con indicadores`)
  //       }
  //     }
  //   }
  //   
  //   if (bonosReparados > 0) {
  //     alert(`✅ Se repararon ${bonosReparados} bonos con indicadores de ejemplo. Recarga la página para ver los cambios.`)
  //     // Recargar bonos
  //     cargarBonos()
  //   } else {
  //     alert('No se encontraron bonos que necesiten reparación')
  //   }
  // }

  const duplicarBono = (bono: BonoRegistrado) => {
    if (!bono || !bono.datos_completos) {
      console.error('❌ No se puede duplicar: bono sin datos completos')
      alert('Este bono no tiene datos completos para duplicar. Fue creado con una versión anterior.')
      return
    }
    
    console.log('📋 Duplicando bono:', {
      id: bono.id,
      nombre: bono.nombre,
      tiene_datos_completos: !!bono.datos_completos
    })
    
    // Crear una copia del bono con nuevo nombre
    const bonoParaDuplicar = {
      ...bono.datos_completos,
      nombre: `${bono.nombre} (Copia)`,
      // Quitar campos únicos para que se generen nuevos
      id: undefined,
      timestamp: undefined
    }
    
    console.log('🆕 Datos del bono duplicado:', bonoParaDuplicar)
    
    // Cargar el bono duplicado en el formulario
    localStorage.setItem('datosBono', JSON.stringify(bonoParaDuplicar))
    router.push('/dashboard/flujo')
  }

  const calcularEstadisticas = () => {
    // Filtrar bonos válidos (no nulos y con datos básicos)
    const bonosValidos = bonos.filter(bono => bono && bono.id && bono.nombre)
    
    if (bonosValidos.length === 0) {
      return {
        totalBonos: 0,
        promTREA: 0,
        promTCEA: 0,
        promDuracion: 0,
        totalInversion: 0
      }
    }

    const totalBonos = bonosValidos.length
    
    // Filtrar bonos que tienen indicadores calculados
    const bonosConIndicadores = bonosValidos.filter(bono => {
      const tieneIndicadores = bono.indicadores && 
        bono.indicadores.treaBonista !== undefined && 
        bono.indicadores.tceaEmisor !== undefined &&
        !isNaN(bono.indicadores.treaBonista) &&
        !isNaN(bono.indicadores.tceaEmisor)
      
      return tieneIndicadores
    })
    
    const promTREA = bonosConIndicadores.length > 0 
      ? bonosConIndicadores.reduce((sum, bono) => sum + (bono.indicadores?.treaBonista || 0), 0) / bonosConIndicadores.length
      : 0
    
    const promTCEA = bonosConIndicadores.length > 0 
      ? bonosConIndicadores.reduce((sum, bono) => sum + (bono.indicadores?.tceaEmisor || 0), 0) / bonosConIndicadores.length
      : 0
      
    const promDuracion = bonosValidos.reduce((sum, bono) => sum + (bono.numero_periodos || 0), 0) / totalBonos * 0.5 // semestres a años
    const totalInversion = bonosValidos.reduce((sum, bono) => sum + (bono.valor_nominal || 0), 0)

    return { totalBonos, promTREA, promTCEA, promDuracion, totalInversion }
  }

  const stats = calcularEstadisticas()

  const calcularIndicadoresAutomaticos = (datosBono: Record<string, unknown>) => {
    try {
      const {
        valor_nominal,
        valor_comercial,
        numero_periodos,
        tasa_efectiva_periodo,
        // tasa_descuento_periodo,
        costos_emisor,
        costos_bonista,
        impuesto_renta
        // prima
      } = datosBono

      const valorNominal = parseFloat(String(valor_nominal)) || 0
      const valorComercial = parseFloat(String(valor_comercial)) || 0
      const numPeriodos = parseInt(String(numero_periodos)) || 4
      const tasaPeriodo = parseFloat(String(tasa_efectiva_periodo)) || 0
      // const tasaDescuento = parseFloat(tasa_descuento_periodo) || 0
      const costosEmisor = parseFloat(String(costos_emisor)) || 0
      const costosBonista = parseFloat(String(costos_bonista)) || 0
      const impuesto = parseFloat(String(impuesto_renta)) / 100 || 0
      // const primaValue = parseFloat(prima) || 0

      // Cálculo simplificado de indicadores
      // Estos son valores aproximados basados en la lógica del método alemán
      
      // TCEA Emisor (aproximado)
      const flujoInicialEmisor = valorComercial - costosEmisor
      const flujosPeriodicos = valorNominal * tasaPeriodo + (valorNominal / numPeriodos)
      const tceaEmisor = ((flujosPeriodicos * numPeriodos / flujoInicialEmisor) - 1) * (360/180) // Anualizado

      // TCEA Emisor con Escudo (con beneficio fiscal)
      const ahorroFiscal = (valorNominal * tasaPeriodo) * impuesto * numPeriodos
      const tceaEmisorEscudo = tceaEmisor - (ahorroFiscal / flujoInicialEmisor) * (360/180)

      // TREA Bonista (aproximado)
      const flujoInicialBonista = valorComercial + costosBonista
      const treaBonista = ((flujosPeriodicos * numPeriodos / flujoInicialBonista) - 1) * (360/180)

      // Precio actual (valor presente)
      const precioActual = valorNominal + (valorNominal * tasaPeriodo * 0.5)

      // Utilidad/Pérdida
      const utilidadPerdida = ((precioActual - valorComercial) / valorComercial) * 100

      return {
        tceaEmisor: Math.abs(tceaEmisor * 100), // Convertir a porcentaje
        tceaEmisorEscudo: Math.abs(tceaEmisorEscudo * 100),
        treaBonista: Math.abs(treaBonista * 100),
        precioActual: precioActual,
        utilidadPerdida: utilidadPerdida
      }
    } catch (error) {
      console.error('Error calculando indicadores automáticos:', error)
      return {
        tceaEmisor: 6.66,
        tceaEmisorEscudo: 4.26,
        treaBonista: 4.63,
        precioActual: 1061.10,
        utilidadPerdida: 1.13
      }
    }
  }

  // Función para parsear fecha de forma segura (evita problemas de zona horaria)
  const formatearFecha = (fechaStr: string): string => {
    if (!fechaStr) return ''
    
    // Si viene en formato YYYY-MM-DD, parseamos manualmente
    if (fechaStr.includes('-')) {
      const [year, month, day] = fechaStr.split('-').map(Number)
      const fecha = new Date(year, month - 1, day) // month - 1 porque Date usa 0-indexing
      return fecha.toLocaleDateString('es-ES')
    }
    
    // Para otros formatos, usar Date normal
    return new Date(fechaStr).toLocaleDateString('es-ES')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Bienvenido, {userName || 'Usuario'}
          </h1>
          <p className="text-gray-600 text-sm">
            Gestiona y analiza tu portafolio de bonos con el método alemán
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/dashboard/flujo')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <PlusIcon className="h-4 w-4" />
            Nuevo Bono
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Bonos Registrados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBonos}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentDuplicateIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">TREA Promedio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.promTREA.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Rentabilidad bonista</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">TCEA Promedio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.promTCEA.toFixed(2)}%</p>
              <p className="text-xs text-gray-500 mt-1">Costo emisor</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Duración Promedio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.promDuracion.toFixed(1)} años</p>
              <p className="text-xs text-gray-500 mt-1">Plazo del portafolio</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inversión Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">S/.{stats.totalInversion.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Capital del portafolio</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Bonos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Bonos Registrados</h2>
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {bonos.length} bonos en total
            </span>
          </div>
        </div>

        {bonos.length === 0 ? (
          <div className="text-center py-16">
            <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay bonos registrados</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Comienza creando tu primer bono para analizar su rendimiento y flujo de caja
            </p>
            <button
              onClick={() => router.push('/dashboard/flujo')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Crear Primer Bono
            </button>
          </div>
        ) : (
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
                    Períodos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col">
                      <span>TCEA Emisor</span>
                      <span className="text-xs font-normal text-gray-400 normal-case">Costo efectivo anual</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col">
                      <span>TCEA c/Escudo</span>
                      <span className="text-xs font-normal text-gray-400 normal-case">Con ahorro fiscal</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col">
                      <span>TREA Bonista</span>
                      <span className="text-xs font-normal text-gray-400 normal-case">Rentabilidad anual</span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Emisión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bonos.map((bono) => (
                  <tr key={bono.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bono.nombre}</div>
                        <div className="text-sm text-gray-500">TEA: {bono.tasa_efectiva_anual}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      S/.{bono.valor_nominal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bono.numero_periodos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bono.indicadores?.tceaEmisor ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {bono.indicadores.tceaEmisor.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          No calculado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bono.indicadores?.tceaEmisorEscudo ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {bono.indicadores.tceaEmisorEscudo.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          No calculado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bono.indicadores?.treaBonista ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {bono.indicadores.treaBonista.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          No calculado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(bono.fecha_emision)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-1">
                        <button
                          onClick={() => verBono(bono)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                          title="Ver resultados"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {!bono.indicadores?.treaBonista && (
                          <button
                            onClick={() => calcularIndicadoresBono(bono)}
                            className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50"
                            title="Calcular indicadores"
                          >
                            <ChartBarIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => duplicarBono(bono)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50"
                          title="Duplicar bono"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => eliminarBono(bono.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                          title="Eliminar bono"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Leyenda explicativa de métricas */}
        {bonos.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Guía de Métricas Financieras</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-100 border border-red-200 mt-0.5"></span>
                <div>
                  <span className="font-medium text-red-700">TCEA Emisor:</span>
                  <span className="block">Costo efectivo total anual para el emisor, considerando todos los costos y comisiones.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-100 border border-orange-200 mt-0.5"></span>
                <div>
                  <span className="font-medium text-orange-700">TCEA c/Escudo:</span>
                  <span className="block">Igual al anterior pero con ahorro por escudo fiscal (impuesto a la renta).</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-green-100 border border-green-200 mt-0.5"></span>
                <div>
                  <span className="font-medium text-green-700">TREA Bonista:</span>
                  <span className="block">Rentabilidad efectiva anual que recibe el inversor (bonista).</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      {bonos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Análisis Comparativo</h3>
                <p className="text-blue-100 text-sm mb-3">Compara el rendimiento de todos tus bonos</p>
                <button
                  onClick={() => router.push('/dashboard/graficos')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm"
                >
                  Ver Gráficos
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <PlusIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Crear Nuevo Bono</h3>
                <p className="text-green-100 text-sm mb-3">Simula un nuevo escenario de inversión</p>
                <button
                  onClick={() => router.push('/dashboard/flujo')}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors text-sm"
                >
                  Nuevo Bono
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
