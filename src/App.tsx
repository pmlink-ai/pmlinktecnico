import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import DatosMaestros from './components/DatosMaestros'
import GestionEmpresas from './components/maestros/GestionEmpresas'
import GestionLocales from './components/maestros/GestionLocales'
import Operaciones from './components/Operaciones'
import Reportes from './components/Reportes'
import Notificaciones from './components/Notificaciones'

function App() {
  return (
    <div className="min-h-screen">
        <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>
        
        <Route
          path="/datos-maestros"
          element={
            <ProtectedRoute requireAdmin>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DatosMaestros />} />
          <Route path="empresas" element={<GestionEmpresas />} />
          <Route path="locales" element={<GestionLocales />} />
          {/* Aquí se agregarán más rutas de maestros */}
        </Route>
        
        <Route
          path="/operaciones"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Operaciones />} />
        </Route>
        
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Reportes />} />
        </Route>
        
        <Route
          path="/notificaciones"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Notificaciones />} />
        </Route>
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </div>
  )
}

export default App
