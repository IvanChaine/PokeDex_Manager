import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Safari from './pages/Safari'

function App() {
  return (
    <BrowserRouter>
     <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
         <Route path="/" element={<Home />} />
         <Route path="/safari" element={<Safari />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
  )
}

export default App
