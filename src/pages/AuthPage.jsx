import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  {
    id: 'pm',
    label: 'Project Manager',
    icon: '📊',
    desc: 'Create projects, run estimations, manage risks, view all history',
    color: '#3B5998',
    bg: '#eff3fb',
  },
  {
    id: 'team_member',
    label: 'Team Member',
    icon: '👥',
    desc: 'View assigned projects, add task estimates, view risk table',
    color: '#0891b2',
    bg: '#e0f2fe',
  },
]

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [selectedRole, setSelectedRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        if (!selectedRole) { setError('Please select your role.'); setLoading(false); return }
        await signUp(email, password, selectedRole, fullName)
        setSuccess('Account created! Check your email to confirm, then log in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brandWrap}>
          <div style={styles.brandLogo}>
            <span style={{ fontSize: 28 }}>⚡</span>
          </div>
          <span style={styles.brandName}>ASPM</span>
        </div>
        <h1 style={styles.heroTitle}>ASPM CASE Tool</h1>
        <p style={styles.heroSub}>
          Computer-Aided Software Engineering for Agile Project Management.
          Estimate effort, manage risks with RMMM, and track your entire project portfolio.
        </p>
        <div style={styles.featureList}>
          {[
            { icon: '📐', text: '6 estimation techniques (Fuzzy Logic, PERT, Analogy…)' },
            { icon: '⚠', text: 'Full RMMM risk management' },
            { icon: '📊', text: 'Analytics dashboard & comparison summaries' },
            { icon: '📋', text: 'Kanban task board & Gantt timeline' },
          ].map((f) => (
            <div key={f.text} style={styles.featureItem}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
        <div style={styles.statsRow}>
          {[
            { n: '21', l: 'Screens' },
            { n: '6', l: 'Estimation Techniques' },
            { n: '100%', l: 'Pre-loaded Data' },
          ].map((s) => (
            <div key={s.l} style={styles.statBox}>
              <div style={styles.statNum}>{s.n}</div>
              <div style={styles.statLabel}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
            >
              Sign In
            </button>
            <button
              style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}
              onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
            >
              Create Account
            </button>
          </div>

          <h2 style={styles.cardTitle}>
            {mode === 'login' ? 'Welcome back' : 'Get started today'}
          </h2>
          <p style={styles.cardSub}>
            {mode === 'login'
              ? 'Sign in to your ASPM workspace'
              : 'Set up your account in 60 seconds'}
          </p>

          {/* Role selector (signup only) */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 20 }}>
              <label style={styles.label}>Select Your Role</label>
              <div style={styles.roleGrid}>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    style={{
                      ...styles.roleCard,
                      border: selectedRole === r.id
                        ? `2px solid ${r.color}`
                        : '2px solid #e5e7eb',
                      background: selectedRole === r.id ? r.bg : '#fff',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{r.icon}</span>
                    <span style={{ ...styles.roleLabel, color: selectedRole === r.id ? r.color : '#374151' }}>
                      {r.label}
                    </span>
                    <span style={styles.roleDesc}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Ali Hassan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          {mode === 'login' && (
            <p style={styles.switchText}>
              Don't have an account?{' '}
              <span style={styles.switchLink} onClick={() => setMode('signup')}>
                Sign up free
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    background: '#f8fafc',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1A1A2E 0%, #2d3a6b 50%, #3B5998 100%)',
    color: '#fff',
    padding: '48px 52px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 420,
  },
  brandWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 40,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.7,
    marginBottom: 36,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 40,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 500,
  },
  statsRow: {
    display: 'flex',
    gap: 20,
  },
  statBox: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 18px',
    textAlign: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: 700,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  rightPanel: {
    width: 540,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 32px',
    overflowY: 'auto',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    background: '#fff',
    borderRadius: 20,
    padding: '36px 36px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
  },
  tabs: {
    display: 'flex',
    background: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    background: 'transparent',
    color: '#6b7280',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#fff',
    color: '#1e1b4b',
    fontWeight: 600,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid #e5e7eb',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    color: '#111827',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginTop: 8,
  },
  roleCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    padding: '12px 14px',
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: 600,
  },
  roleDesc: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 1.4,
  },
  submitBtn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #1A1A2E, #3B5998)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    letterSpacing: 0.3,
    transition: 'opacity 0.2s',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
  },
  successBox: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 18,
  },
  switchLink: {
    color: '#4338ca',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
