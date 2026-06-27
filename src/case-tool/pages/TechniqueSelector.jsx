import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'

// ── SVG Icons (no emojis) ─────────────────────────────────────────────────────

function IconFuzzy({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="24" r="12" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.12"/>
      <circle cx="30" cy="24" r="12" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.12"/>
      <line x1="24" y1="13" x2="24" y2="35" stroke={color} strokeWidth="1.5" strokeDasharray="2 2"/>
    </svg>
  )
}

function IconAnalogy({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="10" width="14" height="10" rx="2" stroke={color} strokeWidth="2.5"/>
      <rect x="28" y="28" width="14" height="10" rx="2" stroke={color} strokeWidth="2.5"/>
      <path d="M20 15 Q36 15 36 28" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <polyline points="32,24 36,28 40,24" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconExpert({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="12" height="9" rx="2" stroke={color} strokeWidth="2.5"/>
      <rect x="28" y="8" width="12" height="9" rx="2" stroke={color} strokeWidth="2.5"/>
      <rect x="18" y="31" width="12" height="9" rx="2" stroke={color} strokeWidth="2.5"/>
      <line x1="14" y1="17" x2="24" y2="31" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="34" y1="17" x2="24" y2="31" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconDecomposition({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="6" width="12" height="8" rx="2" stroke={color} strokeWidth="2.5"/>
      <rect x="4" y="34" width="10" height="8" rx="2" stroke={color} strokeWidth="2.5"/>
      <rect x="19" y="34" width="10" height="8" rx="2" stroke={color} strokeWidth="2.5"/>
      <rect x="34" y="34" width="10" height="8" rx="2" stroke={color} strokeWidth="2.5"/>
      <line x1="24" y1="14" x2="24" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="9" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="24" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="24" x2="39" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function IconStoryPoints({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="8" y1="8" x2="8" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="8" y1="40" x2="42" y2="40" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <polyline points="8,36 16,26 24,30 32,16 42,10" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="26" r="2.5" fill={color}/>
      <circle cx="24" cy="30" r="2.5" fill={color}/>
      <circle cx="32" cy="16" r="2.5" fill={color}/>
    </svg>
  )
}

function IconTShirt({ color }) {
  return (
    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="30" width="6"  height="10" rx="1.5" fill={color} fillOpacity="0.30"/>
      <rect x="14" y="24" width="7" height="16" rx="1.5" fill={color} fillOpacity="0.50"/>
      <rect x="23" y="17" width="8" height="23" rx="1.5" fill={color} fillOpacity="0.75"/>
      <rect x="33" y="10" width="9" height="30" rx="1.5" fill={color}/>
      <text x="9" y="44" fontSize="5" fill={color} fillOpacity="0.9" fontWeight="700" fontFamily="Arial">XS</text>
      <text x="15" y="44" fontSize="5" fill={color} fillOpacity="0.9" fontWeight="700" fontFamily="Arial">S</text>
      <text x="24" y="44" fontSize="5" fill={color} fillOpacity="0.9" fontWeight="700" fontFamily="Arial">M</text>
      <text x="34" y="44" fontSize="5" fill={color} fillOpacity="0.9" fontWeight="700" fontFamily="Arial">L</text>
    </svg>
  )
}

// ── Technique definitions ─────────────────────────────────────────────────────

const TECHNIQUES = [
  {
    id: 'fuzzy',
    label: 'Fuzzy Logic',
    path: 'fuzzy',
    desc: 'Classify features by size (XS–XL) and estimate Lines of Code from historical averages.',
    bestFor: 'Variable complexity features',
    gradient: ['#003A6B', '#1B5886'],
    Icon: IconFuzzy,
  },
  {
    id: 'analogy',
    label: 'Analogy',
    path: 'analogy',
    desc: 'Scale effort, cost and duration from a comparable past project in your history.',
    bestFor: 'Similar past project exists',
    gradient: ['#1B5886', '#3776A1'],
    Icon: IconAnalogy,
  },
  {
    id: 'expert',
    label: 'Expert Judgment',
    path: 'expert',
    desc: 'PERT-based estimation using best, likely and worst case per task.',
    bestFor: 'Experienced teams with task breakdown',
    gradient: ['#3776A1', '#5293BB'],
    Icon: IconExpert,
  },
  {
    id: 'decomposition',
    label: 'Decomposition + SD',
    path: 'decomposition',
    desc: 'Break work into sub-tasks and calculate standard deviation for confidence intervals.',
    bestFor: 'Risk-aware scheduling',
    gradient: ['#5293BB', '#6EB1D6'],
    Icon: IconDecomposition,
  },
  {
    id: 'storypoints',
    label: 'Story Points',
    path: 'storypoints',
    desc: 'Use team velocity and backlog story points to predict iterations needed.',
    bestFor: 'Scrum teams with velocity data',
    gradient: ['#0D7C59', '#0F9870'],
    Icon: IconStoryPoints,
  },
  {
    id: 'tshirt',
    label: 'T-Shirt Sizing',
    path: 'storypoints',
    desc: 'Rank features by size and business value to prioritize the release backlog.',
    bestFor: 'Early-stage release planning',
    gradient: ['#6EB1D6', '#3776A1'],
    Icon: IconTShirt,
  },
]

// ── Technique recommendation engine ──────────────────────────────────────────

function recommendTechnique(project, allProjects) {
  const completedWithEst = allProjects.filter(p => p.id !== project.id && p.status === 'Completed' && p.estimations.length > 0)
  const hasVelocityData  = project.tasks?.some(t => (t.storyPoints || 0) > 0)
  const featureCount     = project.features.length
  const isEarlyStage     = project.status === 'Planning'

  if (completedWithEst.length >= 1)
    return { id: 'analogy', reason: `You have ${completedWithEst.length} completed project(s) that can serve as an analogy base — this is the most data-grounded choice.` }
  if (hasVelocityData)
    return { id: 'storypoints', reason: 'Your team already uses story points on tasks — Story Points velocity is the most accurate next step.' }
  if (featureCount > 10)
    return { id: 'decomposition', reason: `With ${featureCount} features, Decomposition + SD gives you confidence intervals so you can communicate schedule risk.` }
  if (isEarlyStage)
    return { id: 'expert', reason: 'Early Planning stage with limited historical data — Expert Judgment (PERT) is the standard starting point.' }
  return { id: 'fuzzy', reason: 'Feature scope is still uncertain — Fuzzy Logic classification is ideal when requirements are not yet fully defined.' }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TechniqueSelector() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, projects } = useProjects()
  const project = getProject(id)

  if (!project) return <div style={{ padding: 32, color: C.textSecondary, textAlign: 'center' }}>Project not found.</div>

  const nextVersion  = project.estimations.length === 0 ? 'v1' : `v${project.estimations.length + 1}`
  const rec          = recommendTechnique(project, projects || [])
  const recTechnique = TECHNIQUES.find(t => t.path === rec.id || t.id === rec.id)

  return (
    <div style={{ padding: '28px 32px', background: C.mainBg, minHeight: '100%' }}>

      {/* Back */}
      <button
        onClick={() => navigate(`/dashboard/projects/${id}`)}
        style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: 'inherit' }}>
        ← Back to {project.name}
      </button>

      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Select Estimation Technique</h1>
            <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: C.primary + '18', color: C.primary, border: `1px solid ${C.primary}30` }}>
              Saves as {nextVersion}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>
            Project: <strong style={{ color: C.textPrimary }}>{project.name}</strong>
            &nbsp;·&nbsp; {project.features.length} features
            &nbsp;·&nbsp; {project.estimations.length} previous run{project.estimations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Q3: ASPM Technique Recommendation */}
        {recTechnique && (
          <div style={{ background: C.primary + '0d', border: `1px solid ${C.primary}28`, borderRadius: 10, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg, ${recTechnique.gradient[0]}, ${recTechnique.gradient[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <recTechnique.Icon color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>ASPM Recommended</span>
                <span style={{ padding: '2px 9px', borderRadius: 4, fontSize: 12, fontWeight: 700, background: recTechnique.gradient[0] + '18', color: recTechnique.gradient[0], border: `1px solid ${recTechnique.gradient[0]}30` }}>{recTechnique.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{rec.reason}</p>
            </div>
            <button onClick={() => navigate(`/dashboard/projects/${id}/estimate/${recTechnique.path}`)}
              style={{ padding: '7px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
              Use This
            </button>
          </div>
        )}

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {TECHNIQUES.map(tech => {
            const accentColor = tech.gradient[0]
            const gradient = `linear-gradient(135deg, ${tech.gradient[0]}, ${tech.gradient[1]})`
            return (
              <div
                key={tech.id}
                onClick={() => navigate(`/dashboard/projects/${id}/estimate/${tech.path}`)}
                style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s', display: 'flex', flexDirection: 'column' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px ${accentColor}28`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>

                {/* Gradient header band */}
                <div style={{ background: gradient, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <tech.Icon color="#FFFFFF" />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>Technique</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{tech.label}</div>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>{tech.desc}</p>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Best for</span>
                      <span style={{ padding: '2px 9px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: accentColor + '14', color: accentColor, border: `1px solid ${accentColor}28` }}>
                        {tech.bestFor}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: accentColor }}>
                      Select
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        <p style={{ textAlign: 'center', fontSize: 12, color: C.textSecondary, marginTop: 24 }}>
          You can run multiple techniques and compare results in the Estimation tab.
        </p>
      </div>
    </div>
  )
}
