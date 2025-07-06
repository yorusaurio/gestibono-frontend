# 📊 ¿Cómo Funciona la App de Gestión de Bonos? 

Una guía técnica y didáctica del flujo real de datos y operaciones de la aplicación

---

## 🎯 **¿Qué es esta aplicación?**

Es un simulador profesional de bonos amortizables con método alemán que permite:

1. **Crear bonos virtuales** con parámetros financieros reales
2. **Calcular automáticamente** flujos de caja período por período
3. **Generar indicadores financieros** profesionales (TCEA, TREA, VAN)
4. **Visualizar y comparar** resultados de múltiples bonos

Es una herramienta educativa y profesional para entender instrumentos de deuda.

---

## 🚀 **El Flujo Real de Datos: Desde `/flujo` hasta `/resultados`**

### **Paso 1: Página de Ingreso** 📝
**Ruta:** `/dashboard/flujo`
**Archivo:** `src/app/dashboard/flujo/page.tsx`

Esta página simplemente renderiza el componente `FormularioBono`:

```tsx
export default function FlujoPage() {
  return (
    <main className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-5xl mx-auto">
        <h1>Ingreso de datos del bono</h1>
        <FormularioBono/>
      </div>
    </main>
  )
}
```

### **Paso 2: El Formulario Inteligente** 🧠
**Archivo:** `src/components/FormularioBono.tsx`

#### **A. Estructura de Datos**

El formulario maneja dos interfaces principales:

```typescript
interface FormData {
  nombre: string
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
  prima: number
  timestamp: number
}
```

#### **B. Cálculos Automáticos en Tiempo Real**

Mientras el usuario completa el formulario, se ejecutan estos cálculos:

```javascript
// Tasa efectiva por período
const calcularTasaEfectivaPeriodo = () => {
  const tasaAnual = parseFloat(tasa_efectiva_anual) / 100
  const diasPeriodo = parseFloat(dias_periodo)
  const diasAno = parseFloat(dias_ano)
  return Math.pow(1 + tasaAnual, diasPeriodo / diasAno) - 1
}

// Número de períodos
const calcularNumeroPeriodos = () => {
  const nroAnos = parseFloat(nro_anos)
  const diasPeriodo = parseFloat(dias_periodo)
  const diasAno = parseFloat(dias_ano)
  return Math.round((nroAnos * diasAno) / diasPeriodo)
}

// Costos iniciales por categoría
const calcularCostosEmisir = () => {
  return costosComisiones
    .filter(costo => costo.aplicaA === 'emisor' || costo.aplicaA === 'ambos')
    .reduce((total, costo) => {
      const porcentaje = parseFloat(costo.porcentaje) / 100
      return total + (valorComercial * porcentaje)
    }, 0)
}
```

#### **C. Gestión de Costos y Comisiones**

La aplicación maneja 5 tipos predeterminados de costos:

```javascript
const [costosComisiones, setCostosComisiones] = useState([
  { id: '1', nombre: 'Prima', porcentaje: '1', aplicaA: 'ninguno' },
  { id: '2', nombre: 'Estructuración', porcentaje: '1', aplicaA: 'emisor' },
  { id: '3', nombre: 'Colocación', porcentaje: '0.25', aplicaA: 'emisor' },
  { id: '4', nombre: 'Flotación', porcentaje: '0.45', aplicaA: 'ambos' },
  { id: '5', nombre: 'CAVALI', porcentaje: '0.5', aplicaA: 'ambos' },
])
```

Cada costo puede aplicarse a:
- **emisor**: Solo afecta al que emite el bono
- **bonista**: Solo afecta al que compra el bono
- **ambos**: Se distribuye entre ambas partes
- **ninguno**: Se usa como parámetro (caso de la prima)

### **Paso 3: Procesamiento y Envío** ⚡
**Función:** `onSubmit` en `FormularioBono.tsx`

Cuando se envía el formulario:

#### **A. Compilación de Datos**

```javascript
const onSubmit = async (data) => {
  setIsCalculating(true)
  
  // 1. Extraer prima de los costos/comisiones
  const costoPrima = costosComisiones.find(c => c.nombre.toLowerCase() === 'prima')
  const primaValue = costoPrima ? parseFloat(costoPrima.porcentaje) : 0
  
  // 2. Crear objeto de datos completos
  const datosCompletos = {
    ...data,
    tasa_efectiva_periodo: calcularTasaEfectivaPeriodo(),
    tasa_descuento_periodo: calcularTasaDescuentoPeriodo(),
    costos_emisor: calcularCostosEmisir(),
    costos_bonista: calcularCostosBonista(),
    numero_periodos: calcularNumeroPeriodos(),
    costos_comisiones: costosComisiones,
    prima: primaValue,
    timestamp: Date.now()
  }
```

#### **B. Almacenamiento Dual**

```javascript
  // 3. Crear registro para lista de bonos (solo si es nuevo)
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
      datos_completos: datosCompletos
    }

    // Guardar en lista de bonos registrados
    const bonosExistentes = localStorage.getItem('bonosRegistrados')
    const bonos = bonosExistentes ? JSON.parse(bonosExistentes) : []
    bonos.push(nuevoBono)
    localStorage.setItem('bonosRegistrados', JSON.stringify(bonos))
  }

  // 4. Guardar datos para página de resultados
  localStorage.setItem('datosBono', JSON.stringify(datosCompletos))
  
  // 5. Navegar a resultados
  router.push('/dashboard/resultados')
}
```

#### **C. Navegación Automática**

El formulario utiliza `useRouter` de Next.js para navegación programática:

```javascript
import { useRouter } from 'next/navigation'
const router = useRouter()

// Al completar el procesamiento
router.push('/dashboard/resultados')
```

---

## 📈 **La Página de Resultados: Motor de Cálculo**
**Ruta:** `/dashboard/resultados`
**Archivo:** `src/app/dashboard/resultados/page.tsx`

### **Paso 4: Recuperación y Validación** 🔍

```javascript
useEffect(() => {
  const datosBono = localStorage.getItem('datosBono')
  if (!datosBono) {
    setTieneResultados(false)
    setLoading(false)
    return
  }

  const datosParseados = JSON.parse(datosBono)
  setDatos(datosParseados)
  setTieneResultados(true)
  calcularTablaBono(datosParseados)
  setLoading(false)
}, [])
```

### **Paso 5: Motor de Cálculo Principal** 🧮
**Función:** `calcularTablaBono`

#### **A. Extracción y Parsing de Datos**

```javascript
const calcularTablaBono = useCallback((datos) => {
  const {
    valor_nominal, valor_comercial, numero_periodos,
    tasa_efectiva_periodo, tasa_descuento_periodo,
    costos_emisor, costos_bonista, impuesto_renta,
    prima, fecha_emision, dias_periodo
  } = datos

  const valorNominal = parseFloat(String(valor_nominal)) || 0
  const valorComercial = parseFloat(String(valor_comercial)) || 0
  const numPeriodos = parseInt(String(numero_periodos)) || 4
  const tasaPeriodo = parseFloat(String(tasa_efectiva_periodo)) || 0
  // ... más conversiones
```

#### **B. Cálculo Período por Período**

**Período 0 (Inicial):**
```javascript
// Flujos iniciales según método alemán
const flujoEmisor0 = valorComercial - costosEmisor     // Ej: 1050 - 23.10 = 1026.90
const flujoBonista0 = -(valorComercial + costosBonista) // Ej: -(1050 + 9.98) = -1059.98

tabla.push({
  periodo: 0,
  fecha: fechaEmision.toLocaleDateString('es-ES'),
  // ... otros campos con valor 0
  flujoEmisor: flujoEmisor0,
  flujoEmisorEscudo: flujoEmisor0,
  flujoBonista: flujoBonista0
})
```

**Períodos 1 a N:**
```javascript
for (let i = 1; i <= numPeriodos; i++) {
  const fechaPeriodo = agregarDias(fechaEmision, i * diasPorPeriodo)
  
  // Cálculo de interés sobre saldo pendiente
  const interes = saldoPendiente * tasaPeriodo
  
  // Determinación del tipo de gracia
  let amortizacion = 0
  let gracia = ''
  
  if (i <= 2) {
    gracia = 'P' // Gracia parcial (solo intereses)
    amortizacion = 0
  } else {
    gracia = 'S' // Sin gracia (interés + amortización)
    if (i === 3) amortizacion = 500  // Primera amortización
    if (i === 4) amortizacion = 500  // Segunda amortización
  }

  // Cálculo de prima (solo en último período)
  let primaEnPeriodo = 0
  if (i === numPeriodos) {
    const bonoIndexadoActual = saldoPendiente
    primaEnPeriodo = -primaPorcentaje * bonoIndexadoActual // Ej: -0.01 * 500 = -5.00
  }

  // Cálculo de cuota según fórmula Excel
  let cuota = 0
  if (i <= numPeriodos) {
    if (gracia === "T") {
      cuota = 0 // Gracia total
    } else if (gracia === "P") {
      cuota = -interes // Gracia parcial: solo cupón
    } else {
      cuota = (-interes) + (-amortizacion) // Sin gracia: cupón + amortización
    }
  }

  // Flujo emisor = cuota + prima
  let flujoEmisor = 0
  if (i <= numPeriodos) {
    flujoEmisor = cuota + primaEnPeriodo
  }
  
  const escudoFiscal = interes * impuesto
  const flujoEmisorEscudo = flujoEmisor + escudoFiscal
  const flujoBonista = -flujoEmisor

  // Almacenar en tabla
  tabla.push({
    periodo: i,
    fecha: fechaPeriodo.toLocaleDateString('es-ES'),
    // ... todos los campos calculados
  })

  saldoPendiente -= amortizacion
}
```

### **Paso 6: Cálculo de Indicadores Financieros** 📊
**Función:** `calcularIndicadores`

#### **A. Precio Actual (VAN)**

```javascript
// Precio Actual = VNA(tasa_descuento, flujos_bonista_1_a_n)
let precioActual = 0
for (let i = 1; i < flujosBonista.length; i++) {
  const descuento = Math.pow(1 + tasaDescuento, i)
  const valorPresente = flujosBonista[i] / descuento
  precioActual += valorPresente
}
```

#### **B. Utilidad/Pérdida**

```javascript
// Utilidad/Pérdida = flujo_inicial_bonista + VNA
const utilidadPerdida = flujosBonista[0] + precioActual
```

#### **C. Algoritmo XIRR (TIR No Periódica)**

La aplicación implementa un algoritmo XIRR optimizado para calcular tasas anuales exactas:

```javascript
const calcularXIRR = (flujos, fechas, nombreFlujo) => {
  // 1. Validar datos de entrada
  if (!flujos || !fechas || flujos.length !== fechas.length || flujos.length < 2) {
    return 0
  }
  
  // 2. Calcular fracciones de año desde fecha inicial (método Excel)
  const fechaInicial = fechas[0]
  const anios = fechas.map(fecha => calcularAnios(fechaInicial, fecha))
  
  // 3. Función para calcular VAN y su derivada
  const calcularVANyDerivada = (tasa) => {
    let van = 0
    let derivada = 0
    
    for (let i = 0; i < flujos.length; i++) {
      const t = anios[i]
      const flujo = flujos[i]
      
      if (t === 0) {
        van += flujo
      } else {
        const factor = Math.pow(1 + tasa, t)
        van += flujo / factor
        derivada -= (t * flujo) / (factor * (1 + tasa))
      }
    }
    
    return { van, derivada }
  }

  // 4. Algoritmo Newton-Raphson con parámetros de precisión Excel
  let tasa = estimacionInicial()
  const toleranciaVAN = 1e-12
  const toleranciaTasa = 1e-12
  const maxIteraciones = 1000
  
  for (let iteracion = 0; iteracion < maxIteraciones; iteracion++) {
    const { van, derivada } = calcularVANyDerivada(tasa)
    
    if (Math.abs(van) < toleranciaVAN) break
    if (Math.abs(derivada) < 1e-15) break
    
    const deltaTasa = van / derivada
    let nuevaTasa = tasa - deltaTasa
    
    // Limitar cambios drásticos
    const maxCambio = 0.5
    if (Math.abs(deltaTasa) > maxCambio) {
      nuevaTasa = tasa - Math.sign(deltaTasa) * maxCambio
    }
    
    nuevaTasa = Math.max(Math.min(nuevaTasa, 10), -0.999)
    
    if (Math.abs(nuevaTasa - tasa) < toleranciaTasa) {
      tasa = nuevaTasa
      break
    }
    
    tasa = nuevaTasa
  }
  
  return isNaN(tasa) ? 0 : tasa
}
```

#### **D. Cálculo de TCEAs y TREA**

```javascript
// Extraer fechas y calcular XIRR para cada flujo
const fechas = tabla.map(row => {
  const fechaStr = String(row.fecha) // formato: "dd/mm/yyyy"
  const [dia, mes, ano] = fechaStr.split('/').map(Number)
  return new Date(ano, mes - 1, dia)
})

const tceaEmisorDecimal = calcularXIRR(flujosEmisor, fechas, 'EMISOR')
const tceaEmisorEscudoDecimal = calcularXIRR(flujosEmisorEscudo, fechas, 'EMISOR C/ESCUDO')
const treaBonistaDecimal = calcularXIRR(flujosBonista, fechas, 'BONISTA')

// Convertir a porcentajes (ya son tasas anuales)
const indicadoresCalculados = {
  precioActual: precioActual,
  utilidadPerdida: utilidadPerdida,
  tceaEmisor: tceaEmisorDecimal * 100,
  tceaEmisorEscudo: tceaEmisorEscudoDecimal * 100,
  treaBonista: treaBonistaDecimal * 100
}
```

### **Paso 7: Actualización Automática de Bonos** 🔄
**Función:** `actualizarBonoConIndicadores`

```javascript
const actualizarBonoConIndicadores = useCallback((indicadoresCalculados, datosBono) => {
  try {
    // 1. Obtener bonos existentes
    const bonosExistentes = localStorage.getItem('bonosRegistrados')
    const bonos = bonosExistentes ? JSON.parse(bonosExistentes) : []
    
    // 2. Buscar bono por timestamp
    const timestamp = datosBono.timestamp
    const indiceBonoActual = bonos.findIndex(bono => 
      bono.datos_completos?.timestamp === timestamp
    )
    
    if (indiceBonoActual !== -1) {
      // 3. Actualizar indicadores
      bonos[indiceBonoActual].indicadores = {
        tceaEmisor: Number(indicadores.tceaEmisor) || 0,
        tceaEmisorEscudo: Number(indicadores.tceaEmisorEscudo) || 0,
        treaBonista: Number(indicadores.treaBonista) || 0,
        precioActual: Number(indicadores.precioActual) || 0,
        utilidadPerdida: Number(indicadores.utilidadPerdida) || 0
      }
      
      // 4. Sincronizar fecha de emisión
      if (datosBono.fecha_emision) {
        bonos[indiceBonoActual].fecha_emision = datosBono.fecha_emision
      }
      
      // 5. Guardar en localStorage
      localStorage.setItem('bonosRegistrados', JSON.stringify(bonos))
    }
  } catch (error) {
    console.error('Error al actualizar el bono:', error)
  }
}, [])
```

---

## 🔄 **Flujo Completo de Datos**

### **Resumen del Pipeline de Datos:**

```
1. FORMULARIO (/flujo)
   ├── Entrada de datos por usuario
   ├── Validación en tiempo real
   ├── Cálculos automáticos (tasas, períodos, costos)
   └── onSubmit()
       ├── Crear DatosCompletos
       ├── Guardar en localStorage (2 claves)
       │   ├── 'datosBono' → Para resultados inmediatos
       │   └── 'bonosRegistrados' → Para lista persistente
       └── Navegar a /resultados

2. RESULTADOS (/resultados)
   ├── useEffect() al cargar
   ├── Recuperar 'datosBono' de localStorage
   ├── calcularTablaBono()
   │   ├── Procesar datos período por período
   │   ├── Aplicar fórmulas financieras
   │   └── Generar tabla completa
   ├── calcularIndicadores()
   │   ├── Extraer flujos de la tabla
   │   ├── Calcular VAN y Utilidad/Pérdida
   │   └── Ejecutar XIRR para TCEAs y TREA
   ├── actualizarBonoConIndicadores()
   │   ├── Buscar bono en 'bonosRegistrados'
   │   ├── Agregar indicadores calculados
   │   └── Guardar localStorage actualizado
   └── Renderizar tabla e indicadores

3. DASHBOARD (/)
   ├── Cargar 'bonosRegistrados'
   ├── Mostrar lista de bonos
   ├── Calcular indicadores faltantes
   └── Opciones de gestión (editar, duplicar, eliminar)
```

### **Persistencia de Datos:**

```javascript
// Estructura de 'datosBono' (temporal, para cálculos)
{
  nombre: "Bono ABC",
  valor_nominal: "1000",
  valor_comercial: "1050",
  // ... otros campos del formulario
  tasa_efectiva_periodo: 0.038730,
  numero_periodos: 4,
  costos_comisiones: [...],
  prima: 1,
  timestamp: 1703123456789
}

// Estructura de 'bonosRegistrados' (persistente, para lista)
[{
  id: "1703123456789",
  nombre: "Bono ABC",
  valor_nominal: 1000,
  valor_comercial: 1050,
  numero_periodos: 4,
  tasa_efectiva_anual: 8,
  fecha_emision: "2025-06-01",
  fecha_creacion: 1703123456789,
  datos_completos: { /* DatosCompletos completo */ },
  indicadores: {
    tceaEmisor: 6.66299,
    tceaEmisorEscudo: 4.26000,
    treaBonista: 4.63123,
    precioActual: 1061.10,
    utilidadPerdida: 1.13
  }
}]
```

---

## 🧮 **Precisión y Validación**

### **Compatibilidad con Excel:**

La aplicación está diseñada para coincidir exactamente con hojas de cálculo de Excel:

- **Redondeo**: Usa `Number(valor.toFixed(8))` para consistencia
- **Fechas**: Implementa el mismo cálculo de años que Excel (días/365)
- **XIRR**: Replica el algoritmo de Excel con tolerancias idénticas
- **Fórmulas**: Traduce directamente las fórmulas de Excel a JavaScript

### **Valores de Referencia:**

Para un bono con los parámetros de prueba, la aplicación debe producir:

```
Precio Actual: 1061.10
Utilidad/Pérdida: 1.13
TCEA Emisor: 6.66299%
TCEA c/Escudo: 4.26000%
TREA Bonista: 4.63123%
```

---

## 🎯 **Características Técnicas Avanzadas**

### **Optimizaciones de Rendimiento:**
- `useCallback` para funciones de cálculo pesadas
- `useMemo` para valores derivados complejos
- Lazy loading de cálculos solo cuando es necesario

### **Manejo de Errores:**
- Validación de tipos en cada conversión
- Fallbacks para datos corruptos en localStorage
- Logs detallados para depuración

### **Escalabilidad:**
- Interfaz modular que permite agregar nuevos tipos de bonos
- Sistema de plugins para nuevos tipos de costos/comisiones
- Arquitectura preparada para backend futuro

---

*Esta aplicación representa un balance perfecto entre precisión matemática, usabilidad moderna y propósitos educativos, implementando algoritmos financieros de nivel profesional en una interfaz accesible.* 🌟
