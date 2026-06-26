import { useState, useRef, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ProjectProvider, useProjects } from './context/ProjectContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
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
import OnboardingWizard from './pages/Onboarding'
import ScrumOverview from './pages/ScrumOverview'
import ScrumMasterPortal from '../portals/ScrumMasterPortal'
import DeveloperPortal from '../portals/DeveloperPortal'
import { ScrumProvider } from './context/ScrumContext'
import LineManagerPortal from '../portals/LineManagerPortal'
import AdminPortal from '../portals/AdminPortal'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '▣', exact: true },
  { path: '/dashboard/history', label: 'History', icon: '◷' },
  { path: '/dashboard/analytics', label: 'Analytics', icon: '▲' },
  { path: '/dashboard/reports', label: 'Reports', icon: '◈' },
  { path: '/dashboard/scrum', label: 'Scrum Overview', icon: '◉' },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

const SCRUM_NAV_ITEMS = [
  { path: '/dashboard', label: 'Sprint Board', icon: '▣', exact: true },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

const DEV_NAV_ITEMS = [
  { path: '/dashboard', label: 'My Workspace', icon: '▣', exact: true },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

const LM_NAV_ITEMS = [
  { path: '/dashboard', label: 'Team Management', icon: '▣', exact: true },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

const ADMIN_NAV_ITEMS = [
  { path: '/dashboard', label: 'Admin Dashboard', icon: '▣', exact: true },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

function getRoleLabel(role) {
  switch (role) {
    case 'pm': case 'admin': case 'project_manager': return 'Project Manager'
    case 'scrum_master': return 'Scrum Master'
    case 'line_manager': return 'Line Manager'
    case 'developer': return 'Developer'
    case 'team_member': return 'Team Member'
    default: return 'User'
  }
}

function NotificationsDropdown({ onClose }) {
  const { notifications, markNotificationRead, markAllRead } = useProjects()
  const { colors: C } = useTheme()
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const typeIcon = { deadline: '⏰', risk: '⚠', estimation: '📊', task: '✓', comment: '@', project: '📁', sprint: '🔄' }

  return (
    <div ref={ref} style={{ position: 'absolute', top: 44, right: 0, width: 360, background: C.cardBg, borderRadius: 12, boxShadow: '0 12px 32px rgba(0,58,107,0.18)', border: `1px solid ${C.border}`, zIndex: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary }}>Notifications</span>
        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>Mark all as read</button>
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: C.textSecondary, fontSize: 13 }}>No notifications</div>
        ) : notifications.map(n => (
          <div key={n.id} onClick={() => markNotificationRead(n.id)}
            style={{ display: 'flex', gap: 12, padding: '12px 16px', cursor: 'pointer', background: n.read ? C.cardBg : C.primary + '12', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: n.read ? C.border : C.primary + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
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

function Layout({ children, navItems = NAV_ITEMS }) {
  const { profile, signOut } = useAuth()
  const { unreadCount } = useProjects()
  const { isDark, colors: C } = useTheme()
  const navigate = useNavigate()
  const [showNotif, setShowNotif] = useState(false)
  const [search, setSearch] = useState('')
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'User'
  const roleLabel = getRoleLabel(profile?.role)
  const userInitial = displayName.trim()[0]?.toUpperCase() || 'U'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: C.mainBg }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: C.sidebar, color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>ASPM</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>CASE Tool</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                marginBottom: 2, textDecoration: 'none', fontSize: 13, fontWeight: 500,
                color: isActive ? '#fff' : C.sidebarText,
                background: isActive ? C.sidebarActive : 'transparent',
                transition: 'all 0.15s',
              })}>
              <span style={{ fontSize: 16, width: 18, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
              {userInitial}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{roleLabel}</div>
            </div>
          </div>
          <button onClick={signOut} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 6, color: '#E8F4FB', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top navbar */}
        <div style={{ height: 72, background: C.topbarGradient, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', gap: 18, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ flex: '1 1 560px', maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 14, background: 'rgba(255,255,255,0.12)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#DCECF7', flexShrink: 0 }}>Search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="projects, risks, estimations"
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#FFFFFF', minWidth: 0 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotif(v => !v)} style={{ position: 'relative', width: 42, height: 42, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)', cursor: 'pointer', borderRadius: 12, color: '#DCECF7', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.14)', fontFamily: 'inherit' }}>
                🔔
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, padding: '0 4px', background: '#E24B4A', border: '2px solid rgba(0,0,0,0.4)', borderRadius: 999, fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unreadCount}</span>
                )}
              </button>
              {showNotif && <NotificationsDropdown onClose={() => setShowNotif(false)} />}
            </div>
            <div onClick={() => navigate('/dashboard/settings')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '7px 12px 7px 8px', borderRadius: 16, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxWidth: 250 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #5293BB, #89CFF1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#003A6B', flexShrink: 0 }}>
                {userInitial}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
                <span style={{ fontSize: 11, color: '#D7EBF7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{roleLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function CaseToolInner() {
  const { profile } = useAuth()
  const { projects, loading } = useProjects()
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('aspm_onboarded')
  })

  if (profile?.role === 'scrum_master') {
    return (
      <Layout navItems={SCRUM_NAV_ITEMS}>
        <Routes>
          <Route index element={<ScrumMasterPortal />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    )
  }

  if (profile?.role === 'developer' || profile?.role === 'team_member') {
    return (
      <Layout navItems={DEV_NAV_ITEMS}>
        <Routes>
          <Route index element={<DeveloperPortal />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    )
  }

  if (profile?.role === 'line_manager') {
    return (
      <Layout navItems={LM_NAV_ITEMS}>
        <Routes>
          <Route index element={<LineManagerPortal />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    )
  }

  if (profile?.role === 'admin') {
    return (
      <Layout navItems={ADMIN_NAV_ITEMS}>
        <Routes>
          <Route index element={<AdminPortal />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    )
  }

  const shouldShowOnboarding = showOnboarding && !loading && projects.length === 0

  return (
    <Layout>
      {shouldShowOnboarding && <OnboardingWizard onDone={() => setShowOnboarding(false)} />}
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
        <Route path="scrum" element={<ScrumOverview />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default function CaseTool() {
  return (
    <ThemeProvider>
      <ProjectProvider>
        <ScrumProvider>
          <CaseToolInner />
        </ScrumProvider>
      </ProjectProvider>
    </ThemeProvider>
  )
}
