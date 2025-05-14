// app/flujo/page.js
'use client'

import FormularioBono from '@/components/FormularioBono'


export default function FlujoPage() {
  return (
    <main className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ingreso de datos del bono</h1>
        <p className="text-gray-700 mb-8">
          Completa los campos requeridos para proyectar el flujo de caja de un bono con método alemán. Asegúrate de ingresar datos válidos y actualizados.
        </p>
        <FormularioBono />
      </div>
    </main>
  )
}
