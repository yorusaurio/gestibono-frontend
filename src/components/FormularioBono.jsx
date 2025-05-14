'use client'

import { useForm } from 'react-hook-form'

export default function FormularioBono() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = (data) => {
    console.log('✅ Formulario enviado:', data)
    alert('Formulario enviado correctamente')
    reset()
  }

  const inputClass = (hasError) =>
    `w-full px-4 py-2 border rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 ${
      hasError ? 'border-red-500 ring-red-300' : 'border-gray-300 focus:ring-blue-500'
    } transition`

  const Label = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Formulario Bono Corporativo</h2>

      {/* DATOS GENERALES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label>Valor Nominal (S/)</Label>
          <input type="number" {...register('valor_nominal', { required: true })} className={inputClass(errors.valor_nominal)} />
        </div>
        <div>
          <Label>Plazo Total (años)</Label>
          <input type="number" {...register('plazo_total', { required: true })} className={inputClass(errors.plazo_total)} />
        </div>
        <div>
          <Label>Frecuencia de Pago</Label>
          <select {...register('frecuencia_pago')} className={inputClass(false)}>
            <option value="1">Anual</option>
            <option value="2">Semestral</option>
            <option value="4">Trimestral</option>
            <option value="12">Mensual</option>
          </select>
        </div>
        <div>
          <Label>Moneda</Label>
          <select {...register('moneda')} className={inputClass(false)}>
            <option value="USD">USD</option>
            <option value="PEN">PEN</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <Label>Fecha de Emisión</Label>
          <input type="date" {...register('fecha_emision', { required: true })} className={inputClass(errors.fecha_emision)} />
        </div>
        <div>
          <Label>Prima al Vencimiento</Label>
          <input type="number" {...register('prima')} className={inputClass(false)} />
        </div>
      </section>

      {/* TASA Y GRACIA */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label>Tipo de Tasa</Label>
          <select {...register('tipo_tasa')} className={inputClass(false)}>
            <option value="Nominal">Nominal</option>
            <option value="Efectiva">Efectiva</option>
          </select>
        </div>
        <div>
          <Label>Valor de la Tasa (%)</Label>
          <input type="number" {...register('valor_tasa', { required: true })} className={inputClass(errors.valor_tasa)} />
        </div>
        <div>
          <Label>Frecuencia de Capitalización</Label>
          <select {...register('frecuencia_capitaliza')} className={inputClass(false)}>
            <option value="">-- Solo si es nominal --</option>
            <option value="1">Anual</option>
            <option value="2">Semestral</option>
            <option value="4">Trimestral</option>
            <option value="12">Mensual</option>
          </select>
        </div>
        <div>
          <Label>Tipo de Gracia</Label>
          <select {...register('tipo_gracia')} className={inputClass(false)}>
            <option value="Ninguno">Ninguno</option>
            <option value="Total">Total</option>
            <option value="Parcial">Parcial</option>
          </select>
        </div>
        <div>
          <Label>Períodos con Gracia</Label>
          <input type="number" {...register('nro_periodos_gracia')} className={inputClass(false)} />
        </div>
      </section>

      {/* COSTOS Y DATOS DE USUARIO */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label>Costos del Emisor (S/)</Label>
          <input type="number" {...register('costos_emisor')} className={inputClass(false)} />
        </div>
        <div>
          <Label>Costos del Inversionista (S/)</Label>
          <input type="number" {...register('costos_inversionista')} className={inputClass(false)} />
        </div>
        <div>
          <Label>Usuario</Label>
          <input type="text" {...register('usuario')} className={inputClass(false)} />
        </div>
        <div>
          <Label>Contraseña</Label>
          <input type="password" {...register('clave')} className={inputClass(false)} />
        </div>
        <div>
          <Label>RUC del Emisor</Label>
          <input type="text" {...register('ruc_emisor', { required: true, minLength: 11, maxLength: 11 })} className={inputClass(errors.ruc_emisor)} />
        </div>
      </section>

      {/* BOTÓN */}
      <div className="text-right">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition">
          Calcular Flujo
        </button>
      </div>
    </form>
  )
}
