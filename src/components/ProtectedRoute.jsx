import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading ASPM...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  return children
}
