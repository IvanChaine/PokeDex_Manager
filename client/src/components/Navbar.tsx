import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
    const { logout } = useAuth()
    const location = useLocation()

    const linkClass = (path: string) =>
        `px-3 py-2 rounded ${location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`

    return (
        <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
            <div className="flex gap-2">
                <Link to="/" className={linkClass('/')}>Mi Coleccion</Link>
                <Link to="/safari" className={linkClass('/safari')}>Safari</Link>
            </div>
            <button onClick={logout} className="text-sm text-red-600 hover-underline">
                Cerrar sesion
            </button>
        </nav>
    )
}

export default Navbar