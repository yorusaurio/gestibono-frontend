'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserIcon, LockClosedIcon, IdentificationIcon } from '@heroicons/react/24/outline'

export default function LoginForm() {
  const router = useRouter()

  const [form, setForm] = useState({
    usuario: '',
    clave: '',
    ruc: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.usuario && form.clave && form.ruc.length === 11) {
      sessionStorage.setItem('user', JSON.stringify(form))
      router.push('/dashboard')
    } else {
      alert('Por favor completa todos los campos correctamente.')
    }
  }

  const irARegistro = () => {
    router.push('/register')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-8 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-semibold text-center mb-2">Iniciar Sesión</h2>
      <p className="text-sm text-gray-400 text-center mb-4">Accede al sistema financiero</p>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Usuario</label>
        <div className="relative">
          <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: jrivera"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
        <div className="relative">
          <LockClosedIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="password"
            name="clave"
            value={form.clave}
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">RUC del Emisor</label>
        <div className="relative">
          <IdentificationIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            name="ruc"
            value={form.ruc}
            maxLength={11}
            pattern="\d{11}"
            onChange={handleChange}
            className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="12345678901"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded-md"
      >
        Iniciar Sesión
      </button>

      <div className="text-center mt-4 text-sm text-gray-400">
        ¿No tienes una cuenta?
        <button
          type="button"
          onClick={irARegistro}
          className="ml-1 text-blue-400 hover:text-blue-500 underline"
        >
          Regístrate aquí
        </button>
      </div>
    </form>
  )
}
