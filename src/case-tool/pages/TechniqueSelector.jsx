import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'


const TECHNIQUES = [
  { id: 'fuzzy', label: 'Fuzzy Logic', icon: '🔮', path: 'fuzzy', desc: 'Classify features by size (XS–XL) and estimate LOC from historical averages. Best when features vary widely in complexity.' },
  { id: 'analogy', label: 'Analogy', icon: '🔗', path: 'analogy', desc: 'Scale effort/cost/duration from a comparable past project. Best when a similar project exists in your history.' },
  { id: 'expert', label: 'Expert Judgment', icon: '🧠', path: 'expert', desc: 'PERT-based estimation with best/likely/worst cases per task. Best for experienced teams with detailed task breakdown.' },
  { id: 'decomposition', label: 'Decomposition + SD', icon: '📐', path: 'decomposition', desc: 'Calculate standard deviation from best/worst task estimates. Best for risk-aware scheduling with confidence intervals.' },
  { id: 'storypoints', label: 'Story Points', icon: '🃏', path: 'storypoints', desc: 'Use team velocity to predict iterations needed. Best for Scrum teams with established velocity data.' },
  { id: 'tshirt', label: 'T-Shirt Sizing', icon: '👕', path: 'storypoints', desc: 'Rank features by size and business value to prioritize the backlog. Best for early-stage release planning.' },
]

export default function TechniqueSelector() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject } = useProjects()
  const project = getProject(id)

  if (!project) return <div style={{ padding: 32, color: C.textSecondary, textAlign: 'center' }}>Project not found.</div>

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
        ← Back to {project.name}
      </button>

      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Select Estimation Technique</h1>
          <p style={{ margin: 0, fontSize: 14, color: C.textSecondary }}>
            Choose a technique for <strong>{project.name}</strong> — this will be saved as {project.estimations.length === 0 ? 'v1' : `v${project.estimations.length + 1}`}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {TECHNIQUES.map(tech => (
            <div key={tech.id}
              onClick={() => navigate(`/dashboard/projects/${id}/estimate/${tech.path}`)}
              style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: 14, padding: 22, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,89,152,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{tech.icon}</div>
                <button style={{ padding: '6px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Select →
                </button>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{tech.label}</h3>
              <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
