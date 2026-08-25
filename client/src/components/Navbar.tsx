import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

const LedColors = ['#ff3b30', '#ffd60a', '#34c759']

const Navbar = () => {
    const { logout } = useAuth()
    const location = useLocation()

    const linkClass = (path: string) =>
        `px-4 py-2 font-semibold text-sm ${
            location.pathname === path 
                ? 'bg-dex-yellow text-dex-ink' 
                : 'bg-white text-dex-ink hover:bg-gray-100'}`

    return (
        <nav className="sticky top-0 z-30 border-b-4 border-dex-ink bg-dex-red px-4 py-3"
             style={{ boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.25' }}
        >
            <div className="mx-auto flex max-w-5xl items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="lens shrink-0" />
                    <div className="hidden items-center gap-1.5 sm:flex">
                        {LedColors.map((color, i) => (
                            <motion.span
                                key={color}
                                className="led"
                                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }}
                            />
                        ))}
                    </div>
                </div>

                <span className="pixel-title hidden text-xs text-white drop-shadow-md lg:block">
                    PokeDex
                </span>

                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <Link to="/" className={`btn-game ${linkClass('/')}`}>
                        Mi coleccion
                    </Link>
                    <Link to="/safari" className={`btn-game ${linkClass('/safari')}`}>
                        Safari
                    </Link>
                    <button
                        onClick={logout}
                        className="btn-game bg-white px-3 py-2 text-sm font-semibold text-dex-red-dark"
                    >
                        Cerrar sesion
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar