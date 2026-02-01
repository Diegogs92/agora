import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Search, Filter, Eye, Loader2 } from 'lucide-react'
import clsx from 'clsx'

type Alumno = {
    id: string
    legajo: string
    nombre: string
    apellido: string
    dni: string
    curso: string
    division: string
    estado: string
}

export default function AlumnosList() {
    const [alumnos, setAlumnos] = useState<Alumno[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCurso, setFilterCurso] = useState('')

    useEffect(() => {
        fetchAlumnos()
    }, [])

    const fetchAlumnos = async () => {
        try {
            const { data, error } = await supabase
                .from('alumnos')
                .select('*')
                .order('apellido', { ascending: true })

            if (error) throw error
            setAlumnos(data || [])
        } catch (error) {
            console.error('Error fetching alumnos:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredAlumnos = alumnos.filter(alumno => {
        const matchesSearch =
            alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alumno.dni.includes(searchTerm) ||
            alumno.legajo.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCurso = filterCurso ? alumno.curso === filterCurso : true

        return matchesSearch && matchesCurso
    })

    // Unique courses for filter
    const cursos = Array.from(new Set(alumnos.map(a => a.curso))).sort()

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alumnos</h1>
                <Link
                    to="/alumnos/nuevo"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Alumno
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, DNI o legajo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                <div className="sm:w-48 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={filterCurso}
                        onChange={(e) => setFilterCurso(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Todos los cursos</option>
                        {cursos.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : filteredAlumnos.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron alumnos.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Legajo</th>
                                    <th className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">Alumno</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">DNI</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Curso</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Estado</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAlumnos.map((alumno) => (
                                    <tr key={alumno.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">
                                            {alumno.legajo}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {alumno.apellido}, {alumno.nombre}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {alumno.dni}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-100 dark:border-purple-800">
                                                {alumno.curso} "{alumno.division}"
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                                alumno.estado === 'ACTIVO'
                                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                            )}>
                                                {alumno.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/alumnos/${alumno.id}`}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {/* More actions could go here */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
