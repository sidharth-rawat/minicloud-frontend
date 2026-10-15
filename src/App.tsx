import { Navigate, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { DeploymentDetail } from './pages/DeploymentDetail'
import { Login } from './pages/Login'
import { ProjectDetail } from './pages/ProjectDetail'
import { Register } from './pages/Register'

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/deployments/:deploymentId"
            element={
              <ProtectedRoute>
                <DeploymentDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
