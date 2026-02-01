import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Plus, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

type Payment = {
    id: string
    periodo: string
    monto: number
    estado: string
    fecha_pago: string | null
    medio_pago: string | null
    created_at: string
    alumno: {
        nombre: string
        apellido: string
        dni: string
    }
}

export default function PagosPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('pagos')
            .select('*, alumno:alumnos(nombre, apellido, dni)')
            .order('created_at', { ascending: false })
            .limit(50) // Pagination for later

        if (error) console.error(error)
        else setPayments(data || [])

        setLoading(false)
    }

    const filteredPayments = payments.filter(p =>
        p.alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.alumno.dni.includes(searchTerm)
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pagos y Cuotas</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Registrar Pago
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por apellido o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron pagos registrados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Fecha</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Alumno</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Período</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Monto</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Estado</th>
                                    <th className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Medio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredPayments.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {p.alumno?.apellido}, {p.alumno?.nombre}
                                            <span className="block text-xs text-gray-400">{p.alumno?.dni}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono">
                                            {p.periodo}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            ${p.monto}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                                p.estado === 'PAGADO'
                                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                                    : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                                            )}>
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs uppercase">
                                            {p.medio_pago || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && <NewPaymentModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchPayments(); }} />}
        </div>
    )
}

function NewPaymentModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [dni, setDni] = useState('')
    const [student, setStudent] = useState<any>(null)

    const [periodo, setPeriodo] = useState(format(new Date(), 'yyyy-MM'))
    const [monto, setMonto] = useState('')
    const [medio, setMedio] = useState('EFECTIVO')
    const [observacion, setObservacion] = useState('')

    const searchStudent = async () => {
        if (dni.length < 6) return
        const { data } = await supabase.from('alumnos').select('id, nombre, apellido').eq('dni', dni).single()
        if (data) setStudent(data)
        else setStudent(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!student) return
        setLoading(true)

        try {
            const { error } = await supabase.from('pagos').insert({
                alumno_id: student.id,
                periodo,
                monto: parseFloat(monto),
                estado: 'PAGADO',
                fecha_pago: new Date().toISOString(),
                medio_pago: medio,
                observacion
            })

            if (error) throw error
            onSuccess()
        } catch (error) {
            console.error(error)
            alert("Error al registrar pago")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
                    Registrar Nuevo Pago
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Buscar Alumno (DNI)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={dni}
                                onChange={e => setDni(e.target.value)}
                                onBlur={searchStudent}
                                className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500/20"
                                placeholder="Ingrese DNI"
                            />
                            <button
                                type="button"
                                onClick={searchStudent}
                                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                        {student && (
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/10 p-2 rounded">
                                {student.apellido}, {student.nombre}
                            </p>
                        )}
                        {!student && dni.length > 5 && (
                            <p className="text-sm text-red-500">No encontrado</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Período</label>
                            <input
                                type="month"
                                value={periodo}
                                onChange={e => setPeriodo(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border rounded-lg"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
                            <input
                                type="number"
                                value={monto}
                                onChange={e => setMonto(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border rounded-lg"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Medio de Pago</label>
                        <select
                            value={medio}
                            onChange={e => setMedio(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border rounded-lg"
                        >
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                            <option value="TARJETA">Tarjeta</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Observación</label>
                        <textarea
                            value={observacion}
                            onChange={e => setObservacion(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border rounded-lg h-20 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !student}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg shadow-green-500/30 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
