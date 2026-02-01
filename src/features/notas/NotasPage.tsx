import { Link } from 'react-router-dom'
import { GraduationCap, ArrowRight } from 'lucide-react'

export default function NotasPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notas y Boletines</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/notas/carga"
                    className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cargar Notas</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Registrar exámenes y trabajos prácticos.</p>
                        </div>
                    </div>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Ir a Carga <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                </Link>

                <Link
                    to="/notas/boletines"
                    className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ver Boletines</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Consultar notas por alumno.</p>
                        </div>
                    </div>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                        Ver Boletines <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                </Link>
            </div>
        </div>
    )
}
