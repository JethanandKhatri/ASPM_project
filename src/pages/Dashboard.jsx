import { useAuth } from '../context/AuthContext'
import CaseTool from '../case-tool/CaseTool'

export default function Dashboard() {
  const { profile, loading } = useAuth()

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚡</div>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return <CaseTool />
}
