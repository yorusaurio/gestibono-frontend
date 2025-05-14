'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  UserIcon,
  KeyIcon,
  IdentificationIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function PerfilPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitSuccessful }
  } = useForm({
    defaultValues: {
      nombres: '',
      apellidos: '',
      dni: '',
      usuario: '',
      clave: '',
      ruc: '',
      tienda: '',
      razon_social: '',
      correo: '',
      telefono: '',
      direccion: ''
    }
  })

  useEffect(() => {
    const stored = sessionStorage.getItem('user')
    if (stored) {
      const parsed = JSON.parse(stored)
      reset(parsed) // Inicializa los valores
    }
  }, [reset])

  const onSubmit = (data) => {
    sessionStorage.setItem('user', JSON.stringify(data))
  }

  const inputClass =
    'w-full border border-gray-300 pl-10 pr-3 py-2 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-gray-800 mb-1'

  const Field = ({ label, name, placeholder, icon: Icon, type = 'text', rules = {}, ...rest }) => (
    <div className="relative">
      <label className={labelClass}>{label}</label>
      <Icon className="h-5 w-5 text-gray-400 absolute left-3 top-9" />
      <input
        type={type}
        placeholder={placeholder}
        className={`${inputClass} ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        {...register(name, rules)}
        {...rest}
      />
      {errors[name] && (
        <p className="text-red-600 text-xs mt-1">{errors[name]?.message}</p>
      )}
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 p-10 rounded-lg shadow-md space-y-10">
        <div className="text-center">
          <UserIcon className="mx-auto h-10 w-10 text-blue-600 mb-2" />
          <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
          <p className="text-sm text-gray-600">Puedes modificar los datos registrados de tu tienda</p>
        </div>

        {isSubmitSuccessful && (
          <div className="p-4 bg-green-100 text-green-800 text-sm rounded border border-green-200">
            ✅ Cambios guardados correctamente.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* DATOS PERSONALES */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos del Representante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Nombres" name="nombres" placeholder="Juan Carlos" icon={UserIcon} rules={{ required: 'Campo requerido' }} />
              <Field label="Apellidos" name="apellidos" placeholder="Rivera López" icon={UserIcon} rules={{ required: 'Campo requerido' }} />
              <Field label="DNI" name="dni" placeholder="12345678" icon={IdentificationIcon} inputMode="numeric" maxLength={8} pattern="\d{8}" rules={{
                required: 'Campo requerido',
                minLength: { value: 8, message: 'Debe tener 8 dígitos' },
                maxLength: { value: 8, message: 'Debe tener 8 dígitos' }
              }} />
              <Field label="Correo" name="correo" placeholder="correo@empresa.com" type="email" icon={EnvelopeIcon} rules={{
                required: 'Campo requerido',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' }
              }} />
              <Field label="Teléfono" name="telefono" placeholder="987654321" icon={PhoneIcon} inputMode="numeric" maxLength={9} rules={{
                required: 'Campo requerido',
                minLength: { value: 7, message: 'Mínimo 7 dígitos' }
              }} />
              <Field label="Usuario" name="usuario" placeholder="usuario123" icon={UserIcon} rules={{ required: 'Campo requerido' }} />
              <Field label="Contraseña" name="clave" type="password" placeholder="••••••••" icon={KeyIcon} rules={{ required: 'Campo requerido' }} />
            </div>
          </section>

          {/* DATOS EMPRESA */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos de la Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Nombre Comercial" name="tienda" placeholder="Tienda XYZ" icon={BuildingStorefrontIcon} rules={{ required: 'Campo requerido' }} />
              <Field label="Razón Social" name="razon_social" placeholder="XYZ S.A.C." icon={UserIcon} rules={{ required: 'Campo requerido' }} />
              <Field label="RUC" name="ruc" placeholder="20123456789" icon={IdentificationIcon} inputMode="numeric" maxLength={11} pattern="\d{11}" rules={{
                required: 'Campo requerido',
                minLength: { value: 11, message: 'Debe tener 11 dígitos' },
                maxLength: { value: 11, message: 'Debe tener 11 dígitos' }
              }} />
              <Field label="Dirección" name="direccion" placeholder="Av. Principal 123" icon={MapPinIcon} rules={{ required: 'Campo requerido' }} />
            </div>
          </section>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={!isDirty}
              className={`w-full py-3 rounded text-white font-semibold text-lg transition ${
                !isDirty ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
