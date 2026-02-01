import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type Student = {
    id: string
    nombre: string
    apellido: string
}

export default function NotasCarga() {
    const navigate = useNavigate()
    const [saving, setSaving] = useState(false)

    // Selection State
    const [curso, setCurso] = useState('')
    const [division, setDivision] = useState('')
    const [materiaId, setMateriaId] = useState('')
    const [periodo, setPeriodo] = useState('1º Trimestre')
    const [tipo, setTipo] = useState('Examen')
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

    // Data State
    const [subjects, setSubjects] = useState<any[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [grades, setGrades] = useState<Record<string, string>>({}) // studentId -> grade

    useEffect(() => {
        fetchSubjects()
    }, [])

    useEffect(() => {
        if (curso && division && materiaId) {
            fetchStudentsAndGrades()
        }
    }, [curso, division, materiaId])

    const fetchSubjects = async () => {
        const { data } = await supabase.from('materias').select('*').order('nombre')
        setSubjects(data || [])
    }

    const fetchStudentsAndGrades = async () => {
        // Fetch Students
        const { data: sData } = await supabase
            .from('alumnos')
            .select('id, nombre, apellido')
            .eq('curso', curso)
            .eq('division', division)
            .eq('estado', 'ACTIVO')
            .order('apellido')

        setStudents(sData || [])

        // Ideally we would also fetch existing grades for this specific exam if editing?
        // For MVP, we assume "Carga" is for new grades mainly, or we'd need a "Select Exam" step.
        // Let's assume this is a "New Entry".
        // If we want to support editing, we'd need to query by (materia, periodo, tipo, fecha).
        // Let's keep simpler: just input for new grades.


    }

    const handleGradeChange = (studentId: string, value: string) => {
        setGrades(prev => ({ ...prev, [studentId]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const inserts = Object.entries(grades)
                .filter(([_, val]) => val !== '') // Only save filled grades
                .map(([studentId, val]) => ({
                    alumno_id: studentId,
                    materia_id: materiaId,
                    periodo,
                    tipo,
                    nota: parseFloat(val),
                    fecha,
                    observacion: '' // Optional
                }))

            if (inserts.length === 0) {
                alert("No hay notas para guardar")
                setSaving(false)
                return
            }

            const { error } = await supabase.from('notas').insert(inserts)
            if (error) throw error

            alert("Notas guardadas correctamente")
            navigate('/notas')
        } catch (error: any) {
            console.error(error)
            alert("Error al guardar: " + error.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/notas')}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carga de Notas</h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filters */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
                    <select value={curso} onChange={e => setCurso(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                        <option value="">Seleccionar...</option>
                        {['1º', '2º', '3º', '4º', '5º', '6º'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">División</label>
                    <select value={division} onChange={e => setDivision(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                        <option value="">Seleccionar...</option>
                        {['A', 'B', 'C', 'D'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Materia</label>
                    <select value={materiaId} onChange={e => setMateriaId(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                        <option value="">Seleccionar...</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                </div>

                {/* Exam Details */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
                    <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                        <option value="1º Trimestre">1º Trimestre</option>
                        <option value="2º Trimestre">2º Trimestre</option>
                        <option value="3º Trimestre">3º Trimestre</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Evaluación</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg">
                        <option value="Examen">Examen</option>
                        <option value="Trabajo Práctico">Trabajo Práctico</option>
                        <option value="Oral">Oral</option>
                        <option value="Concepto">Concepto</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
                    <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border rounded-lg" />
                </div>
            </div>

            {students.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Alumno</th>
                                <th className="px-6 py-4 w-32">Nota (1-10)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 font-medium">{student.apellido}, {student.nombre}</td>
                                    <td className="px-6 py-4">
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            step="0.5"
                                            className="w-full px-3 py-2 border rounded-lg text-center font-mono font-bold focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            placeholder="-"
                                            value={grades[student.id] || ''}
                                            onChange={e => handleGradeChange(student.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Guardar Calificaciones
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
