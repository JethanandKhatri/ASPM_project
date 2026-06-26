import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'


export default function HistoryDetail() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject } = useProjects()
  const project = getProject(id)

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  const priorityColor = { High: C.danger, Medium: C.warning, Low: C.success }
  const statusBadge = { Active: { bg: C.primary + '15', color: C.primary }, Completed: { bg: C.success + '15', color: C.success } }[project.status] || { bg: C.border, color: C.textSecondary }
  const doneFeat = project.features.filter(f => f.status === 'Done').length

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate('/dashboard/history')} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 18, padding: 0 }}>← Back to History</button>

      {/* Header */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {project.status === 'Completed' && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.success + '15', color: C.success, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                ✓ COMPLETED PROJECT
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>{project.name}</h1>
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusBadge.bg, color: statusBadge.color }}>{project.status}</span>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: C.primary + '18', color: C.primary }}>{project.domain}</span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: C.textSecondary }}>{project.description}</p>
            <div style={{ fontSize: 12, color: C.textSecondary }}>📅 {project.startDate} → {project.deadline} | 👥 {project.teamSize} members</div>
          </div>
          <button onClick={() => navigate(`/dashboard/projects/${id}/estimate/analogy`)}
            style={{ padding: '9px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            Use as Analogy Base →
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Features', value: project.features.length, sub: `${doneFeat} done`, icon: '◈' },
          { label: 'Estimation Runs', value: project.estimations.length, sub: project.estimations.map(e => e.technique).join(', ') || '—', icon: '▲', color: '#0891b2' },
          { label: 'Total Risks', value: project.risks.length, sub: `${project.risks.filter(r => r.priority === 'High').length} High`, icon: '⚠', color: C.danger },
          { label: 'Risks Resolved', value: project.risks.filter(r => r.status === 'Resolved').length, sub: 'of ' + project.risks.length + ' total', icon: '✓', color: C.success },
        ].map(m => (
          <div key={m.label} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: (m.color || C.primary) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary }}>{m.value}</div>
              <div style={{ fontSize: 11, color: C.textSecondary }}>{m.label}</div>
              <div style={{ fontSize: 10, color: m.color || C.primary, marginTop: 1 }}>{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Estimation history */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Estimation History</h3>
          {project.estimations.length === 0 ? (
            <p style={{ color: C.textSecondary, fontSize: 13, margin: 0 }}>No estimations recorded.</p>
          ) : (
            project.estimations.map(e => (
              <div key={e.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: C.primary, fontSize: 14 }}>{e.version}</span>
                  <span style={{ fontSize: 11, color: C.textSecondary }}>{e.date}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{e.technique}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, fontSize: 12 }}>
                  <div><span style={{ color: C.textSecondary }}>Effort: </span><span style={{ fontWeight: 500 }}>{e.effort}</span></div>
                  <div><span style={{ color: C.textSecondary }}>Cost: </span><span style={{ fontWeight: 500 }}>{e.cost}</span></div>
                  <div><span style={{ color: C.textSecondary }}>Duration: </span><span style={{ fontWeight: 500 }}>{e.duration}</span></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Risk log */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Risk Log</h3>
          {project.risks.length === 0 ? (
            <p style={{ color: C.textSecondary, fontSize: 13, margin: 0 }}>No risks recorded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {project.risks.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: C.mainBg, borderRadius: 6, fontSize: 12 }}>
                  <div style={{ flex: 1, marginRight: 8 }}>
                    <span style={{ fontWeight: 500, color: C.textPrimary }}>{r.description}</span>
                    <span style={{ color: C.textSecondary, marginLeft: 6 }}>({r.category})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span style={{ padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: (priorityColor[r.priority] || C.textSecondary) + '20', color: priorityColor[r.priority] || C.textSecondary }}>{r.priority}</span>
                    <span style={{ padding: '1px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: r.status === 'Resolved' ? C.success + '15' : C.danger + '15', color: r.status === 'Resolved' ? C.success : C.danger }}>{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
