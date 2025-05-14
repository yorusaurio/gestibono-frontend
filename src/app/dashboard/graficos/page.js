'use client'

import GraficoFlujo from '@/components/GraficoFlujo'
import GraficoComparativo from '@/components/GraficoComparativo'

export default function GraficosPage() {
  return (
    <main className="min-h-screen px-6 py-10 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Visualización del Flujo de Caja</h1>
          <p className="text-base text-gray-800">
            Analiza visualmente la evolución del flujo del bono y compara las métricas clave entre el emisor y el inversionista.
          </p>
        </header>

        <section className="grid gap-12">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Flujo por Período</h2>
            <GraficoFlujo />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Composición del Flujo Financiero por Período</h2>
            <GraficoComparativo />
          </div>
        </section>
      </div>
    </main>
  )
}
