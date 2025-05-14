import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  ScaleIcon,
  PresentationChartLineIcon,
  CalculatorIcon
} from '@heroicons/react/24/solid'

const indicadores = [
  {
    label: 'TCEA',
    value: 12.78,
    sufijo: '%',
    icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />,
    bg: 'bg-blue-50'
  },
  {
    label: 'TREA',
    value: 13.42,
    sufijo: '%',
    icon: <PresentationChartLineIcon className="h-6 w-6 text-green-600" />,
    bg: 'bg-green-50'
  },
  {
    label: 'Duración',
    value: 4.56,
    sufijo: ' años',
    icon: <ClockIcon className="h-6 w-6 text-yellow-600" />,
    bg: 'bg-yellow-50'
  },
  {
    label: 'Duración Modificada',
    value: 4.22,
    sufijo: ' años',
    icon: <ScaleIcon className="h-6 w-6 text-purple-600" />,
    bg: 'bg-purple-50'
  },
  {
    label: 'Convexidad',
    value: 5.13,
    icon: <CalculatorIcon className="h-6 w-6 text-indigo-600" />,
    bg: 'bg-indigo-50'
  },
  {
    label: 'Precio del Bono',
    value: 978.65,
    prefijo: 'S/',
    icon: <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />,
    bg: 'bg-gray-100'
  }
]

export default function Indicadores() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {indicadores.map(({ label, value, icon, sufijo = '', prefijo = '', bg }, idx) => (
        <div
          key={idx}
          className={`rounded-xl ${bg} p-5 flex items-center justify-between shadow-sm border`}
        >
          <div>
            <h3 className="text-sm font-medium text-gray-700">{label}</h3>
            <p className="text-3xl font-bold text-gray-900">
              {prefijo}{value.toFixed(2)}{sufijo}
            </p>
          </div>
          <div className="ml-4">{icon}</div>
        </div>
      ))}
    </div>
  )
}
