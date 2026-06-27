import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../../context/ProjectContext'
import { useThemeColors } from '../../context/ThemeContext'

export default function Analogy() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, getProject, addEstimation } = useProjects()
  const project = getProject(id)
  const pastProjects = projects.filter(p => p.id !== id && p.status === 'Completed' && p.estimations.length > 0)

  const [selectedPastId, setSelectedPastId] = useState(pastProjects[0]?.id || '')
  const [newLOC, setNewLOC] = useState('')
  const [adjustment, setAdjustment] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const pastProject = projects.find(p => p.id === selectedPastId)
  const pastEst = pastProject?.estimations[0]
  const pastLOC = pastEst?.data?.totalLOC || pastEst?.data?.newLOC || 7600

  const scaleFactor = newLOC ? (parseFloat(newLOC) / pastLOC) * (1 + (parseFloat(adjustment) || 0) / 100) : 0
  const scaledEffort = pastEst ? Math.round((pastEst.effortNum || 18) * scaleFactor * 10) / 10 : 0
  const scaledCost = pastEst ? Math.round((pastEst.costNum || 90000) * scaleFactor) : 0
  const scaledDuration = pastEst ? Math.round((pastEst.durationNum || 6) * scaleFactor * 10) / 10 : 0

  function handleSave() {
    addEstimation(id, {
      technique: 'Analogy',
      date: new Date().toISOString().split('T')[0],
      effort: `${scaledEffort} staff months`,
      cost: `$${scaledCost.toLocaleString()}`,
      duration: `${scaledDuration} months`,
      effortNum: scaledEffort, costNum: scaledCost, durationNum: scaledDuration,
      status: 'Saved',
      data: { analogyProject: pastProject?.name, analogyLOC: pastLOC, analogyEffort: pastEst?.effortNum, analogyCost: pastEst?.costNum, analogyDuration: pastEst?.durationNum, newLOC: parseFloat(newLOC), adjustmentFactor: parseFloat(adjustment) || 0, scaledEffort, scaledCost, scaledDuration, notes },
    })
    setSaved(true)
    setTimeout(() => navigate(`/dashboard/projects/${id}`), 1200)
  }

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  const inp = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: C.textPrimary }

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>← Back to Technique Selector</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ fontSize: 28 }}>🔗</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>Analogy-Based Estimation</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>{project.name}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
        {/* Step 1 */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Step 1 — Select Analogy Project</div>
          {pastProjects.length === 0 ? (
            <p style={{ color: C.textSecondary, fontSize: 13 }}>No completed projects available as analogy base.</p>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>Past Project</label>
                <select style={inp} value={selectedPastId} onChange={e => setSelectedPastId(e.target.value)}>
                  {pastProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {pastEst && (
                <div style={{ background: C.mainBg, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 8 }}>Auto-filled from past project:</div>
                  {[
                    { label: 'Estimated LOC', value: pastLOC.toLocaleString() },
                    { label: 'Effort', value: pastEst.effort },
                    { label: 'Cost', value: pastEst.cost },
                    { label: 'Duration', value: pastEst.duration },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ color: C.textSecondary }}>{row.label}</span>
                      <span style={{ fontWeight: 600, color: C.textPrimary }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Step 2 */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Step 2 — New Project Parameters</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>New Project Estimated LOC</label>
            <input type="number" style={inp} placeholder="e.g. 8500" value={newLOC} onChange={e => setNewLOC(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>Size Adjustment Factor (%)</label>
            <input type="number" style={inp} placeholder="e.g. 10 for +10%" value={adjustment} onChange={e => setAdjustment(e.target.value)} />
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>Positive = more complex, negative = simpler</div>
          </div>

          {/* Live results */}
          {newLOC && scaledEffort > 0 && (
            <div style={{ background: C.primary + '0d', border: `1px solid ${C.primary}30`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, marginBottom: 8 }}>Scaled Results (live)</div>
              {[
                { label: 'Scale Factor', value: scaleFactor.toFixed(2) + 'x' },
                { label: 'Scaled Effort', value: `${scaledEffort} staff months` },
                { label: 'Scaled Cost', value: `$${scaledCost.toLocaleString()}` },
                { label: 'Scaled Duration', value: `${scaledDuration} months` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.textSecondary }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: C.textPrimary }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3 */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Step 3 — Notes & Rationale</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Document assumptions, differences from analogy project, and rationale for the adjustment factor..."
            style={{ width: '100%', padding: '10px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, resize: 'vertical', minHeight: 80, boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            {saved ? (
              <div style={{ padding: '10px 20px', background: C.success + '12', border: `1px solid ${C.success}30`, borderRadius: 8, fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Estimation Saved!</div>
            ) : (
              <button onClick={handleSave} disabled={!newLOC || !scaledEffort}
                style={{ padding: '10px 24px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !newLOC ? 0.5 : 1 }}>
                Save Estimation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
