import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../../context/ProjectContext'
import { useThemeColors } from '../../context/ThemeContext'
import { HeaderIconShell, IconComparison } from './EstimationIcons'

const BAR_COLORS = ['#3B5998', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']

function SimpleBarChart({ data, label, formatter }) {
  const C = useThemeColors()
  if (!data.length) return null
  const maxVal = Math.max(...data.map(d => d.value), 1)

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 80, fontSize: 11, color: C.textSecondary, textAlign: 'right', flexShrink: 0 }}>{d.label}</div>
            <div style={{ flex: 1, height: 22, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(d.value / maxVal) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length], borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8, transition: 'width 0.4s' }}>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatter ? formatter(d.value) : d.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ComparisonSummary() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, updateProject } = useProjects()
  const project = getProject(id)
  const [note, setNote] = useState(project?.comparisonNote || '')

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  function saveNote() {
    updateProject(id, { comparisonNote: note })
  }

  const effortData = project.estimations.map(e => ({ label: e.version, value: e.effortNum || 0 }))
  const costData = project.estimations.map(e => ({ label: e.version, value: e.costNum || 0 }))

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>Back to {project.name}</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <HeaderIconShell accent={C.primary}>
          <IconComparison color={C.primary} />
        </HeaderIconShell>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>Estimation Comparison Summary</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>{project.name} - {project.estimations.length} estimation run(s)</p>
        </div>
      </div>

      {project.estimations.length === 0 ? (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <p style={{ color: C.textSecondary }}>No estimations yet. <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)} style={{ color: C.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Run an estimation</button></p>
        </div>
      ) : (
        <>
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.primary + '0d', borderBottom: `2px solid ${C.border}` }}>
                  {['Version', 'Technique', 'Date', 'Estimated Effort', 'Estimated Cost', 'Duration', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.estimations.map((e, i) => (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                    <td style={{ padding: '13px 16px', fontWeight: 700, color: C.primary, fontSize: 15 }}>{e.version}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 500, color: C.textPrimary }}>{e.technique}</td>
                    <td style={{ padding: '13px 16px', color: C.textSecondary }}>{e.date}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: C.textPrimary }}>{e.effort}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: C.textPrimary }}>{e.cost}</td>
                    <td style={{ padding: '13px 16px', color: C.textSecondary }}>{e.duration}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: C.success + '15', color: C.success }}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
              <SimpleBarChart data={effortData} label="Effort Comparison (staff months)" formatter={v => `${v}mo`} />
            </div>
            <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
              <SimpleBarChart data={costData} label="Cost Comparison" formatter={v => `$${(v / 1000).toFixed(0)}k`} />
            </div>
          </div>

          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>PM Notes</h3>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: C.textSecondary }}>Document which estimate to use for final planning and the reasoning.</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Using v2 Expert Judgment estimate as the baseline because it accounts for individual task complexity better than the fuzzy logic approach."
              style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, resize: 'vertical', minHeight: 80, boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif', marginBottom: 12 }}
            />
            <button onClick={saveNote} style={{ padding: '8px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Note</button>
          </div>
        </>
      )}
    </div>
  )
}
