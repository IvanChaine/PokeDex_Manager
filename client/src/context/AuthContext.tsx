import { useState, ReactNode } from "react";
import api from '../services/api'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'))

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password })
        const newToken = response.data.token
        localStorage.setItem('token', newToken)
        setToken(newToken)
    }

    const register = async (email: string, password: string) => {
        await api.post('/auth/register', { email, password })
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{ token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}