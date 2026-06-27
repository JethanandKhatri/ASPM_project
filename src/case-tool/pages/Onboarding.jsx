import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  {
    icon: '⚡',
    title: 'Welcome to STRIX',
    body: 'Your all-in-one Agile Software Project Management platform. Create projects, estimate effort and cost, track risks, and analyze your team\'s performance — all in one place.',
  },
  {
    icon: '📊',
    title: '5 Built-in Estimation Techniques',
    body: 'Choose from Fuzzy Logic (feature sizing), Analogy-based, Expert Judgment (PERT), Decomposition with Standard Deviation, or Story Points. Save multiple versioned estimation runs per project and compare them side-by-side.',
  },
  {
    icon: '⚠',
    title: 'Risk Management (RMMM)',
    body: 'Log risks with probability and cost impact. Auto-calculated Risk Exposure and priority (High/Medium/Low). Document Mitigation, Monitoring, and Management plans. Visualize risks on an interactive heatmap.',
  },
  {
    icon: '🚀',
    title: 'You\'re all set!',
    body: 'Start by creating your first project. You can run estimations, add team members, assign tasks on a Kanban board, generate PDF reports, and track actual vs estimated results.',
  },
]

export default function OnboardingWizard({ onDone }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function skip() {
    localStorage.setItem('aspm_onboarded', 'true')
    onDone()
  }

  function finish() {
    localStorage.setItem('aspm_onboarded', 'true')
    onDone()
    navigate('/dashboard/projects/new')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '42px 48px',
        width: 520, maxWidth: '90vw',
        boxShadow: '0 28px 72px rgba(0,0,0,0.28)',
        animation: 'fadeIn 0.2s ease',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 8, borderRadius: 4,
              width: i === step ? 28 : 8,
              background: i === step ? '#003A6B' : i < step ? '#5B9BD5' : '#CFE2F1',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 20, lineHeight: 1 }}>
            {current.icon === '⚡'
              ? <span style={{ display: 'inline-flex', width: 64, height: 64, borderRadius: 18, background: '#002050', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M13 2L4 14H11L10 22L20 10H13Z" fill="#F97316"/></svg>
                </span>
              : current.icon}
          </div>
          <h2 style={{ margin: '0 0 14px', fontSize: 22, fontWeight: 700, color: '#12324A', lineHeight: 1.3 }}>
            {current.title}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: '#5F7E95', lineHeight: 1.75 }}>
            {current.body}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={skip}
            style={{ background: 'none', border: 'none', color: '#5F7E95', fontSize: 13, cursor: 'pointer', padding: 0 }}>
            Skip tour
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{ padding: '10px 22px', border: '1px solid #CFE2F1', borderRadius: 10, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#5F7E95', fontFamily: 'inherit' }}>
                ← Back
              </button>
            )}
            <button onClick={isLast ? finish : () => setStep(s => s + 1)}
              style={{ padding: '10px 24px', background: '#003A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 20px rgba(0,58,107,0.24)' }}>
              {isLast ? 'Create First Project →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
