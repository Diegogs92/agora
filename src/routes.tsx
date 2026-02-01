import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './features/dashboard/DashboardPage'
import AlumnosList from './features/alumnos/AlumnosList'
import AlumnoForm from './features/alumnos/AlumnoForm'
import AsistenciasPage from './features/asistencias/AsistenciasPage'
import NotasPage from './features/notas/NotasPage'
import NotasCarga from './features/notas/NotasCarga'
import PagosPage from './features/pagos/PagosPage'
import ConductaPage from './features/conducta/ConductaPage'
import ActividadesPage from './features/actividades/ActividadesPage'
import PersonalPage from './features/personal/PersonalPage'
import DiasInhabilesPage from './features/calendario/DiasInhabilesPage'
import { useAuth, AuthProvider } from './context/AuthContext'
import { Loader2 } from 'lucide-react'

// Guard Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        )
    }

    if (!session) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

// Router Definition
const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <DashboardPage />,
            },
            {
                path: 'alumnos',
                children: [
                    { index: true, element: <AlumnosList /> },
                    { path: 'nuevo', element: <AlumnoForm /> },
                    { path: ':id', element: <AlumnoForm /> },
                ]
            },
            {
                path: 'asistencias',
                element: <AsistenciasPage />
            },
            {
                path: 'notas',
                children: [
                    { index: true, element: <NotasPage /> },
                    { path: 'carga', element: <NotasCarga /> },
                ]
            },
            { path: 'pagos', element: <PagosPage /> },
            { path: 'conducta', element: <ConductaPage /> },
            { path: 'actividades', element: <ActividadesPage /> },
            { path: 'personal', element: <PersonalPage /> },
            { path: 'dias-inhabiles', element: <DiasInhabilesPage /> },
        ],
    },
])

export function AppRoutes() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    )
}
