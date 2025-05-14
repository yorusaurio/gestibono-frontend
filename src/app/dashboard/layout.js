'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  PresentationChartLineIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    const user = sessionStorage.getItem('user')
    if (user) {
      const { usuario } = JSON.parse(user)
      setNombre(usuario)
    }
  }, [])

  const links = [
    {
      href: '/dashboard/flujo',
      label: 'Flujo de Caja',
      icon: <DocumentChartBarIcon className="h-5 w-5" />
    },
    {
      href: '/dashboard/resultados',
      label: 'Resultados',
      icon: <ChartBarIcon className="h-5 w-5" />
    },
    {
      href: '/dashboard/graficos',
      label: 'Gráficos',
      icon: <PresentationChartLineIcon className="h-5 w-5" />
    },
    {
      href: '/dashboard/perfil',
      label: 'Perfil',
      icon: <UserCircleIcon className="h-5 w-5" />
    }
  ]

  const handleLogout = () => {
    sessionStorage.clear()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white px-5 py-6 flex flex-col justify-between">
        <div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-wide">GestiBono</h1>
            <p className="text-sm text-slate-400 mt-1">Hola, {nombre}</p>
          </div>

          <nav className="flex flex-col gap-2">
            {links.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition text-sm font-medium ${
                  pathname.startsWith(href)
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:text-red-100 hover:bg-red-800/30 rounded transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  )
}
