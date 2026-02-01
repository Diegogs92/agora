import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Calendar, Plus, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type DiaInhabil = {
    id: string
    fecha: string
    motivo: string
    alcance: string
}

export default function DiasInhabilesPage() {
    const [days, setDays] = useState<DiaInhabil[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchDays()
    }, [])

    const fetchDays = async () => {
        setLoading(true)
        const { data } = await supabase.from('dias_inhabiles').select('*').order('fecha', { ascending: true })
        setDays(data || [])
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Borrar este día inhábil?')) return
        await supabase.from('dias_inhabiles').delete().eq('id', id)
        fetchDays()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Días Inhábiles y Feriados</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/30"
                >
                    <Plus className="w-4 h-4" /> Agregar Fecha
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                    </div>
                ) : days.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay días inhábiles registrados.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {days.map(day => (
                            <div key={day.id} className="border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-lg p-4 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold mb-1">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(day.fecha), 'EEEE d MMMM, yyyy', { locale: es })}
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 font-medium">{day.motivo}</p>
                                    <span className="text-xs text-gray-500 uppercase">{day.alcance}</span>
                                </div>
                                <button onClick={() => handleDelete(day.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && <NewDayModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchDays(); }} />}
        </div>
    )
}

function NewDayModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [fecha, setFecha] = useState('')
    const [motivo, setMotivo] = useState('')
    const [alcance, setAlcance] = useState('INSTITUCION')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await supabase.from('dias_inhabiles').insert({ fecha, motivo, alcance })
        onSuccess()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold dark:text-white">Nuevo Día Inhábil</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium dark:text-gray-300">Fecha</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium dark:text-gray-300">Motivo</label>
                        <input
                            placeholder="Ej. Feriado Nacional"
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium dark:text-gray-300">Alcance</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                            value={alcance}
                            onChange={e => setAlcance(e.target.value)}
                        >
                            <option value="INSTITUCION">Toda la Institución</option>
                            <option value="PRIMARIA">Primaria</option>
                            <option value="SECUNDARIA">Secundaria</option>
                        </select>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg dark:text-white dark:border-gray-600">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
