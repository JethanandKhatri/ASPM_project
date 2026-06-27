import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const BoltIcon = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L4 14H11L10 22L20 10H13Z" fill="#F97316" />
  </svg>
)

const ICONS = {
  shield: '●',
}

export default function AuthPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid credentials.')
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
            <div style={styles.brandMark}><BoltIcon size={24} /></div>
            <div>
              <div style={styles.brandTitle}>STRIX</div>
              <div style={styles.brandSub}>CASE Tool</div>
            </div>
          </div>

          <div style={styles.heroBlock}>
            <div style={styles.heroEyebrow}>SECURE ACCESS</div>
            <h1 style={styles.heroTitle}>Plan smarter. Deliver with confidence.</h1>
            <p style={styles.heroText}>
              Estimation, risk, sprints, and reporting in one structured workspace.
            </p>
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
                <div style={styles.cardEyebrow}>WELCOME BACK</div>
                <div style={styles.cardSignal}>
                  <span style={styles.cardSignalDot}>{ICONS.shield}</span>
                </div>
              </div>

              <h2 style={styles.cardTitle}>Sign in to STRIX</h2>
              <p style={styles.cardSub}>Sign in to continue.</p>

              <form onSubmit={handleSubmit} style={styles.form}>
                <div>
                  <label style={styles.label}>Work Email</label>
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div style={styles.cardFooter}>
                Contact your administrator to get access.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// Blue monochrome palette: #003A6B · #1B5886 · #3776A1 · #5293BB · #6EB1D6 · #89CFF1
const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    background: '#002855',
    padding: '32px',
    boxSizing: 'border-box',
  },
  shell: {
    minHeight: 'calc(100vh - 64px)',
    display: 'grid',
    gridTemplateColumns: '1.08fr 0.92fr',
    borderRadius: 36,
    overflow: 'hidden',
    background: '#6EB1D6',
    boxShadow: '0 28px 70px rgba(0, 20, 50, 0.40)',
  },
  leftPanel: {
    position: 'relative',
    background: '#003A6B',
    color: '#FFFFFF',
    padding: '42px 52px 44px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  leftDecorTop: {
    position: 'absolute', top: 20, left: -34, width: 110, height: 110,
    borderRadius: '50%', background: 'rgba(137, 207, 241, 0.10)',
  },
  leftDecorRing: {
    position: 'absolute', top: 112, right: 134, width: 82, height: 82,
    borderRadius: '50%', border: '8px solid rgba(137, 207, 241, 0.22)',
    borderLeftColor: 'transparent', borderBottomColor: 'transparent', transform: 'rotate(22deg)',
  },
  leftDecorDotA: {
    position: 'absolute', top: 165, left: 34, width: 14, height: 14,
    borderRadius: '50%', border: '3px solid rgba(137, 207, 241, 0.50)',
  },
  leftDecorDotB: {
    position: 'absolute', bottom: 134, left: 110, width: 10, height: 10,
    borderRadius: '50%', background: 'rgba(137, 207, 241, 0.70)',
  },
  leftDecorStrokeA: {
    position: 'absolute', top: 246, left: 300, width: 58, height: 12,
    borderTop: '2px solid rgba(137, 207, 241, 0.15)', borderBottom: '2px solid rgba(137, 207, 241, 0.15)',
    transform: 'rotate(26deg)',
  },
  leftDecorStrokeB: {
    position: 'absolute', right: 108, bottom: 86, width: 62, height: 14,
    borderTop: '2px solid rgba(137, 207, 241, 0.12)', borderBottom: '2px solid rgba(137, 207, 241, 0.12)',
    transform: 'rotate(-28deg)',
  },
  brandRow: {
    position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 14,
  },
  brandMark: {
    width: 46, height: 46, borderRadius: 14, background: '#002050',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.30)',
  },
  brandTitle: { fontSize: 16, fontWeight: 700, color: '#FFFFFF' },
  brandSub:   { fontSize: 11, fontWeight: 600, color: '#89CFF1', marginTop: 3 },
  heroBlock: {
    position: 'relative', zIndex: 1, maxWidth: 540, marginTop: 'auto', marginBottom: 'auto',
  },
  heroEyebrow: {
    display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 14px',
    borderRadius: 999, background: 'rgba(137, 207, 241, 0.12)',
    border: '1px solid rgba(137, 207, 241, 0.22)', color: '#89CFF1',
    fontSize: 11, fontWeight: 700, letterSpacing: 1.2, marginBottom: 20,
  },
  heroTitle: {
    margin: '0 0 18px', maxWidth: 520, fontSize: 66, lineHeight: 0.95, fontWeight: 800,
  },
  heroText: { margin: 0, maxWidth: 540, fontSize: 16, lineHeight: 1.7, color: '#6EB1D6' },
  rightPanel: {
    position: 'relative', background: '#6EB1D6', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '42px', overflowY: 'auto',
  },
  rightBackdrop: {
    position: 'absolute', inset: '34px 38px', borderRadius: 34,
    background: 'rgba(255,255,255,0.20)', boxShadow: '0 32px 56px rgba(0, 30, 70, 0.14)',
  },
  rightBackdropRing: {
    position: 'absolute', top: 78, right: 86, width: 72, height: 72, borderRadius: '50%',
    border: '8px solid rgba(0, 58, 107, 0.14)', borderRightColor: 'transparent',
    borderBottomColor: 'transparent', transform: 'rotate(30deg)',
  },
  rightBackdropDot: {
    position: 'absolute', top: 180, left: 82, width: 16, height: 16,
    borderRadius: '50%', border: '3px solid rgba(0, 58, 107, 0.14)',
  },
  rightBackdropDotSmall: {
    position: 'absolute', top: 206, right: 160, width: 10, height: 10,
    borderRadius: '50%', background: 'rgba(0, 58, 107, 0.28)',
  },
  cardFrame: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: 430,
    padding: 14, borderRadius: 34, background: 'rgba(255,255,255,0.30)',
    boxShadow: '0 26px 54px rgba(0, 30, 80, 0.18)',
  },
  card: {
    background: '#FFFFFF', borderRadius: 28, padding: '30px 32px 28px',
    boxShadow: '0 14px 38px rgba(0, 30, 80, 0.10)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18,
  },
  cardEyebrow: {
    height: 30, padding: '0 12px', borderRadius: 999, border: '1px solid #C8DFF0',
    color: '#3776A1', display: 'inline-flex', alignItems: 'center',
    fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
  },
  cardSignal: {
    width: 40, height: 40, borderRadius: 14, background: '#EAF3FB',
    border: '1px solid #C8DFF0', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardSignalDot: { color: '#1B5886', fontSize: 14 },
  cardTitle: { margin: '0 0 10px', fontSize: 28, lineHeight: 1.08, fontWeight: 800, color: '#003A6B' },
  cardSub:   { margin: '0 0 24px', fontSize: 15, lineHeight: 1.65, color: '#3776A1' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'block', marginBottom: 7, fontSize: 13, fontWeight: 700, color: '#003A6B' },
  input: {
    width: '100%', height: 50, padding: '0 16px', borderRadius: 16,
    border: '1px solid #C8DFF0', background: '#F2F8FD', color: '#003A6B',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  submitBtn: {
    height: 46, border: 'none', borderRadius: 12, background: '#1B5886',
    color: '#FFFFFF', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    marginTop: 2, boxShadow: '0 12px 24px rgba(0, 58, 107, 0.30)',
  },
  errorBox: {
    background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C',
    borderRadius: 12, padding: '12px 14px', fontSize: 13,
  },
  cardFooter: {
    marginTop: 20, textAlign: 'center', fontSize: 13, lineHeight: 1.5, color: '#5293BB',
  },
}
