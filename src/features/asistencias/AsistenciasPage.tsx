import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import { Save, Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

type Student = {
    id: string
    nombre: string
    apellido: string
    legajo: string
}

type AttendanceState = 'PRESENTE' | 'AUSENTE' | 'TARDE' | 'JUSTIFICADA'



export default function AsistenciasPage() {
    const [loading, setLoading] = useState(false)
    const [selectedCurso, setSelectedCurso] = useState('')
    const [selectedDivision, setSelectedDivision] = useState('')
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

    const [students, setStudents] = useState<Student[]>([])
    const [attendance, setAttendance] = useState<Record<string, AttendanceState>>({})
    const [saved, setSaved] = useState(false)

    // Load students/attendance when filters change
    useEffect(() => {
        if (selectedCurso && selectedDivision && selectedDate) {
            fetchData()
        } else {
            setStudents([])
        }
    }, [selectedCurso, selectedDivision, selectedDate])

    const fetchData = async () => {
        setLoading(true)
        setSaved(false)
        try {
            // 1. Get Students
            const { data: studentsData, error: sError } = await supabase
                .from('alumnos')
                .select('id, nombre, apellido, legajo')
                .eq('curso', selectedCurso)
                .eq('division', selectedDivision)
                .eq('estado', 'ACTIVO')
                .order('apellido')

            if (sError) throw sError

            // 2. Get Existing Attendance
            const { data: attendanceData, error: aError } = await supabase
                .from('asistencias')
                .select('*')
                .eq('fecha', selectedDate)
                .in('alumno_id', studentsData?.map(s => s.id) || [])

            if (aError) throw aError

            setStudents(studentsData || [])

            // Map existing records
            const recordMap: Record<string, AttendanceState> = {}
            studentsData?.forEach(s => {
                const found = attendanceData?.find(a => a.alumno_id === s.id)
                if (found) {
                    recordMap[s.id] = found.estado as AttendanceState
                } else {
                    // Default state? Maybe null, but for faster UI lets default to Presente if new? 
                    // Better to leave empty or default PRESENTE
                    recordMap[s.id] = 'PRESENTE'
                }
            })
            setAttendance(recordMap)

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = (studentId: string, status: AttendanceState) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }))
        setSaved(false)
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const upsertData = students.map(s => ({
                alumno_id: s.id,
                fecha: selectedDate,
                estado: attendance[s.id]
            }))

            // Upsert: requires unique constraint on (alumno_id, fecha)
            const { error } = await supabase
                .from('asistencias')
                .upsert(upsertData, { onConflict: 'alumno_id, fecha' })

            if (error) throw error
            setSaved(true)
        } catch (error) {
            console.error(error)
            alert("Error al guardar asistencias")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Asistencias</h1>

                <div className="flex gap-2">
                    {saved && (
                        <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4" /> Guardado
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading || students.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
                    <select
                        value={selectedCurso}
                        onChange={(e) => setSelectedCurso(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">Seleccionar...</option>
                        {['1º', '2º', '3º', '4º', '5º', '6º'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">División</label>
                    <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        <option value="">Seleccionar...</option>
                        {['A', 'B', 'C', 'D'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {students.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        {selectedCurso && selectedDivision
                            ? "No se encontraron alumnos activos en este curso."
                            : "Seleccioná un curso y división para cargar la lista."}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 w-16">#</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Alumno</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {students.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {idx + 1}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {student.apellido}, {student.nombre}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <StatusButton
                                                    current={attendance[student.id]}
                                                    type="PRESENTE"
                                                    icon={CheckCircle2}
                                                    color="text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                                                    onClick={() => handleStatusChange(student.id, 'PRESENTE')}
                                                />
                                                <StatusButton
                                                    current={attendance[student.id]}
                                                    type="AUSENTE"
                                                    icon={XCircle}
                                                    color="text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                                                    onClick={() => handleStatusChange(student.id, 'AUSENTE')}
                                                />
                                                <StatusButton
                                                    current={attendance[student.id]}
                                                    type="TARDE"
                                                    icon={Clock}
                                                    color="text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                    onClick={() => handleStatusChange(student.id, 'TARDE')}
                                                />
                                                <StatusButton
                                                    current={attendance[student.id]}
                                                    type="JUSTIFICADA"
                                                    icon={AlertCircle}
                                                    color="text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                                                    onClick={() => handleStatusChange(student.id, 'JUSTIFICADA')}
                                                />
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

function StatusButton({
    current,
    type,
    icon: Icon,
    color,
    onClick
}: {
    current: string,
    type: string,
    icon: any,
    color: string,
    onClick: () => void
}) {
    const isSelected = current === type
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all border",
                isSelected
                    ? `border-current ${color} ring-1 ring-current`
                    : "border-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
            title={type}
        >
            <Icon className={clsx("w-5 h-5", isSelected && "scale-110")} />
            <span className="text-[10px] font-bold">{type.slice(0, 3)}</span>
        </button>
    )
}
