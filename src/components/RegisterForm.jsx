'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserIcon,
  LockClosedIcon,
  IdentificationIcon,
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    usuario: '',
    clave: '',
    confirmacion: '',
    ruc: '',
    tienda: '',
    razon_social: '',
    correo: '',
    telefono: '',
    direccion: ''
  })

  const [errores, setErrores] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setErrores({ ...errores, [name]: '' })
  }

  const validate = () => {
    const errs = {}
    if (!form.nombres) errs.nombres = 'Los nombres son obligatorios.'
    if (!form.apellidos) errs.apellidos = 'Los apellidos son obligatorios.'
    if (!form.dni || form.dni.length !== 8) errs.dni = 'DNI inválido.'
    if (!form.usuario) errs.usuario = 'Usuario obligatorio.'
    if (!form.clave) errs.clave = 'Contraseña obligatoria.'
    if (form.clave !== form.confirmacion) errs.confirmacion = 'Las contraseñas no coinciden.'
    if (!form.ruc || form.ruc.length !== 11) errs.ruc = 'RUC inválido.'
    if (!form.tienda) errs.tienda = 'Nombre comercial obligatorio.'
    if (!form.razon_social) errs.razon_social = 'Razón social obligatoria.'
    if (!form.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) errs.correo = 'Correo inválido.'
    if (!form.telefono || form.telefono.length < 7) errs.telefono = 'Teléfono inválido.'
    if (!form.direccion) errs.direccion = 'Dirección obligatoria.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const valid = validate()
    if (Object.keys(valid).length > 0) {
      setErrores(valid)
      return
    }

    sessionStorage.setItem('user', JSON.stringify(form))
    alert('Registro exitoso')
    router.push('/dashboard')
  }

  const inputClass = 'w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-semibold text-gray-300 mb-1'

  const Field = ({ label, name, type = 'text', placeholder, icon: Icon, colSpan = 'col-span-1' }) => (
    <div className={`${colSpan}`}>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <Icon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${inputClass} ${errores[name] ? 'border-red-500' : ''}`}
        />
      </div>
      {errores[name] && <p className="text-red-400 text-xs mt-1">{errores[name]}</p>}
    </div>
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 text-white px-10 py-14 rounded-xl shadow-2xl max-w-screen-xl mx-auto space-y-14"
    >
      <div className="text-center">
        <h2 className="text-5xl font-bold mb-2">Registro de Tienda</h2>
        <p className="text-md text-gray-400">Completa los datos legales y comerciales para crear tu cuenta</p>
      </div>

      {/* DATOS PERSONALES */}
      <section>
        <h3 className="text-xl font-semibold mb-6 text-gray-200 border-b border-gray-700 pb-2">Datos del Representante</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Field label="Nombres" name="nombres" placeholder="Juan Carlos" icon={UserIcon} />
          <Field label="Apellidos" name="apellidos" placeholder="Rivera López" icon={UserIcon} />
          <Field label="DNI" name="dni" placeholder="12345678" type="number" icon={IdentificationIcon} />
          <Field label="Teléfono" name="telefono" placeholder="987654321" type="tel" icon={PhoneIcon} />
          <Field label="Correo de Contacto" name="correo" placeholder="correo@empresa.com" type="email" icon={EnvelopeIcon} colSpan="col-span-2" />
          <Field label="Usuario" name="usuario" placeholder="tienda123" icon={UserIcon} />
        </div>
      </section>

      {/* DATOS EMPRESA */}
      <section>
        <h3 className="text-xl font-semibold mb-6 text-gray-200 border-b border-gray-700 pb-2">Datos de la Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Field label="Nombre Comercial" name="tienda" placeholder="Zapatería El Sol" icon={BuildingStorefrontIcon} />
          <Field label="Razón Social" name="razon_social" placeholder="El Sol S.A.C." icon={UserIcon} colSpan="md:col-span-3" />
          <Field label="RUC" name="ruc" placeholder="20123456789" type="text" inputMode="numeric" pattern="\d{11}" maxLength={11} icon={IdentificationIcon} />
          <Field label="Dirección Fiscal o Comercial" name="direccion" placeholder="Av. Siempre Viva 742, Lima" icon={MapPinIcon} colSpan="md:col-span-4" />
        </div>
      </section>

      {/* SEGURIDAD */}
      <section>
        <h3 className="text-xl font-semibold mb-6 text-gray-200 border-b border-gray-700 pb-2">Seguridad de Acceso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Contraseña" name="clave" type="password" placeholder="••••••••" icon={LockClosedIcon} />
          <Field label="Confirmar Contraseña" name="confirmacion" type="password" placeholder="••••••••" icon={LockClosedIcon} />
        </div>
      </section>

      {/* BOTÓN */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-md text-lg"
      >
        Registrarse
      </button>

      <div className="text-center text-sm text-gray-400">
        ¿Ya tienes una cuenta?
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="ml-1 text-blue-400 hover:text-blue-500 underline"
        >
          Inicia sesión
        </button>
      </div>
    </form>
  )
}
