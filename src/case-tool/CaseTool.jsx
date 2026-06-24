import { useState, useRef, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ProjectProvider, useProjects } from './context/ProjectContext'
import DashboardPage from './pages/DashboardPage'
import CreateEditProject from './pages/CreateEditProject'
import ProjectDetail from './pages/ProjectDetail'
import TechniqueSelector from './pages/TechniqueSelector'
import FuzzyLogic from './pages/estimations/FuzzyLogic'
import Analogy from './pages/estimations/Analogy'
import ExpertJudgment from './pages/estimations/ExpertJudgment'
import Decomposition from './pages/estimations/Decomposition'
import StoryPoints from './pages/estimations/StoryPoints'
import ComparisonSummary from './pages/estimations/ComparisonSummary'
import RiskTable from './pages/RiskTable'
import HistoryList from './pages/HistoryList'
import HistoryDetail from './pages/HistoryDetail'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

const C = {
  primary: '#3B5998',
  sidebar: '#1A1A2E',
  mainBg: '#F4F6FB',
  cardBg: '#FFFFFF',
  border: '#E0E4ED',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '▣', exact: true },
  { path: '/dashboard/history', label: 'History', icon: '◷' },
  { path: '/dashboard/analytics', label: 'Analytics', icon: '▲' },
  { path: '/dashboard/reports', label: 'Reports', icon: '◈' },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

function NotificationsDropdown({ onClose }) {
  const { notifications, markNotificationRead, markAllRead } = useProjects()
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const typeIcon = { deadline: '⏰', risk: '⚠', estimation: '📊', task: '✓', comment: '@' }

  return (
    <div ref={ref} style={{ position: 'absolute', top: 44, right: 0, width: 360, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `1px solid ${C.border}`, zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary }}>Notifications</span>
        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Mark all as read</button>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifications.map(n => (
          <div key={n.id} onClick={() => markNotificationRead(n.id)}
            style={{ display: 'flex', gap: 12, padding: '12px 16px', cursor: 'pointer', background: n.read ? '#fff' : '#f0f4ff', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: n.read ? '#f3f4f6' : '#dbe4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              {typeIcon[n.type] || '●'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, color: C.textPrimary, lineHeight: 1.4 }}>{n.message}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: C.textSecondary }}>{new Date(n.timestamp).toLocaleDateString()}</p>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, marginTop: 6, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
        <a href="/dashboard/settings" style={{ fontSize: 12, color: C.primary, textDecoration: 'none' }}>Manage notification preferences</a>
      </div>
    </div>
  )
}

function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const { unreadCount } = useProjects()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [search, setSearch] = useState('')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: C.mainBg }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.sidebar, color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>ASPM</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>CASE Tool</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                marginBottom: 2, textDecoration: 'none', fontSize: 13, fontWeight: 500,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                background: isActive ? C.primary : 'transparent',
                transition: 'all 0.15s',
              })}>
              <span style={{ fontSize: 16, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
              {(profile?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || 'User'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{profile?.role === 'pm' ? 'Project Manager' : 'Team Member'}</div>
            </div>
          </div>
          <button onClick={signOut} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top navbar */}
        <div style={{ height: 60, background: '#fff', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects, risks, estimations..."
            style={{ flex: 1, maxWidth: 400, padding: '8px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.mainBg, color: C.textPrimary }}
          />
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowNotif(v => !v)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: C.textSecondary, fontSize: 20 }}>
              🔔
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: '#E24B4A', borderRadius: '50%', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unreadCount}</span>
              )}
            </button>
            {showNotif && <NotificationsDropdown onClose={() => setShowNotif(false)} />}
          </div>
          <div onClick={() => navigate('/dashboard/settings')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {(profile?.full_name || 'U')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{profile?.full_name || 'User'}</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function CaseTool() {
  return (
    <ProjectProvider>
      <Layout>
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="projects/new" element={<CreateEditProject />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<CreateEditProject />} />
          <Route path="projects/:id/estimate" element={<TechniqueSelector />} />
          <Route path="projects/:id/estimate/fuzzy" element={<FuzzyLogic />} />
          <Route path="projects/:id/estimate/analogy" element={<Analogy />} />
          <Route path="projects/:id/estimate/expert" element={<ExpertJudgment />} />
          <Route path="projects/:id/estimate/decomposition" element={<Decomposition />} />
          <Route path="projects/:id/estimate/storypoints" element={<StoryPoints />} />
          <Route path="projects/:id/estimations" element={<ComparisonSummary />} />
          <Route path="projects/:id/risks" element={<RiskTable />} />
          <Route path="history" element={<HistoryList />} />
          <Route path="history/:id" element={<HistoryDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </ProjectProvider>
  )
}
