'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import Sidebar from '@/components/Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    const user = sessionStorage.getItem('user')
    if (user) {
      const { usuario } = JSON.parse(user)
      setNombre(usuario)
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.clear()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Usar el componente Sidebar mejorado */}
      <div className="relative w-64 bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl">
        <div className="h-full flex flex-col">
          {/* Sidebar content */}
          <div className="flex-1">
            <Sidebar />
          </div>
          
          {/* User info and logout button */}
          <div className="p-4 border-t border-blue-700">
            <div className="text-center mb-3">
              <p className="text-blue-200 text-xs">Hola, {nombre}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  )
}
