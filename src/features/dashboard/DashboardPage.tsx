
import { useAuth } from '../../context/AuthContext'

export default function DashboardPage() {
    const { role } = useAuth()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hola!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Bienvenido al panel de gestión de Ágora.
                    </p>
                </div>
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800">
                    Rol: {role || 'Cargando...'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder Widget 1 */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Accesos Rápidos</h3>
                    <p className="text-gray-500 text-sm">Próximamente métricas y accesos relevantes para tu rol.</p>
                </div>

                {/* Placeholder Widget 2 */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Estado del Sistema</h3>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        En línea
                    </div>
                </div>
            </div>
        </div>
    )
}
