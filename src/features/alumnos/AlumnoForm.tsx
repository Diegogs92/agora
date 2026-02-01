import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { z } from 'zod'
import clsx from 'clsx'

const alumnoSchema = z.object({
    legajo: z.string().min(1, 'Legajo requerido'),
    nombre: z.string().min(1, 'Nombre requerido'),
    apellido: z.string().min(1, 'Apellido requerido'),
    dni: z.string().min(7, 'DNI inválido'),
    fecha_nacimiento: z.string().optional(),
    curso: z.string().min(1, 'Curso requerido'),
    division: z.string().min(1, 'División requerida'),
    email: z.string().email().optional().or(z.literal('')),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    tutor_nombre: z.string().optional(),
    tutor_telefono: z.string().optional(),
    estado: z.string(),
    observaciones: z.string().optional(),
})

type AlumnoFormData = z.infer<typeof alumnoSchema>

export default function AlumnoForm() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditing = !!id && id !== 'nuevo'

    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<AlumnoFormData>({
        legajo: '',
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        curso: '1º',
        division: 'A',
        email: '',
        telefono: '',
        direccion: '',
        tutor_nombre: '',
        tutor_telefono: '',
        estado: 'ACTIVO',
        observaciones: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (isEditing) {
            fetchAlumno(id)
        }
    }, [id])

    const fetchAlumno = async (alumnoId: string) => {
        setLoading(true)
        const { data, error } = await supabase
            .from('alumnos')
            .select('*')
            .eq('id', alumnoId)
            .single()

        if (data) {
            setFormData(data)
        } else {
            console.error(error)
            navigate('/alumnos')
        }
        setLoading(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})
        setLoading(true)

        // Validate
        const result = alumnoSchema.safeParse(formData)
        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach(issue => {
                if (issue.path[0]) fieldErrors[issue.path[0].toString()] = issue.message
            })
            setErrors(fieldErrors)
            setLoading(false)
            return
        }

        try {
            if (isEditing) {
                const { error } = await supabase
                    .from('alumnos')
                    .update(formData)
                    .eq('id', id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('alumnos')
                    .insert([formData])
                if (error) throw error
            }
            navigate('/alumnos')
        } catch (error: any) {
            console.error('Error saving alumno:', error)
            setErrors({ form: error.message || 'Error al guardar usuario' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/alumnos')}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
                {errors.form && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                        {errors.form}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Datos Personales</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} error={errors.nombre} />
                            <Input label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} error={errors.apellido} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="DNI" name="dni" value={formData.dni} onChange={handleChange} error={errors.dni} />
                            <Input label="Legajo" name="legajo" value={formData.legajo} onChange={handleChange} error={errors.legajo} />
                        </div>

                        <Input label="Fecha Nacimiento" type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
                    </div>

                    {/* Academic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Información Académica</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
                                <select name="curso" value={formData.curso} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20">
                                    {['1º', '2º', '3º', '4º', '5º', '6º'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">División</label>
                                <select name="division" value={formData.division} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20">
                                    {['A', 'B', 'C', 'D'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                            <select name="estado" value={formData.estado} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20">
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="INACTIVO">INACTIVO</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Contacto y Tutor</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} />
                            <Input label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
                            <Input label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />
                        </div>
                        <div className="space-y-4">
                            <Input label="Nombre Tutor" name="tutor_nombre" value={formData.tutor_nombre} onChange={handleChange} />
                            <Input label="Teléfono Tutor" name="tutor_telefono" value={formData.tutor_telefono} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/alumnos')}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Alumno
                    </button>
                </div>
            </form>
        </div>
    )
}

function Input({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }) {
    return (
        <div className="space-y-1 w-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <input
                {...props}
                className={clsx(
                    "w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border rounded-lg outline-none focus:ring-2 transition-all",
                    error
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 dark:border-gray-700 focus:ring-blue-500/20 focus:border-blue-500"
                )}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
