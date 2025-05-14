'use client'

import { useEffect, useState } from 'react'
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
  const [datos, setDatos] = useState({
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
  })

  const [original, setOriginal] = useState(null)
  const [actualizado, setActualizado] = useState(false)

  useEffect(() => {
    const user = sessionStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      setDatos(parsed)
      setOriginal(parsed)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setDatos({ ...datos, [name]: value })
    setActualizado(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sessionStorage.setItem('user', JSON.stringify(datos))
    setActualizado(true)
  }

  const sinCambios = JSON.stringify(datos) === JSON.stringify(original)

  const inputClass =
    'w-full border border-gray-300 pl-10 pr-3 py-2 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-gray-800 mb-1'

  const Field = ({ label, name, placeholder, icon: Icon, type = 'text', ...rest }) => (
    <div className="relative">
      <label className={labelClass}>{label}</label>
      <Icon className="h-5 w-5 text-gray-400 absolute left-3 top-9" />
      <input
        type={type}
        name={name}
        value={datos[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClass}
        {...rest}
      />
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

        {actualizado && (
          <div className="p-4 bg-green-100 text-green-800 text-sm rounded border border-green-200">
            ✅ Cambios guardados correctamente.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* DATOS PERSONALES */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos del Representante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Nombres" name="nombres" placeholder="Juan Carlos" icon={UserIcon} />
              <Field label="Apellidos" name="apellidos" placeholder="Rivera López" icon={UserIcon} />
              <Field label="DNI" name="dni" placeholder="12345678" icon={IdentificationIcon} inputMode="numeric" maxLength={8} pattern="\d{8}" />
              <Field label="Correo" name="correo" placeholder="correo@empresa.com" type="email" icon={EnvelopeIcon} />
              <Field label="Teléfono" name="telefono" placeholder="987654321" icon={PhoneIcon} inputMode="numeric" maxLength={9} />
              <Field label="Usuario" name="usuario" placeholder="usuario123" icon={UserIcon} />
              <Field label="Contraseña" name="clave" placeholder="••••••••" type="password" icon={KeyIcon} />
            </div>
          </section>

          {/* DATOS EMPRESA */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Datos de la Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Field label="Nombre Comercial" name="tienda" placeholder="Tienda XYZ" icon={BuildingStorefrontIcon} />
              <Field label="Razón Social" name="razon_social" placeholder="XYZ S.A.C." icon={UserIcon} />
              <Field label="RUC" name="ruc" placeholder="20123456789" icon={IdentificationIcon} inputMode="numeric" maxLength={11} pattern="\d{11}" />
              <Field label="Dirección" name="direccion" placeholder="Av. Principal 123" icon={MapPinIcon} />
            </div>
          </section>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={sinCambios}
              className={`w-full py-3 rounded text-white font-semibold text-lg transition ${
                sinCambios ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
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
