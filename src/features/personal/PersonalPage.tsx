import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Loader2 } from 'lucide-react'
import clsx from 'clsx'

type Staff = {
    id: string
    nombre: string
    apellido: string
    dni: string
    telefono: string
    email: string
    rol?: string // Only for No Docente
}

export default function PersonalPage() {
    const [activeTab, setActiveTab] = useState<'docentes' | 'no_docentes'>('docentes')
    const [staff, setStaff] = useState<Staff[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchStaff()
    }, [activeTab])

    const fetchStaff = async () => {
        setLoading(true)
        const table = activeTab === 'docentes' ? 'personal_docentes' : 'personal_no_docentes'
        const { data } = await supabase.from(table).select('*').order('apellido')
        setStaff(data || [])
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Personal</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="w-4 h-4" /> Nuevo {activeTab === 'docentes' ? 'Docente' : 'Personal'}
                </button>
            </div>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('docentes')}
                    className={clsx(
                        "px-4 py-2 font-medium text-sm transition-colors border-b-2",
                        activeTab === 'docentes'
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                >
                    Docentes
                </button>
                <button
                    onClick={() => setActiveTab('no_docentes')}
                    className={clsx(
                        "px-4 py-2 font-medium text-sm transition-colors border-b-2",
                        activeTab === 'no_docentes'
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    )}
                >
                    No Docentes
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : staff.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No hay registros.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Nombre Completo</th>
                                    <th className="px-6 py-4">DNI</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    {activeTab === 'no_docentes' && <th className="px-6 py-4">Rol</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {staff.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {p.apellido}, {p.nombre}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{p.dni}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex flex-col">
                                                <span>{p.email}</span>
                                                <span className="text-xs">{p.telefono}</span>
                                            </div>
                                        </td>
                                        {activeTab === 'no_docentes' && (
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                                    {p.rol}
                                                </span>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <NewStaffModal
                    type={activeTab}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchStaff(); }}
                />
            )}
        </div>
    )
}

function NewStaffModal({ type, onClose, onSuccess }: { type: 'docentes' | 'no_docentes', onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        rol: 'Preceptor' // Default for no_docente
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const table = type === 'docentes' ? 'personal_docentes' : 'personal_no_docentes'
        const payload = type === 'docentes'
            ? { ...formData, rol: undefined } // Remove rol for docentes
            : formData

        await supabase.from(table).insert(payload)
        onSuccess()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold dark:text-white">
                    Nuevo {type === 'docentes' ? 'Docente' : 'Personal No Docente'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            placeholder="Nombre"
                            className="px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Apellido"
                            className="px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                            value={formData.apellido}
                            onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                            required
                        />
                    </div>
                    <input
                        placeholder="DNI"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                        value={formData.dni}
                        onChange={e => setFormData({ ...formData, dni: e.target.value })}
                        required
                    />
                    <input
                        placeholder="Email"
                        type="email"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        placeholder="Teléfono"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                        value={formData.telefono}
                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    />

                    {type === 'no_docentes' && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium dark:text-gray-300">Rol</label>
                            <select
                                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900/50"
                                value={formData.rol}
                                onChange={e => setFormData({ ...formData, rol: e.target.value })}
                            >
                                <option value="Preceptor">Preceptor</option>
                                <option value="Tesoreria">Tesorería</option>
                                <option value="Secretaria">Secretaría</option>
                                <option value="Maestranza">Maestranza</option>
                            </select>
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-white">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
