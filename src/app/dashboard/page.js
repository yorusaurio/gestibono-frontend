'use client'

import { useEffect, useState } from 'react'

export default function DashboardHome() {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    if (user?.usuario) setUserName(user.usuario)
  }, [])

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido, {userName || 'Usuario'}</h1>
        <p className="text-gray-800">
          Este es tu panel principal. Visualiza el estado general de tus bonos, accede a reportes y gestiona tu información financiera.
        </p>
      </section>

      {/* Tarjetas resumen */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Bonos Registrados', value: '5', color: 'text-blue-600' },
          { title: 'Última TREA', value: '13.42%', color: 'text-green-600' },
          { title: 'Duración Promedio', value: '4.5 años', color: 'text-yellow-600' },
          { title: 'Convexidad', value: '5.13', color: 'text-purple-600' }
        ].map((card, i) => (
          <div key={i} className="bg-white border p-4 rounded-lg shadow text-center">
            <h2 className="text-sm text-gray-700 mb-1">{card.title}</h2>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </section>

      {/* Reporte rápido */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Bonos procesados recientemente</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm text-gray-900">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">Emisor</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Tasa</th>
                <th className="px-4 py-3">TCEA</th>
                <th className="px-4 py-3">Duración</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  emisor: 'Corporación Andina SAC',
                  monto: 'S/ 100,000',
                  tasa: '12.0% Nominal',
                  tcea: '11.8%',
                  duracion: '4.2 años',
                  estado: 'Calculado'
                },
                {
                  emisor: 'Finanzas Norte SA',
                  monto: 'S/ 80,000',
                  tasa: '10.5% Efectiva',
                  tcea: '10.4%',
                  duracion: '3.7 años',
                  estado: 'En revisión'
                },
                {
                  emisor: 'Grupo Inversionista Lima',
                  monto: 'S/ 250,000',
                  tasa: '13.0% Nominal',
                  tcea: '12.5%',
                  duracion: '5.1 años',
                  estado: 'Calculado'
                }
              ].map((bono, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3 whitespace-nowrap">{bono.emisor}</td>
                  <td className="px-4 py-3">{bono.monto}</td>
                  <td className="px-4 py-3">{bono.tasa}</td>
                  <td className="px-4 py-3">{bono.tcea}</td>
                  <td className="px-4 py-3">{bono.duracion}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      bono.estado === 'Calculado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bono.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Acciones rápidas */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Agregar nuevo bono</h3>
          <p className="text-gray-700 mb-4">Dirígete al formulario para registrar un nuevo flujo de bono con método alemán.</p>
          <a href="/flujo" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Ir al formulario
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ver gráficos</h3>
          <p className="text-gray-700 mb-4">Explora visualmente la evolución del flujo financiero y la amortización.</p>
          <a href="/graficos" className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Ver gráficos
          </a>
        </div>
      </section>
    </div>
  )
}
