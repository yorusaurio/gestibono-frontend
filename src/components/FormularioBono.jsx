'use client'

import { useState } from 'react'

export default function FormularioBono() {
  const [form, setForm] = useState({
    valor_nominal: '',
    plazo_total: '',
    frecuencia_pago: '1',
    tipo_tasa: 'Efectiva',
    valor_tasa: '',
    frecuencia_capitaliza: '',
    moneda: 'USD',
    tipo_gracia: 'Ninguno',
    nro_periodos_gracia: '',
    prima: '',
    fecha_emision: '',
    costos_emisor: '',
    costos_inversionista: '',
    usuario: '',
    clave: '',
    ruc_emisor: ''
  })

  const [errores, setErrores] = useState({})
  const [exito, setExito] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErrores({ ...errores, [name]: '' })
    setExito(false)
  }

  const validate = () => {
    const errores = {}
    if (!form.valor_nominal) errores.valor_nominal = 'Campo obligatorio'
    if (!form.plazo_total) errores.plazo_total = 'Campo obligatorio'
    if (!form.valor_tasa) errores.valor_tasa = 'Campo obligatorio'
    if (!form.fecha_emision) errores.fecha_emision = 'Fecha inválida'
    if (!form.ruc_emisor || form.ruc_emisor.length !== 11) errores.ruc_emisor = 'Debe tener 11 dígitos'
    return errores
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const valid = validate()
    if (Object.keys(valid).length > 0) {
      setErrores(valid)
      return
    }

    console.log('Formulario válido:', form)
    setExito(true)
  }

  const inputBase =
    'w-full px-4 py-2 border rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${inputBase} ${errores[name] ? 'border-red-500' : 'border-gray-300'}`}
      />
      {errores[name] && <p className="text-xs text-red-600 mt-1">{errores[name]}</p>}
    </div>
  )

  const Select = ({ label, name, options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`${inputBase} ${errores[name] ? 'border-red-500' : 'border-gray-300'}`}
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* SECCIÓN 1 */}
      <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Datos del Bono</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Valor Nominal (S/)" name="valor_nominal" type="number" />
          <Field label="Plazo Total (años)" name="plazo_total" type="number" />
          <Select
            label="Frecuencia de Pago"
            name="frecuencia_pago"
            options={[
              ['1', 'Anual'],
              ['2', 'Semestral'],
              ['4', 'Trimestral'],
              ['12', 'Mensual']
            ]}
          />
          <Select
            label="Moneda"
            name="moneda"
            options={[
              ['USD', 'USD'],
              ['PEN', 'PEN'],
              ['EUR', 'EUR']
            ]}
          />
          <Field label="Fecha de Emisión" name="fecha_emision" type="date" />
          <Field label="Prima al Vencimiento" name="prima" type="number" />
        </div>
      </section>

      {/* SECCIÓN 2 */}
      <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Tasa y Condiciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Select
            label="Tipo de Tasa"
            name="tipo_tasa"
            options={[
              ['Nominal', 'Nominal'],
              ['Efectiva', 'Efectiva']
            ]}
          />
          <Field label="Valor de la Tasa (%)" name="valor_tasa" type="number" />
          <Select
            label="Frecuencia de Capitalización"
            name="frecuencia_capitaliza"
            options={[
              ['', '-- Solo si es nominal --'],
              ['1', 'Anual'],
              ['2', 'Semestral'],
              ['4', 'Trimestral'],
              ['12', 'Mensual']
            ]}
          />
          <Select
            label="Tipo de Gracia"
            name="tipo_gracia"
            options={[
              ['Ninguno', 'Ninguno'],
              ['Total', 'Total'],
              ['Parcial', 'Parcial']
            ]}
          />
          <Field label="Períodos con Gracia" name="nro_periodos_gracia" type="number" />
        </div>
      </section>

      {/* SECCIÓN 3 */}
      <section className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b pb-2">Costos y Usuario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Costos del Emisor (S/)" name="costos_emisor" type="number" />
          <Field label="Costos del Inversionista (S/)" name="costos_inversionista" type="number" />
          <Field label="Usuario" name="usuario" />
          <Field label="Contraseña" name="clave" type="password" />
          <Field label="RUC del Emisor" name="ruc_emisor" />
        </div>
      </section>

      {/* Botón */}
      <div className="text-right">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition"
        >
          Calcular Flujo
        </button>
        {exito && (
          <p className="text-green-600 text-sm mt-2">Datos enviados correctamente ✅</p>
        )}
      </div>
    </form>
  )
}
