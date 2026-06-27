import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const ROLE_META = {
  developer: { color: '#6366f1', bg: '#eef2ff', icon: '💻', label: 'Developer' },
  line_manager: { color: '#0ea5e9', bg: '#e0f2fe', icon: '👥', label: 'Line Manager' },
  scrum_master: { color: '#10b981', bg: '#d1fae5', icon: '🔄', label: 'Scrum Master' },
  admin: { color: '#f59e0b', bg: '#fef3c7', icon: '📊', label: 'Project Manager' },
}

export default function Sidebar({ navItems }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const meta = ROLE_META[profile?.role] || ROLE_META.developer

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandIcon}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M13 2L4 14H11L10 22L20 10H13Z" fill="#F97316"/></svg>
        </div>
        <span style={styles.brandText}>STRIX</span>
      </div>

      {/* Profile card */}
      <div style={{ ...styles.profileCard, background: meta.bg, border: `1.5px solid ${meta.color}22` }}>
        <div style={{ ...styles.roleAvatar, background: meta.color }}>
          {profile?.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={styles.profileInfo}>
          <div style={styles.profileName}>{profile?.full_name || 'User'}</div>
          <div style={{ ...styles.roleBadge, color: meta.color }}>
            {meta.icon} {meta.label}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(active
                  ? { background: meta.bg, color: meta.color, borderLeft: `3px solid ${meta.color}` }
                  : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div style={styles.spacer} />

      <button onClick={handleSignOut} style={styles.signOutBtn}>
        🚪 Sign Out
      </button>
    </aside>
  )
}

const styles = {
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: '#fff',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    fontFamily: "'Inter', sans-serif",
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 20px 24px',
    borderBottom: '1px solid #f3f4f6',
  },
  brandIcon: {
    width: 36,
    height: 36,
    background: '#002050',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
  },
  brandText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1e1b4b',
    letterSpacing: 1,
  },
  profileCard: {
    margin: '16px 12px',
    borderRadius: 12,
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  roleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },
  profileInfo: {
    minWidth: 0,
  },
  profileName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: 600,
    marginTop: 2,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 20px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#4b5563',
    textAlign: 'left',
    borderLeft: '3px solid transparent',
    transition: 'all 0.15s',
  },
  navIcon: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  spacer: { flex: 1 },
  signOutBtn: {
    margin: '0 12px',
    padding: '10px 16px',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#6b7280',
    textAlign: 'left',
  },
}
