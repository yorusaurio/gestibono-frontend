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
    <div className="p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Gestibono</h2>
        <p className="text-blue-200 text-sm">Simulador de Bonos</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="text-xs opacity-75 mt-1 truncate">{item.description}</div>
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 p-4 bg-white bg-opacity-15 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
        <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          💡 Método Alemán
        </h3>
        <p className="text-white text-opacity-90 text-xs leading-relaxed">
          Sistema de amortización con <span className="font-medium">cuotas constantes de capital</span> más <span className="font-medium">intereses decrecientes</span>, usado comúnmente en bonos corporativos.
        </p>
        <div className="mt-3 pt-3 border-t border-white border-opacity-20">
          <p className="text-white text-opacity-75 text-xs">
            ✓ Capital fijo por período<br/>
            ✓ Intereses sobre saldo pendiente<br/>
            ✓ Cuota total decreciente
          </p>
        </div>
      </div>
    </div>
  )
}
