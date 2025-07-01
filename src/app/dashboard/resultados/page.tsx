// app/resultados/page.js
'use client'

import TablaResultados from '@/components/TablaResultados'
import Indicadores from '@/components/Indicadores'

export default function ResultadosPage() {
  return (
    <main className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resultados del Flujo de Caja</h1>
          <p className="text-base text-gray-800">
            Visualiza aquí los indicadores financieros calculados y la tabla detallada del flujo del bono ingresado.
          </p>
        </header>

        {/* Indicadores financieros */}
        <section>
          <Indicadores />
        </section>

        {/* Tabla de resultados */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Detalle del Flujo</h2>
          <TablaResultados />
        </section>
      </div>
    </main>
  )
}
