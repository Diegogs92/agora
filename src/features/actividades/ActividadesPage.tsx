import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Activity, Plus, Trash2, Loader2, Users } from 'lucide-react'

type Actividad = {
    id: string
    nombre: string
    dia_semana: string
    horario: string
    cupo: number
    responsable: string
}

export default function ActividadesPage() {
    const [activities, setActivities] = useState<Actividad[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchActivities()
    }, [])

    const fetchActivities = async () => {
        setLoading(true)
        const { data } = await supabase.from('actividades').select('*').order('nombre')
        setActivities(data || [])
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta actividad?')) return
        await supabase.from('actividades').delete().eq('id', id)
        fetchActivities()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Actividades Extracurriculares</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-pink-500/30"
                >
                    <Plus className="w-4 h-4" /> Nueva Actividad
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map(act => (
                    <div key={act.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 group hover:border-pink-500/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg">
                                <Activity className="w-6 h-6" />
                            </div>
                            <button onClick={() => handleDelete(act.id)} className="text-gray-400 hover:text-red-500 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{act.nombre}</h3>
                            <p className="text-gray-500 text-sm">{act.dia_semana} • {act.horario}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Cupo: {act.cupo}
                            </span>
                            <span className="text-gray-500 font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs truncate max-w-[120px]">
                                {act.responsable}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
            )}

            {showModal && <NewActivityModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchActivities(); }} />}
        </div>
    )
}

function NewActivityModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        nombre: '',
        dia_semana: 'Lunes',
        horario: '',
        cupo: 20,
        responsable: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await supabase.from('actividades').insert(formData)
        onSuccess()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold dark:text-white">Nueva Actividad</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium dark:text-gray-300">Nombre</label>
                        <input className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50 dark:border-gray-700" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium dark:text-gray-300">Día</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50 dark:border-gray-700" value={formData.dia_semana} onChange={e => setFormData({ ...formData, dia_semana: e.target.value })}>
                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium dark:text-gray-300">Horario</label>
                            <input className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50 dark:border-gray-700" placeholder="14:00 - 16:00" value={formData.horario} onChange={e => setFormData({ ...formData, horario: e.target.value })} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium dark:text-gray-300">Cupo</label>
                            <input type="number" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50 dark:border-gray-700" value={formData.cupo} onChange={e => setFormData({ ...formData, cupo: parseInt(e.target.value) })} required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium dark:text-gray-300">Responsable</label>
                            <input className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50 dark:border-gray-700" value={formData.responsable} onChange={e => setFormData({ ...formData, responsable: e.target.value })} required />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-lg dark:text-white">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
