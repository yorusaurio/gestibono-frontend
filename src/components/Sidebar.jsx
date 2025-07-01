import { 
  HomeIcon, 
  DocumentIcon, 
  ChartBarIcon, 
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Flujo de Caja', href: '/dashboard/flujo', icon: DocumentIcon },
    { name: 'Gráficos', href: '/dashboard/graficos', icon: ChartBarIcon },
    { name: 'Resultados', href: '/dashboard/resultados', icon: TableCellsIcon },
    { name: 'Perfil', href: '/dashboard/perfil', icon: UserIcon },
  ]

  return (
    <aside className="w-64 bg-white shadow-md h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Gestibono</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}