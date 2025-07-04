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
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Vista general de bonos' },
    { name: 'Nuevo Bono', href: '/dashboard/flujo', icon: PlusIcon, description: 'Crear nuevo bono' },
    { name: 'Gráficos', href: '/dashboard/graficos', icon: ChartBarIcon, description: 'Análisis comparativo' },
    { name: 'Resultados', href: '/dashboard/resultados', icon: TableCellsIcon, description: 'Último bono calculado' },
    { name: 'Perfil', href: '/dashboard/perfil', icon: UserIcon, description: 'Configuración' },
  ]

  return (
    <aside className="w-72 bg-gradient-to-b from-blue-900 to-blue-800 shadow-xl h-full">
      <div className="p-6">
        {/* Logo y título */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">GestiBono</h2>
          </div>
          <p className="text-blue-200 text-sm">Sistema de Gestión de Bonos</p>
        </div>

        {/* Navegación */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex flex-col px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-blue-200 group-hover:text-white'}`} />
                  <span className="font-semibold">{item.name}</span>
                </div>
                <span className={`ml-8 text-xs mt-1 ${
                  isActive ? 'text-blue-500' : 'text-blue-300 group-hover:text-blue-100'
                }`}>
                  {item.description}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Información adicional */}
        <div className="mt-8 p-4 bg-blue-800 rounded-xl border border-blue-700">
          <h3 className="text-white font-semibold text-sm mb-2">💡 Ayuda</h3>
          <p className="text-blue-200 text-xs leading-relaxed">
            Crea y analiza bonos con el método alemán. Compara múltiples escenarios y exporta resultados.
          </p>
        </div>
      </div>
    </aside>
  )
}