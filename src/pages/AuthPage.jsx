import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ICONS = {
  brand: '\u26A1',
  planning: '\u{1F4D0}',
  risk: '\u26A0',
  analytics: '\u{1F4CA}',
  board: '\u{1F4CB}',
  pm: '\u{1F4BC}',
  scrum: '\u27F3',
  developer: '\u{1F4BB}',
  shield: '\u25CF',
}

const ROLES = [
  {
    id: 'pm',
    label: 'Project Manager',
    icon: ICONS.pm,
    desc: 'Create projects, run estimations, manage risks, view all history',
    color: '#003A6B',
    bg: '#EAF4FB',
  },
  {
    id: 'scrum_master',
    label: 'Scrum Master',
    icon: ICONS.scrum,
    desc: 'Track sprints, review estimations, flag risks, monitor team progress',
    color: '#1B5886',
    bg: '#EDF6FB',
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: ICONS.developer,
    desc: 'View assigned tasks, submit story point estimates, track personal progress',
    color: '#3776A1',
    bg: '#F0F8FD',
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
        if (!selectedRole) {
          setError('Please select your role.')
          setLoading(false)
          return
        }
        await signUp(email, password, selectedRole, fullName)
        setSuccess('Account created. You can sign in now.')
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
      <div style={styles.shell}>
        <section style={styles.leftPanel}>
          <div style={styles.leftDecorTop} />
          <div style={styles.leftDecorRing} />
          <div style={styles.leftDecorDotA} />
          <div style={styles.leftDecorDotB} />
          <div style={styles.leftDecorStrokeA} />
          <div style={styles.leftDecorStrokeB} />

          <div style={styles.brandRow}>
            <div style={styles.brandMark}>{ICONS.brand}</div>
            <div>
              <div style={styles.brandTitle}>ASPM</div>
              <div style={styles.brandSub}>CASE Tool</div>
            </div>
          </div>

          <div style={styles.heroBlock}>
            <div style={styles.heroEyebrow}>SECURE ACCESS</div>
            <h1 style={styles.heroTitle}>Plan smarter. Deliver with confidence.</h1>
            <p style={styles.heroText}>
              Agile project management for estimation, risk control, reporting, and execution in one structured workspace.
            </p>
          </div>

          <div style={styles.featureList}>
            {[
              { icon: ICONS.planning, text: '6 estimation techniques with comparison summaries' },
              { icon: ICONS.risk, text: 'Full RMMM risk management workflow' },
              { icon: ICONS.analytics, text: 'Portfolio analytics and project history' },
              { icon: ICONS.board, text: 'Kanban task board and Gantt timeline' },
            ].map((item) => (
              <div key={item.text} style={styles.featureItem}>
                <div style={styles.featureIcon}>{item.icon}</div>
                <span style={styles.featureText}>{item.text}</span>
              </div>
            ))}
          </div>

          <div style={styles.metricRow}>
            {[
              { value: '21', label: 'Screens' },
              { value: '6', label: 'Techniques' },
              { value: '100%', label: 'Sample Data' },
            ].map((item) => (
              <div key={item.label} style={styles.metricCard}>
                <div style={styles.metricValue}>{item.value}</div>
                <div style={styles.metricLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.rightPanel}>
          <div style={styles.rightBackdrop}>
            <div style={styles.rightBackdropRing} />
            <div style={styles.rightBackdropDot} />
            <div style={styles.rightBackdropDotSmall} />
          </div>

          <div style={styles.cardFrame}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardEyebrow}>{mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</div>
                <div style={styles.cardSignal}>
                  <span style={styles.cardSignalDot}>{ICONS.shield}</span>
                </div>
              </div>

              <h2 style={styles.cardTitle}>{mode === 'login' ? 'Sign in to ASPM' : 'Set up your workspace'}</h2>
              <p style={styles.cardSub}>
                {mode === 'login'
                  ? 'Use your account credentials to continue managing your projects.'
                  : 'Create your account and choose the role that matches your workflow.'}
              </p>

              <div style={styles.tabs}>
                <button
                  type="button"
                  style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
                  onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}
                  onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
                >
                  Create Account
                </button>
              </div>

              {mode === 'signup' && (
                <div style={styles.roleSection}>
                  <label style={styles.label}>Role</label>
                  <div style={styles.roleGrid}>
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        style={{
                          ...styles.roleCard,
                          background: selectedRole === role.id ? role.bg : '#FFFFFF',
                          borderColor: selectedRole === role.id ? role.color : '#D7E7F2',
                          boxShadow: selectedRole === role.id ? `0 10px 24px ${role.color}20` : 'none',
                        }}
                      >
                        <div style={{ ...styles.roleBadge, color: role.color }}>{role.icon}</div>
                        <div style={styles.roleContent}>
                          <div style={{ ...styles.roleLabel, color: selectedRole === role.id ? role.color : '#12324A' }}>{role.label}</div>
                          <div style={styles.roleDesc}>{role.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                {mode === 'signup' && (
                  <div>
                    <label style={styles.label}>Full Name</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label style={styles.label}>{mode === 'login' ? 'Work Email' : 'Email Address'}</label>
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
                  <div style={styles.labelRow}>
                    <label style={styles.label}>Password</label>
                    {mode === 'login' && <span style={styles.inlineLink}>Forgot password?</span>}
                  </div>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}
                {success && <div style={styles.successBox}>{success}</div>}

                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div style={styles.cardFooter}>
                {mode === 'login'
                  ? "Use your company email and password to access ASPM."
                  : 'Choose a role now. You can manage project details after sign-in.'}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    background: '#2C495F',
    padding: '32px',
    boxSizing: 'border-box',
  },
  shell: {
    minHeight: 'calc(100vh - 64px)',
    display: 'grid',
    gridTemplateColumns: '1.08fr 0.92fr',
    borderRadius: 36,
    overflow: 'hidden',
    background: '#DCE8E2',
    boxShadow: '0 28px 70px rgba(7, 26, 44, 0.24)',
  },
  leftPanel: {
    position: 'relative',
    background: '#23364A',
    color: '#FFFFFF',
    padding: '42px 52px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  leftDecorTop: {
    position: 'absolute',
    top: 20,
    left: -34,
    width: 110,
    height: 110,
    borderRadius: '50%',
    background: 'rgba(110, 177, 214, 0.12)',
  },
  leftDecorRing: {
    position: 'absolute',
    top: 112,
    right: 134,
    width: 82,
    height: 82,
    borderRadius: '50%',
    border: '8px solid rgba(215, 235, 247, 0.26)',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: 'rotate(22deg)',
  },
  leftDecorDotA: {
    position: 'absolute',
    top: 165,
    left: 34,
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '3px solid rgba(215, 235, 247, 0.58)',
  },
  leftDecorDotB: {
    position: 'absolute',
    bottom: 134,
    left: 110,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'rgba(215, 235, 247, 0.78)',
  },
  leftDecorStrokeA: {
    position: 'absolute',
    top: 246,
    left: 300,
    width: 58,
    height: 12,
    borderTop: '2px solid rgba(215, 235, 247, 0.18)',
    borderBottom: '2px solid rgba(215, 235, 247, 0.18)',
    transform: 'rotate(26deg)',
  },
  leftDecorStrokeB: {
    position: 'absolute',
    right: 108,
    bottom: 86,
    width: 62,
    height: 14,
    borderTop: '2px solid rgba(215, 235, 247, 0.16)',
    borderBottom: '2px solid rgba(215, 235, 247, 0.16)',
    transform: 'rotate(-28deg)',
  },
  brandRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: 'rgba(110, 177, 214, 0.18)',
    color: '#89CFF1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  brandSub: {
    fontSize: 11,
    fontWeight: 600,
    color: '#8FB5D1',
    marginTop: 3,
  },
  heroBlock: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 540,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  heroEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 30,
    padding: '0 14px',
    borderRadius: 999,
    background: 'rgba(110, 177, 214, 0.12)',
    border: '1px solid rgba(215, 235, 247, 0.14)',
    color: '#B8D7EC',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
    marginBottom: 20,
  },
  heroTitle: {
    margin: '0 0 18px',
    maxWidth: 520,
    fontSize: 66,
    lineHeight: 0.95,
    fontWeight: 800,
    letterSpacing: 0,
  },
  heroText: {
    margin: 0,
    maxWidth: 540,
    fontSize: 16,
    lineHeight: 1.7,
    color: '#D5E6F2',
  },
  featureList: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gap: 14,
    maxWidth: 520,
    marginTop: 34,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'rgba(110, 177, 214, 0.12)',
    color: '#DCECF7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 1.5,
    color: '#E4EEF6',
    fontWeight: 500,
  },
  metricRow: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    gap: 14,
    marginTop: 34,
  },
  metricCard: {
    minWidth: 108,
    padding: '16px 18px',
    borderRadius: 16,
    background: 'rgba(110, 177, 214, 0.12)',
    border: '1px solid rgba(215, 235, 247, 0.12)',
  },
  metricValue: {
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1,
  },
  metricLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#B8D7EC',
    fontWeight: 500,
  },
  rightPanel: {
    position: 'relative',
    background: '#DCE8E2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '42px',
    overflowY: 'auto',
  },
  rightBackdrop: {
    position: 'absolute',
    inset: '34px 38px',
    borderRadius: 34,
    background: 'rgba(255,255,255,0.18)',
    boxShadow: '0 32px 56px rgba(74, 103, 84, 0.10)',
  },
  rightBackdropRing: {
    position: 'absolute',
    top: 78,
    right: 86,
    width: 72,
    height: 72,
    borderRadius: '50%',
    border: '8px solid rgba(55, 118, 161, 0.12)',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: 'rotate(30deg)',
  },
  rightBackdropDot: {
    position: 'absolute',
    top: 180,
    left: 82,
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '3px solid rgba(55, 118, 161, 0.12)',
  },
  rightBackdropDotSmall: {
    position: 'absolute',
    top: 206,
    right: 160,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: 'rgba(55, 118, 161, 0.34)',
  },
  cardFrame: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 430,
    padding: 14,
    borderRadius: 34,
    background: 'rgba(255,255,255,0.28)',
    boxShadow: '0 26px 54px rgba(86, 112, 94, 0.14)',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 28,
    padding: '30px 32px 28px',
    boxShadow: '0 14px 38px rgba(17, 50, 74, 0.08)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardEyebrow: {
    height: 30,
    padding: '0 12px',
    borderRadius: 999,
    border: '1px solid #D7E7F2',
    color: '#5F7E95',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.2,
  },
  cardSignal: {
    width: 40,
    height: 40,
    borderRadius: 14,
    background: '#EEF4EB',
    border: '1px solid #D7E6D6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSignalDot: {
    color: '#5D7247',
    fontSize: 14,
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: 28,
    lineHeight: 1.08,
    fontWeight: 800,
    color: '#12324A',
  },
  cardSub: {
    margin: '0 0 20px',
    fontSize: 15,
    lineHeight: 1.65,
    color: '#5F7E95',
    maxWidth: 320,
  },
  tabs: {
    display: 'flex',
    background: '#F2F8FC',
    border: '1px solid #D7E7F2',
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    height: 42,
    border: 'none',
    borderRadius: 12,
    background: 'transparent',
    color: '#5F7E95',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  tabActive: {
    background: '#FFFFFF',
    color: '#12324A',
    boxShadow: '0 6px 14px rgba(18, 50, 74, 0.08)',
  },
  roleSection: {
    marginBottom: 18,
  },
  roleGrid: {
    display: 'grid',
    gap: 10,
  },
  roleCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 14px',
    borderRadius: 16,
    border: '1px solid #D7E7F2',
    cursor: 'pointer',
    textAlign: 'left',
  },
  roleBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  roleContent: {
    minWidth: 0,
    flex: 1,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 3,
  },
  roleDesc: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#6C889D',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    display: 'block',
    marginBottom: 7,
    fontSize: 13,
    fontWeight: 700,
    color: '#12324A',
  },
  inlineLink: {
    fontSize: 12,
    color: '#769752',
    fontWeight: 600,
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    height: 50,
    padding: '0 16px',
    borderRadius: 16,
    border: '1px solid #D7E7F2',
    background: '#F9FCFE',
    color: '#12324A',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  submitBtn: {
    height: 46,
    border: 'none',
    borderRadius: 12,
    background: '#769752',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 2,
    boxShadow: '0 12px 24px rgba(118, 151, 82, 0.24)',
  },
  errorBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 13,
  },
  successBox: {
    background: '#F0FDF4',
    border: '1px solid #BBF7D0',
    color: '#15803D',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 13,
  },
  cardFooter: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 1.5,
    color: '#5F7E95',
  },
}
