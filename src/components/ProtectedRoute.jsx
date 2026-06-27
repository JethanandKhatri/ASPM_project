import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#002050', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M13 2L4 14H11L10 22L20 10H13Z" fill="#F97316"/></svg>
          </div>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading STRIX...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />
  return children
}
