import { 
  HomeIcon, 
  DocumentIcon, 
  ChartBarIcon, 
  TableCellsIcon,
  UserIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon,
      description: 'Vista general de todos tus bonos'
    },
    { 
      name: 'Nuevo Bono', 
      href: '/dashboard/flujo', 
      icon: PlusIcon,
      description: 'Crear y configurar un nuevo bono'
    },
    { 
      name: 'Gráficos', 
      href: '/dashboard/graficos', 
      icon: ChartBarIcon,
      description: 'Análisis visual y comparativo'
    },
    { 
      name: 'Resultados', 
      href: '/dashboard/resultados', 
      icon: TableCellsIcon,
      description: 'Detalles del último bono calculado'
    },
    { 
      name: 'Perfil', 
      href: '/dashboard/perfil', 
      icon: UserIcon,
      description: 'Configuración de usuario'
    },
  ]

  return (
    <aside className="w-72 bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl h-full">
      <div className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Gestibono</h2>
          <p className="text-blue-200 text-sm">Simulador de Bonos</p>
        </div>
        
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block p-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-6 w-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs opacity-80 mt-1">{item.description}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
          <h3 className="text-white font-medium text-sm mb-2">💡 Método Alemán</h3>
          <p className="text-blue-200 text-xs leading-relaxed">
            Sistema de amortización con cuotas constantes de capital más intereses decrecientes.
          </p>
        </div>
      </div>
    </aside>
  )
}
