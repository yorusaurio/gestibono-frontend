'use client'

import { useState } from 'react'

export default function FormularioBono2() {
  const [form, setForm] = useState({
    valor_nominal: '',
    nombre: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log(`[Cambio en ${name}]:`, value)
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Formulario de prueba enviado:', form)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Formulario de Prueba</h2>

      {/* Campo numérico */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Nominal (S/)</label>
        <input
          type="number"
          name="valor_nominal"
          value={form.valor_nominal}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej. 10000"
        />
      </div>

      {/* Campo de texto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del bono</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej. Bono Empresa"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Enviar
      </button>
    </form>
  )
}
