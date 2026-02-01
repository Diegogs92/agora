import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Loader2 } from 'lucide-react'
import clsx from 'clsx'

type Incident = {
    id: string
    fecha: string
    tipo: string
    descripcion: string
    nivel: string
    alumno: {
        nombre: string
        apellido: string
        curso: string
        division: string
    }
}

export default function ConductaPage() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchIncidents()
    }, [])

    const fetchIncidents = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('conducta_incidentes')
            .select('*, alumno:alumnos(nombre, apellido, curso, division)')
            .order('fecha', { ascending: false })

        if (error) console.error(error)
        else setIncidents(data || [])
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conducta e Incidentes</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-orange-500/30"
                >
                    <Plus className="w-4 h-4" /> Registrar Incidente
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : incidents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay incidentes registrados.</div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Alumno</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Nivel</th>
                                <th className="px-6 py-4">Descripción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {incidents.map((inc) => (
                                <tr key={inc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-gray-500">{inc.fecha}</td>
                                    <td className="px-6 py-4 font-medium">
                                        {inc.alumno.apellido}, {inc.alumno.nombre}
                                        <span className="block text-xs text-gray-400">
                                            {inc.alumno.curso} "{inc.alumno.division}"
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-xs font-bold">
                                            {inc.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-1 rounded text-xs font-bold",
                                            inc.nivel === 'ALTO' ? "bg-red-100 text-red-700" :
                                                inc.nivel === 'MEDIO' ? "bg-orange-100 text-orange-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {inc.nivel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                        {inc.descripcion}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && <NewIncidentModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchIncidents(); }} />}
        </div>
    )
}

function NewIncidentModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [students, setStudents] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<string>('')

    const [tipo, setTipo] = useState('OBSERVACION')
    const [nivel, setNivel] = useState('BAJO')
    const [descripcion, setDescripcion] = useState('')

    useEffect(() => {
        if (search.length > 2) {
            supabase.from('alumnos')
                .select('id, nombre, apellido, dni')
                .ilike('apellido', `%${search}%`)
                .limit(5)
                .then(({ data }) => setStudents(data || []))
        }
    }, [search])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudent) return

        await supabase.from('conducta_incidentes').insert({
            alumno_id: selectedStudent,
            fecha: new Date().toISOString(),
            tipo,
            nivel,
            descripcion
        })
        onSuccess()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold">Registrar Incidente</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Alumno</label>
                        <input
                            type="text"
                            placeholder="Buscar apellido..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                        />
                        {students.length > 0 && (
                            <div className="mt-2 border rounded-lg max-h-32 overflow-y-auto">
                                {students.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => { setSelectedStudent(s.id); setSearch(`${s.apellido}, ${s.nombre}`); setStudents([]); }}
                                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        {s.apellido}, {s.nombre} ({s.dni})
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Tipo</label>
                            <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50">
                                <option value="OBSERVACION">Observación</option>
                                <option value="ADVERTENCIA">Advertencia</option>
                                <option value="AMONESTACION">Amonestación</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nivel</label>
                            <select value={nivel} onChange={e => setNivel(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50">
                                <option value="BAJO">Bajo</option>
                                <option value="MEDIO">Medio</option>
                                <option value="ALTO">Alto</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <textarea
                            value={descripcion}
                            onChange={e => setDescripcion(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg h-24 dark:bg-gray-900/50"
                            required
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
