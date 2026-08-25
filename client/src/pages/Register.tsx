import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try{
      await register(email, password)
      await login(email, password)
      navigate('/')
    } catch (err) {
      console.error('Error durante la creacion de la cuenta:', err)
      setError('No se pudo crear la cuenta, el correo electronico ya fue utilizado')
    } finally {
      setLoading(false)
    }
  }

return (
    <div className="min-h-screen px-4 py-10">
      <div className="dex-panel mx-auto w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="lens" style={{ width: 36, height: 36 }} />
          <div className="flex gap-1.5">
            <span className="led" style={{ backgroundColor: '#ff3b30', boxShadow: '0 0 8px #ff3b30' }} />
            <span className="led" style={{ backgroundColor: '#ffd60a', boxShadow: '0 0 8px #ffd60a' }} />
            <span className="led" style={{ backgroundColor: '#34c759', boxShadow: '0 0 8px #34c759' }} />
          </div>
        </div>

        <div className="lcd-screen p-5">
          <h1 className="pixel-title mb-6 text-center text-sm text-dex-red">CREAR CUENTA</h1>

          {error && (
            <p className="mb-4 rounded border-2 border-dex-red bg-white px-3 py-2 text-center text-sm font-semibold text-dex-red">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-game w-full"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-semibold">Contrasena</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-game w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-game w-full bg-dex-red py-2 font-semibold text-white"
            >
              {loading ? 'Creando entrenador' : 'Terminar registro'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            Ya estas registrado como entrenador?{' '}
            <Link to="/login" className="font-semibold text-dex-blue hover:underline">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

 export default Register