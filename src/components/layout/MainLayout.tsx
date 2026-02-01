import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    Menu, LogOut, Sun, Moon,
    Users, Calendar, GraduationCap,
    DollarSign, Activity, FileText,
    ShieldAlert, Home, UserCheck
} from 'lucide-react'
import clsx from 'clsx'

export default function MainLayout() {
    const { signOut, user, role } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark'
    })

    // Toggle Dark Mode
    React.useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, [darkMode])

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const navItems = [
        { label: 'Dashboard', icon: Home, path: '/dashboard', roles: ['ALL'] },
        { label: 'Alumnos', icon: Users, path: '/alumnos', roles: ['ADMIN', 'SECRETARIA', 'DOCENTE', 'PRECEPTOR', 'TESORERIA'] }, // Details inside component
        { label: 'Asistencias', icon: UserCheck, path: '/asistencias', roles: ['ADMIN', 'SECRETARIA', 'PRECEPTOR', 'DOCENTE'] },
        { label: 'Notas', icon: GraduationCap, path: '/notas', roles: ['ADMIN', 'SECRETARIA', 'DOCENTE'] },
        { label: 'Conducta', icon: ShieldAlert, path: '/conducta', roles: ['ADMIN', 'SECRETARIA', 'PRECEPTOR', 'DOCENTE'] },
        { label: 'Pagos', icon: DollarSign, path: '/pagos', roles: ['ADMIN', 'SECRETARIA', 'TESORERIA'] },
        { label: 'Actividades', icon: Activity, path: '/actividades', roles: ['ADMIN', 'SECRETARIA', 'DOCENTE'] },
        { label: 'Personal', icon: FileText, path: '/personal', roles: ['ADMIN', 'SECRETARIA'] },
        { label: 'Días Inhábiles', icon: Calendar, path: '/dias-inhabiles', roles: ['ADMIN', 'SECRETARIA'] },
        // { label: 'Configuración', icon: Settings, path: '/configuracion', roles: ['ADMIN'] },
    ]

    const filteredNav = navItems.filter(item =>
        item.roles.includes('ALL') || (role && item.roles.includes(role))
    )

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Ágora
                    </span>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {filteredNav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {user?.email?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {user?.email}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {role}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar Mobile / Desktop Tools */}
                <header className="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex-1" /> {/* Spacer */}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
