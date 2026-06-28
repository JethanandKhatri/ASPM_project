import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

function StatusBadge({ status }) {
  const C = useThemeColors()
  const cfg = {
    Planning:  { bg: '#FFF3D6', color: '#B7791F', border: '#F0D28B' },
    Active:    { bg: '#E3F0FB', color: C.primary, border: '#BCD7EE' },
    Completed: { bg: '#E6F7EF', color: C.success, border: '#B9E6CB' },
    'On Hold': { bg: '#EEF2F6', color: C.textSecondary, border: '#D7E1EA' },
  }[status] || { bg: C.border, color: C.textSecondary }
  return <span style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border || 'transparent'}` }}>{status}</span>
}

function PriorityBadge({ priority }) {
  const C = useThemeColors()
  const cfg = {
    'Must Have':    { bg: '#FEE7E5', color: C.danger },
    'Should Have':  { bg: '#FFF2D8', color: C.warning },
    'Could Have':   { bg: '#E7F7ED', color: C.success },
    "Won't Have":   { bg: '#EEF2F6', color: C.textSecondary },
    High:   { bg: '#FEE7E5', color: C.danger },
    Medium: { bg: '#FFF2D8', color: C.warning },
    Low:    { bg: '#E7F7ED', color: C.success },
  }[priority] || {}
  return <span style={{ padding: '4px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{priority}</span>
}

const SVG_ICONS = {
  features: (c) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  chart: (c) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  shield: (c) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  calendar: (c) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  dollar: (c) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>
    </svg>
  ),
  clock: (c) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
}

function MetricCard({ label, value, sub, icon, color }) {
  const C = useThemeColors()
  const clr = color || C.primary
  const svgFn = SVG_ICONS[icon]
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: '0 10px 26px rgba(6, 45, 81, 0.06)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: '0 0 auto 0', height: 4, background: `linear-gradient(90deg, ${clr}, ${clr}99)` }} />
      <div style={{ width: 46, height: 46, borderRadius: 14, background: clr + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `inset 0 0 0 1px ${clr}22` }}>
        {svgFn ? svgFn(clr) : <span style={{ fontSize: 18, color: clr }}>{icon}</span>}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.textSecondary, letterSpacing: 0.2 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.textPrimary, lineHeight: 1.05, marginTop: 6 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: clr, marginTop: 6, fontWeight: 700 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ---- Overview Tab ----
function OverviewTab({ project }) {
  const C = useThemeColors()
  const statusColor = { Done: C.success, 'In Progress': C.primary, 'To Do': C.textSecondary }
  return (
    <div>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Project Description</h4>
        <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{project.description}</p>
      </div>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
        <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Features ({project.features.length})</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {['#', 'Feature Name', 'Description', 'Priority', 'Acceptance Criteria', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {project.features.map((f, i) => {
              const acList = Array.isArray(f.acceptanceCriteria)
                ? f.acceptanceCriteria
                : (typeof f.acceptanceCriteria === 'string' && f.acceptanceCriteria.trim()
                    ? f.acceptanceCriteria.split('\n').map(s => s.trim()).filter(Boolean)
                    : [])
              const acVerified = f.status === 'Done' && acList.length > 0
              return (
                <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                  <td style={{ padding: '10px 12px', color: C.textSecondary }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: C.textPrimary }}>{f.name}</td>
                  <td style={{ padding: '10px 12px', color: C.textSecondary }}>{f.description}</td>
                  <td style={{ padding: '10px 12px' }}><PriorityBadge priority={f.priority} /></td>
                  <td style={{ padding: '10px 12px', fontSize: 12, maxWidth: 200, verticalAlign: 'top' }}>
                    {acList.length === 0
                      ? <span style={{ color: C.border }}>â€”</span>
                      : (
                        <div>
                          {acList.slice(0, 3).map((ac, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 3 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={acVerified ? C.success : C.textSecondary} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
                              <span style={{ color: acVerified ? C.textPrimary : C.textSecondary, lineHeight: 1.4 }}>{ac}</span>
                            </div>
                          ))}
                          {acList.length > 3 && <span style={{ fontSize: 10, color: C.textSecondary }}>+{acList.length - 3} more</span>}
                          {acVerified && <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: C.success }}>âœ“ AC Verified (Done)</div>}
                        </div>
                      )
                    }
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: statusColor[f.status] || C.textSecondary }}>{f.status}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Estimation Tab ----
function EstimationTab({ project, onRunEstimation, onViewComparison }) {
  const C = useThemeColors()
  const { getActuals, saveActuals } = useProjects()
  const [showActualsModal, setShowActualsModal] = useState(false)
  const actuals = getActuals(project.id)
  const [actualsForm, setActualsForm] = useState({
    effortNum: actuals?.effortNum || '',
    costNum: actuals?.costNum || '',
    durationNum: actuals?.durationNum || '',
    completedDate: actuals?.completedDate || new Date().toISOString().split('T')[0],
    notes: actuals?.notes || '',
  })

  function handleSaveActuals() {
    saveActuals(project.id, {
      effortNum: parseFloat(actualsForm.effortNum) || 0,
      costNum: parseFloat(actualsForm.costNum) || 0,
      durationNum: parseFloat(actualsForm.durationNum) || 0,
      completedDate: actualsForm.completedDate,
      notes: actualsForm.notes,
    })
    setShowActualsModal(false)
  }

  function variance(est, act) {
    if (!act || act === 0) return null
    const v = ((est - act) / act * 100)
    return v
  }

  const inp = { width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: C.cardBg, color: C.textPrimary }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Estimation Runs ({project.estimations.length})</h4>
        <div style={{ display: 'flex', gap: 8 }}>
          {project.estimations.length > 1 && (
            <button onClick={onViewComparison} style={{ padding: '6px 14px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              View Comparison
            </button>
          )}
          <button onClick={() => setShowActualsModal(true)} style={{ padding: '6px 14px', background: C.success + '15', color: C.success, border: `1px solid ${C.success}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {actuals ? 'âœ“ Actuals Recorded' : '+ Enter Actuals'}
          </button>
        </div>
      </div>

      {project.estimations.length === 0 ? (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, textAlign: 'center' }}>
          <p style={{ color: C.textSecondary, margin: 0 }}>No estimations yet. Click "Run Estimation" to start.</p>
        </div>
      ) : (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.primary + '0d', borderBottom: `2px solid ${C.border}` }}>
                {['Version', 'Technique', 'Date', 'Effort', 'Cost', 'Duration', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.estimations.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: C.primary }}>{e.version}</td>
                  <td style={{ padding: '11px 14px', color: C.textPrimary }}>{e.technique}</td>
                  <td style={{ padding: '11px 14px', color: C.textSecondary }}>{e.date}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 500, color: C.textPrimary }}>{e.effort}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 500, color: C.textPrimary }}>{e.cost}</td>
                  <td style={{ padding: '11px 14px', color: C.textSecondary }}>{e.duration}</td>
                  <td style={{ padding: '11px 14px' }}><span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: C.success + '15', color: C.success }}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actuals vs Estimated Comparison */}
      {actuals && project.estimations.length > 0 && (
        <div style={{ background: C.cardBg, border: `2px solid ${C.success}40`, borderRadius: 10, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={C.success} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Actual vs Estimated â€” Accuracy Report</h4>
            <span style={{ fontSize: 11, color: C.textSecondary, marginLeft: 'auto' }}>Completed: {actuals.completedDate}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Actual Effort', value: `${actuals.effortNum} staff months`, icon: 'â—·' },
              { label: 'Actual Cost', value: `$${Number(actuals.costNum).toLocaleString()}`, icon: '$' },
              { label: 'Actual Duration', value: `${actuals.durationNum} months`, icon: 'â–£' },
            ].map(m => (
              <div key={m.label} style={{ background: C.success + '0d', border: `1px solid ${C.success}25`, borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>{m.icon} {m.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{m.value}</div>
              </div>
            ))}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Version', 'Technique', 'Est. Effort', 'Effort Var %', 'Est. Cost', 'Cost Var %', 'Est. Duration', 'Duration Var %'].map(h => (
                  <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.estimations.map((e, i) => {
                const ve = variance(e.effortNum, actuals.effortNum)
                const vc = variance(e.costNum, actuals.costNum)
                const vd = variance(e.durationNum, actuals.durationNum)
                const varStyle = v => v === null ? {} : { color: Math.abs(v) < 15 ? C.success : Math.abs(v) < 30 ? C.warning : C.danger, fontWeight: 600 }
                const varText = v => v === null ? 'â€”' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`
                return (
                  <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: C.primary }}>{e.version}</td>
                    <td style={{ padding: '8px 10px', color: C.textPrimary }}>{e.technique}</td>
                    <td style={{ padding: '8px 10px', color: C.textPrimary }}>{e.effort}</td>
                    <td style={{ padding: '8px 10px', ...varStyle(ve) }}>{varText(ve)}</td>
                    <td style={{ padding: '8px 10px', color: C.textPrimary }}>{e.cost}</td>
                    <td style={{ padding: '8px 10px', ...varStyle(vc) }}>{varText(vc)}</td>
                    <td style={{ padding: '8px 10px', color: C.textPrimary }}>{e.duration}</td>
                    <td style={{ padding: '8px 10px', ...varStyle(vd) }}>{varText(vd)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {actuals.notes && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: C.mainBg, borderRadius: 6, fontSize: 12, color: C.textSecondary }}>
              <strong style={{ color: C.textPrimary }}>Notes: </strong>{actuals.notes}
            </div>
          )}
        </div>
      )}

      {/* Actuals Modal */}
      {showActualsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.cardBg, borderRadius: 14, padding: 28, width: 460, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', border: `1px solid ${C.border}` }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Enter Actual Results</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: C.textSecondary }}>Record what the project actually took â€” used for estimation accuracy reports.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[['Actual Effort (staff months)', 'effortNum', 'number', '6.5'], ['Actual Cost ($)', 'costNum', 'number', '32500'], ['Actual Duration (months)', 'durationNum', 'number', '4'], ['Completion Date', 'completedDate', 'date', '']].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>{label}</label>
                  <input type={type} placeholder={ph} value={actualsForm[key]}
                    onChange={e => setActualsForm(f => ({ ...f, [key]: e.target.value }))}
                    style={inp} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Notes (optional)</label>
              <textarea value={actualsForm.notes} onChange={e => setActualsForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="What went differently from estimates? Scope changes, unexpected risks..."
                style={{ ...inp, minHeight: 72, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowActualsModal(false)} style={{ padding: '8px 18px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.cardBg, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={handleSaveActuals} style={{ padding: '8px 20px', background: C.success, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save Actuals</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Risks Tab ----
function RisksTab({ project, onManageRisks }) {
  const C = useThemeColors()
  const topRisks = [...project.risks].sort((a, b) => b.riskExposure - a.riskExposure).slice(0, 5)
  const priorityColor = { High: C.danger, Medium: C.warning, Low: C.success }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Top Risks by Exposure</h4>
        <button onClick={onManageRisks} style={{ padding: '6px 14px', background: C.danger + '15', color: C.danger, border: `1px solid ${C.danger}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Manage All Risks
        </button>
      </div>
      {topRisks.length === 0 ? (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, textAlign: 'center' }}>
          <p style={{ color: C.textSecondary, margin: 0 }}>No risks logged yet.</p>
        </div>
      ) : (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.danger + '0d', borderBottom: `2px solid ${C.border}` }}>
                {['Risk Description', 'Category', 'Probability', 'Risk Exposure', 'Priority', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.danger, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topRisks.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: C.textPrimary, maxWidth: 200 }}>{r.description}</td>
                  <td style={{ padding: '10px 14px', color: C.textSecondary }}>{r.category}</td>
                  <td style={{ padding: '10px 14px', color: C.textPrimary }}>{r.probability}%</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: priorityColor[r.priority] }}>${r.riskExposure.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: priorityColor[r.priority] + '20', color: priorityColor[r.priority] }}>{r.priority}</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: r.status === 'Resolved' ? C.success : r.status === 'In Progress' ? C.warning : C.textSecondary }}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---- Team Tab ----
function TeamTab({ project }) {
  const C = useThemeColors()
  return (
    <div>
      {project.teamRoles && (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary, flexShrink: 0 }}>Team Roles:</span>
          <span style={{ fontSize: 13, color: C.textPrimary }}>{project.teamRoles}</span>
        </div>
      )}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
        <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Team Members ({project.team.length})</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {project.team.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.mainBg }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {m.name[0]}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{m.name}</div>
                <div style={{ fontSize: 11, color: m.role === 'project_manager' ? C.primary : C.textSecondary, fontWeight: m.role === 'project_manager' ? 600 : 400 }}>
                  {m.role === 'project_manager' ? 'Project Manager' : 'Team Member'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Activity Tab with @Mentions ----
function ActivityTab({ project, onAddComment }) {
  const C = useThemeColors()
  const [commentText, setCommentText] = useState('')
  const [mentionQuery, setMentionQuery] = useState(null)
  const [mentionPos, setMentionPos] = useState(null)
  const textareaRef = useRef(null)

  const teamNames = project.team.map(m => m.name)

  function handleTextChange(e) {
    const val = e.target.value
    setCommentText(val)
    const cursor = e.target.selectionStart
    const textBefore = val.slice(0, cursor)
    const atMatch = textBefore.match(/@(\w*)$/)
    if (atMatch) {
      setMentionQuery(atMatch[1].toLowerCase())
      setMentionPos(cursor - atMatch[0].length)
    } else {
      setMentionQuery(null)
      setMentionPos(null)
    }
  }

  function insertMention(name) {
    const before = commentText.slice(0, mentionPos)
    const after = commentText.slice(textareaRef.current.selectionStart)
    const newText = `${before}@${name} ${after}`
    setCommentText(newText)
    setMentionQuery(null)
    setMentionPos(null)
    textareaRef.current.focus()
  }

  const mentionSuggestions = mentionQuery !== null
    ? teamNames.filter(n => n.toLowerCase().includes(mentionQuery)).slice(0, 5)
    : []

  function submitComment() {
    if (!commentText.trim()) return
    onAddComment({ author: 'You', text: commentText.trim() })
    setCommentText('')
    setMentionQuery(null)
  }

  function renderCommentText(text) {
    const parts = text.split(/(@\w+(?:\s\w+)?)/g)
    return parts.map((part, i) =>
      part.startsWith('@') ? (
        <span key={i} style={{ color: C.primary, fontWeight: 600 }}>{part}</span>
      ) : part
    )
  }

  const allItems = [
    ...project.comments.map(c => ({ ...c, itemType: 'comment' })),
    ...(project.activityLog || []).map(a => ({ ...a, itemType: 'activity' })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <div>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 16, position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={commentText}
          onChange={handleTextChange}
          placeholder="Add a comment... Type @ to mention a team member"
          style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, resize: 'none', minHeight: 72, boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif', background: C.mainBg, color: C.textPrimary }}
        />
        {mentionSuggestions.length > 0 && (
          <div style={{ position: 'absolute', left: 16, top: 82, background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10, minWidth: 180 }}>
            {mentionSuggestions.map(name => (
              <div key={name} onClick={() => insertMention(name)}
                style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: C.textPrimary, borderBottom: `1px solid ${C.border}` }}
                onMouseEnter={e => e.currentTarget.style.background = C.primary + '12'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ color: C.primary, fontWeight: 600 }}>@</span>{name}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: C.textSecondary }}>Type @ to mention a team member</span>
          <button onClick={submitComment} disabled={!commentText.trim()}
            style={{ padding: '7px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: commentText.trim() ? 1 : 0.5, fontFamily: 'inherit' }}>
            Comment
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Activity Feed</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allItems.map((item, i) => (
          <div key={item.id || i} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, display: 'flex', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: item.itemType === 'comment' ? C.primary : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: item.itemType === 'comment' ? '#fff' : C.textSecondary, flexShrink: 0 }}>
              {item.itemType === 'comment' ? (item.author || 'Y')[0] : 'âš™'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{item.author || item.user}</span>
                {item.itemType === 'activity' && <span style={{ fontSize: 12, color: C.textSecondary }}>{item.action}</span>}
                <span style={{ fontSize: 11, color: C.textSecondary, marginLeft: 'auto' }}>{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              {item.itemType === 'comment' && (
                <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>
                  {renderCommentText(item.text)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Tasks Tab (Kanban) ----
function TasksTab({ project, onAddTask, onMoveTask }) {
  const C = useThemeColors()
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ name: '', assignee: '', priority: 'Should Have', dueDate: '', feature: '', description: '' })
  const columns = ['To Do', 'In Progress', 'Done']
  const colColors = { 'To Do': C.textSecondary, 'In Progress': C.primary, Done: C.success }

  function submitTask() {
    if (!newTask.name.trim()) return
    onAddTask(newTask)
    setShowModal(false)
    setNewTask({ name: '', assignee: '', priority: 'Should Have', dueDate: '', feature: '', description: '' })
  }

  const inp = { width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={() => setShowModal(true)} style={{ padding: '7px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Task</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {columns.map(col => {
          const tasks = project.tasks.filter(t => t.status === col)
          return (
            <div key={col} style={{ background: C.mainBg, borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: colColors[col] }}>{col}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: colColors[col], borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tasks.map(task => (
                  <div key={task.id} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{task.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: task.priority === 'Must Have' ? C.danger : task.priority === 'Should Have' ? C.warning : task.priority === 'Could Have' ? C.success : C.textSecondary, background: (task.priority === 'Must Have' ? C.danger : task.priority === 'Should Have' ? C.warning : task.priority === 'Could Have' ? C.success : C.border) + '18', padding: '1px 6px', borderRadius: 3 }}>{task.priority}</span>
                    </div>
                    {task.feature && <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Feature: {task.feature}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.primary }}>{task.assignee?.[0]?.toUpperCase()}</span>
                      {task.dueDate && <span style={{ fontSize: 10, color: C.textSecondary }}>{task.dueDate}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {columns.filter(c => c !== col).map(nextCol => (
                        <button key={nextCol} onClick={() => onMoveTask(task.id, nextCol)}
                          style={{ fontSize: 10, padding: '2px 7px', border: `1px solid ${C.border}`, borderRadius: 4, background: C.cardBg, color: C.textSecondary, cursor: 'pointer', fontFamily: 'inherit' }}>
                          â†’ {nextCol}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.cardBg, borderRadius: 12, padding: 24, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `1px solid ${C.border}` }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Add Task</h3>
            {[['Task Name', 'name', 'text', 'e.g. Build login page'], ['Assign To', 'assignee', 'text', 'Team member name'], ['Due Date', 'dueDate', 'date', ''], ['Feature', 'feature', 'text', 'Linked feature (optional)']].map(([label, key, type, ph]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{label}</label>
                <input type={type} placeholder={ph} value={newTask[key]} onChange={e => setNewTask(t => ({ ...t, [key]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))} style={{ ...inp }}>
                {['Must Have', 'Should Have', 'Could Have', "Won't Have"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.cardBg, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={submitTask} style={{ padding: '8px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TasksBoardTab({ project, onAddTask, onMoveTask }) {
  const C = useThemeColors()
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ name: '', assignee: '', priority: 'Should Have', dueDate: '', feature: '', description: '' })
  const columns = ['To Do', 'In Progress', 'Done']
  const colStyles = {
    'To Do': { accent: '#D39A1E', soft: '#FFF3D8', line: '#F0D18A' },
    'In Progress': { accent: C.primary, soft: '#E8F2FB', line: '#C7DBEE' },
    Done: { accent: C.success, soft: '#E7F7ED', line: '#BEE4CC' },
  }

  function submitTask() {
    if (!newTask.name.trim()) return
    onAddTask(newTask)
    setShowModal(false)
    setNewTask({ name: '', assignee: '', priority: 'Should Have', dueDate: '', feature: '', description: '' })
  }

  const inp = { width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Task Board</h4>
          <p style={{ margin: '5px 0 0', fontSize: 12, color: C.textSecondary }}>
            Move work from planning to execution with a clearer Kanban layout.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 10px 20px rgba(0,58,107,0.20)' }}>+ Add Task</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18, alignItems: 'start' }}>
        {columns.map((col) => {
          const tasks = project.tasks.filter((t) => t.status === col)
          const styleCfg = colStyles[col]
          return (
            <div key={col} style={{ background: C.cardBg, border: `1px solid ${styleCfg.line}`, borderRadius: 18, padding: 14, boxShadow: '0 12px 28px rgba(7, 42, 74, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, padding: '4px 4px 12px', borderBottom: `1px solid ${styleCfg.line}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: styleCfg.accent, boxShadow: `0 0 0 5px ${styleCfg.soft}` }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: styleCfg.accent }}>{col}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: styleCfg.accent, background: styleCfg.soft, borderRadius: 999, minWidth: 28, height: 28, padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tasks.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tasks.length === 0 && (
                  <div style={{ border: `1px dashed ${styleCfg.line}`, borderRadius: 14, padding: '18px 14px', background: styleCfg.soft, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: styleCfg.accent }}>No tasks in {col}</div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>
                      {col === 'To Do' ? 'New tasks will appear here.' : col === 'In Progress' ? 'Move active work here.' : 'Completed tasks will collect here.'}
                    </div>
                  </div>
                )}

                {tasks.map((task) => (
                  <div key={task.id} style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, boxShadow: '0 10px 20px rgba(7, 42, 74, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, lineHeight: 1.45 }}>{task.name}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {task.feature && <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8, fontWeight: 600 }}>Feature: <span style={{ color: C.textPrimary }}>{task.feature}</span></div>}
                    {task.description && <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5, marginBottom: 10 }}>{task.description}</div>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, background: C.primary + '12', padding: '4px 9px', borderRadius: 999 }}>
                        {task.assignee?.trim() ? task.assignee : 'Unassigned'}
                      </span>
                      {task.dueDate && <span style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>Due {task.dueDate}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                      {columns.filter((c) => c !== col).map((nextCol) => (
                        <button key={nextCol} onClick={() => onMoveTask(task.id, nextCol)}
                          style={{ fontSize: 10, padding: '5px 9px', border: `1px solid ${C.border}`, borderRadius: 999, background: C.mainBg, color: C.textSecondary, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                          Move to {nextCol}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.cardBg, borderRadius: 14, padding: 24, width: 460, boxShadow: '0 12px 36px rgba(0,0,0,0.16)', border: `1px solid ${C.border}` }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Add Task</h3>
            {[['Task Name', 'name', 'text', 'e.g. Build login page'], ['Assign To', 'assignee', 'text', 'Team member name'], ['Due Date', 'dueDate', 'date', ''], ['Feature', 'feature', 'text', 'Linked feature (optional)']].map(([label, key, type, ph]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textPrimary, marginBottom: 5 }}>{label}</label>
                <input type={type} placeholder={ph} value={newTask[key]} onChange={e => setNewTask(t => ({ ...t, [key]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.textPrimary, marginBottom: 5 }}>Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))} style={inp}>
                {['Must Have', 'Should Have', 'Could Have', "Won't Have"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '9px 16px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.cardBg, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={submitTask} style={{ padding: '9px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Enhanced Timeline / Gantt Tab ----
function TimelineEditModal({ item, form, setForm, onClose, onSave, C }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.cardBg, borderRadius: 14, padding: 26, width: 480, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Edit Gantt Item</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: C.textSecondary, lineHeight: 1, padding: 2 }}>x</button>
        </div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 16 }}>{item?.name}</div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Rank</label>
            <input
              type="number"
              min="0"
              value={form.rank}
              onChange={e => setForm(f => ({ ...f, rank: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Story Points / Duration</label>
            <input
              type="number"
              min="1"
              value={form.storyPoints}
              onChange={e => setForm(f => ({ ...f, storyPoints: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit', boxSizing: 'border-box' }}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={onSave} style={{ padding: '8px 18px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
        </div>
      </div>
    </div>
  )
}

function TimelineTab({ project }) {
  const C = useThemeColors()
  const { updateStory } = useProjects()
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({ rank: '0', storyPoints: '3', status: 'To Do' })
  const today = new Date()
  const start = new Date(project.startDate)
  const end = new Date(project.deadline)
  const totalMs = Math.max(end - start, 1)
  const overdue = today > end

  const months = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 1)
  while (cur < endMonth) {
    months.push(new Date(cur))
    cur.setMonth(cur.getMonth() + 1)
  }

  const statusColors = {
    Done: { fill: C.success, track: C.success + '14', text: C.success },
    'In Progress': { fill: C.primary, track: C.primary + '14', text: C.primary },
    'To Do': { fill: '#E7B84B', track: '#DCEAF6', text: '#8A6410' },
  }
  const progressForStatus = { Done: 100, 'In Progress': 58, 'To Do': 18 }

  const orderedFeatures = (project.features || [])
    .map((f, idx) => ({
      ...f,
      _idx: idx,
      _duration: Math.max(1, parseInt(f.storyPoints, 10) || 3),
    }))
    .sort((a, b) => (a.rank || 0) - (b.rank || 0) || a._idx - b._idx)

  const totalPlannedDays = orderedFeatures.reduce((sum, f) => sum + f._duration, 0) || 1
  const chartMinWidth = Math.max(860, months.length * 140)
  const todayPct = Math.min(100, Math.max(0, ((today - start) / totalMs) * 100))
  const hasTodayMarker = today >= start && today <= end

  function pct(d) {
    return Math.min(100, Math.max(0, ((new Date(d) - start) / totalMs) * 100))
  }

  function openEdit(item) {
    setEditItem(item)
    setEditForm({
      rank: String(item.rank || 0),
      storyPoints: String(item.storyPoints || 3),
      status: item.status || 'To Do',
    })
  }

  async function saveEdit() {
    if (!editItem) return
    await updateStory(project.id, editItem.id, {
      rank: parseInt(editForm.rank, 10) || 0,
      storyPoints: Math.max(1, parseInt(editForm.storyPoints, 10) || 1),
      status: editForm.status,
    })
    setEditItem(null)
  }

  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 22, boxShadow: '0 10px 24px rgba(0,58,107,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.textPrimary }}>Professional Gantt Timeline</h4>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: C.textSecondary }}>
            Features are scheduled by rank. Story points control bar length, and status controls color.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {[
            ['Done', statusColors.Done.fill],
            ['In Progress', statusColors['In Progress'].fill],
            ['To Do', statusColors['To Do'].fill],
            ['Today', C.danger],
          ].map(([label, color]) => (
            <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: C.mainBg, border: `1px solid ${C.border}` }}>
              <div style={{ width: label === 'Today' ? 3 : 10, height: label === 'Today' ? 16 : 10, borderRadius: label === 'Today' ? 2 : 3, background: color }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Features', value: orderedFeatures.length, color: C.primary },
          { label: 'Planned Days', value: totalPlannedDays, color: C.warning },
          { label: 'Project Start', value: project.startDate, color: C.success },
          { label: 'Deadline', value: project.deadline, color: overdue ? C.danger : C.textSecondary },
        ].map((item) => (
          <div key={item.label} style={{ padding: '10px 12px', borderRadius: 10, background: C.mainBg, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>{item.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginTop: 4 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ minWidth: chartMinWidth }}>
          <div style={{ display: 'flex', marginBottom: 10 }}>
            <div style={{ width: 260, flexShrink: 0, paddingRight: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Features</div>
            </div>
            <div style={{ flex: 1, position: 'relative', height: 30, background: C.mainBg, borderRadius: 8, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {months.map((m, i) => {
                const left = pct(m)
                return (
                  <div key={i} style={{ position: 'absolute', left: `${left}%`, top: 6, fontSize: 10, color: C.textSecondary, fontWeight: 700, whiteSpace: 'nowrap', transform: 'translateX(-50%)' }}>
                    {m.toLocaleDateString('en', { month: 'short', year: '2-digit' })}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            {hasTodayMarker && (
              <div style={{ position: 'absolute', left: `calc(260px + ${todayPct}% * (100% - 260px) / 100)`, top: 0, bottom: 0, width: 3, background: C.danger, zIndex: 3, opacity: 0.95, boxShadow: `0 0 0 2px ${C.cardBg}` }} />
            )}

            {months.map((m, i) => {
              const lp = pct(m)
              return lp > 0 && lp < 100 ? (
                <div key={`grid-${i}`} style={{ position: 'absolute', left: `calc(260px + ${lp}% * (100% - 260px) / 100)`, top: 0, bottom: 0, width: 1, background: '#D7E6F2', zIndex: 0 }} />
              ) : null
            })}

            {orderedFeatures.length === 0 ? (
              <div style={{ padding: '24px 0', color: C.textSecondary, fontSize: 13 }}>No features to display.</div>
            ) : orderedFeatures.map((f, i) => {
              const beforeDays = orderedFeatures.slice(0, i).reduce((sum, item) => sum + item._duration, 0)
              const leftPct = (beforeDays / totalPlannedDays) * 100
              const widthPct = (f._duration / totalPlannedDays) * 100
              const isOverdue = f.status !== 'Done' && overdue
              const statusCfg = statusColors[f.status] || statusColors['To Do']
              const progress = progressForStatus[f.status] ?? 20
              const startDate = new Date(start.getTime() + (beforeDays / totalPlannedDays) * totalMs)
              const endDate = new Date(start.getTime() + ((beforeDays + f._duration) / totalPlannedDays) * totalMs)

              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 260, flexShrink: 0, paddingRight: 4 }} title={f.name}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, lineHeight: 1.35, wordBreak: 'break-word' }}>{f.name}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, background: C.mainBg, border: `1px solid ${C.border}`, borderRadius: 999, padding: '2px 7px' }}>R{f.rank || 0}</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>
                      {f._duration}d · {startDate.toISOString().split('T')[0]} to {endDate.toISOString().split('T')[0]}
                    </div>
                  </div>

                  <div style={{ flex: 1, height: 34, background: '#F3F8FC', borderRadius: 10, position: 'relative', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                    <div style={{ position: 'absolute', inset: 0, background: isOverdue ? C.danger + '10' : statusCfg.track }} />
                    <div style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      top: 4,
                      bottom: 4,
                      background: `linear-gradient(135deg, ${statusCfg.fill}, ${statusCfg.fill}DD)`,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 10px',
                      boxShadow: '0 6px 16px rgba(27,88,134,0.14)',
                      minWidth: 70,
                    }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'rgba(255,255,255,0.28)', borderRadius: 6, position: 'absolute', left: 0, top: 0 }} />
                      <span style={{ position: 'relative', zIndex: 1, fontSize: 10, color: '#fff', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isOverdue ? 'Overdue' : f.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openEdit(f)}
                    style={{ flexShrink: 0, padding: '6px 10px', background: C.primary + '12', color: C.primary, border: `1px solid ${C.primary}25`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Edit
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', marginTop: 10 }}>
            <div style={{ width: 260, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: C.mainBg, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 11, color: C.textSecondary }}><strong style={{ color: C.textPrimary }}>Start:</strong> {project.startDate}</span>
              {hasTodayMarker && <span style={{ fontSize: 11, color: C.danger, fontWeight: 700 }}>Today</span>}
              <span style={{ fontSize: 11, color: overdue ? C.danger : C.textSecondary, fontWeight: overdue ? 700 : 500 }}>
                <strong style={{ color: overdue ? C.danger : C.textPrimary }}>End:</strong> {project.deadline}{overdue ? ' !' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {editItem && (
        <TimelineEditModal
          item={editItem}
          form={editForm}
          setForm={setEditForm}
          onClose={() => setEditItem(null)}
          onSave={saveEdit}
          C={C}
        />
      )}
    </div>
  )
}


// ---- PERT Tab ----
function PertCard({ children, style, C }) {
  return <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>
}
function PertModal({ title, onClose, children, C }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.cardBg, borderRadius: 14, padding: 28, width: 500, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', border: `1px solid ${C.border}`, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: C.textSecondary, lineHeight: 1, padding: 2 }}>x</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function buildPertLayout(tasks) {
  if (!tasks.length) return { nodes: [], edges: [], startEdges: [], endEdges: [], startNode: null, endNode: null, width: 0, height: 0, projectDuration: 0, criticalTaskIds: new Set() }

  const NODE_W = 170, NODE_H = 72, PAD_X = 240, PAD_Y = 100, CR = 26

  const idSet = new Set(tasks.map(t => t.id))
  const adj  = Object.fromEntries(tasks.map(t => [t.id, []]))
  const pred = Object.fromEntries(tasks.map(t => [t.id, []]))
  const inDeg = Object.fromEntries(tasks.map(t => [t.id, 0]))

  tasks.forEach(t => {
    ;(t.dependsOn || []).forEach(dep => {
      if (!idSet.has(dep)) return
      adj[dep].push(t.id)
      pred[t.id].push(dep)
      inDeg[t.id]++
    })
  })

  // Kahn topological sort
  const topoOrder = []
  const inDegCopy = { ...inDeg }
  const q = tasks.filter(t => inDegCopy[t.id] === 0).map(t => t.id)
  let qi = 0
  while (qi < q.length) {
    const cur = q[qi++]
    topoOrder.push(cur)
    adj[cur].forEach(nxt => { if (--inDegCopy[nxt] === 0) q.push(nxt) })
  }

  // Duration: story points as days, default 3
  const dur = Object.fromEntries(tasks.map(t => [t.id, Math.max(1, t.storyPoints || 3)]))

  // Forward pass — ES, EF
  const ES = {}, EF = {}
  topoOrder.forEach(id => {
    ES[id] = pred[id].length ? Math.max(...pred[id].map(p => EF[p])) : 0
    EF[id] = ES[id] + dur[id]
  })
  const projectDuration = topoOrder.length ? Math.max(...topoOrder.map(id => EF[id])) : 0

  // Backward pass — LF, LS
  const LF = {}, LS = {}
  ;[...topoOrder].reverse().forEach(id => {
    LF[id] = adj[id].length ? Math.min(...adj[id].map(s => LS[s])) : projectDuration
    LS[id] = LF[id] - dur[id]
  })

  // Float + critical path
  const float = Object.fromEntries(tasks.map(t => [t.id, Math.round((LS[t.id] - ES[t.id]) * 10) / 10]))
  const criticalTaskIds = new Set(tasks.filter(t => float[t.id] === 0).map(t => t.id))

  // Column levels via BFS
  const level = Object.fromEntries(tasks.map(t => [t.id, 0]))
  topoOrder.forEach(id => { adj[id].forEach(nxt => { level[nxt] = Math.max(level[nxt], level[id] + 1) }) })

  const byLevel = {}
  tasks.forEach(t => { const l = level[t.id] || 0; if (!byLevel[l]) byLevel[l] = []; byLevel[l].push(t) })
  const maxLevel = Math.max(...Object.keys(byLevel).map(Number), 0)

  // Node positions — column 0 reserved for Start
  const pos = {}
  Object.entries(byLevel).forEach(([lv, ts]) => {
    ts.forEach((t, i) => {
      pos[t.id] = { x: (Number(lv) + 1) * PAD_X + CR * 2 + 10, y: i * PAD_Y + 10 }
    })
  })

  const maxY = Math.max(...Object.values(pos).map(p => p.y + NODE_H), NODE_H + 10)
  const centerY = maxY / 2 - CR

  const startNode = { x: 10,                                               y: centerY, r: CR }
  const endNode   = { x: (maxLevel + 2) * PAD_X + CR * 2 + 10 + NODE_W,  y: centerY, r: CR }

  const nodes = tasks.map(t => ({
    ...t,
    x: pos[t.id]?.x || 0,
    y: pos[t.id]?.y || 0,
    w: NODE_W, h: NODE_H,
    es: ES[t.id], ef: EF[t.id],
    ls: LS[t.id], lf: LF[t.id],
    float: float[t.id],
    duration: dur[t.id],
    critical: criticalTaskIds.has(t.id),
  }))

  const edges = []
  tasks.forEach(t => {
    ;(t.dependsOn || []).forEach(dep => {
      if (!idSet.has(dep) || !pos[dep] || !pos[t.id]) return
      edges.push({
        x1: pos[dep].x + NODE_W, y1: pos[dep].y + NODE_H / 2,
        x2: pos[t.id].x,          y2: pos[t.id].y + NODE_H / 2,
        critical: criticalTaskIds.has(dep) && criticalTaskIds.has(t.id),
      })
    })
  })

  const rootIds = tasks.filter(t => pred[t.id].length === 0).map(t => t.id)
  const leafIds = tasks.filter(t => adj[t.id].length === 0).map(t => t.id)

  const startEdges = rootIds.map(id => ({
    x1: startNode.x + CR * 2, y1: startNode.y + CR,
    x2: pos[id]?.x || 0,      y2: (pos[id]?.y || 0) + NODE_H / 2,
    critical: criticalTaskIds.has(id),
  }))
  const endEdges = leafIds.map(id => ({
    x1: (pos[id]?.x || 0) + NODE_W, y1: (pos[id]?.y || 0) + NODE_H / 2,
    x2: endNode.x,                   y2: endNode.y + CR,
    critical: criticalTaskIds.has(id),
  }))

  const width  = endNode.x + CR * 2 + 20
  const height = Math.max(maxY + 30, CR * 2 + 60)

  return { nodes, edges, startEdges, endEdges, startNode, endNode, width, height, projectDuration, criticalTaskIds, float, dur }
}

function PertTab({ project }) {
  const C = useThemeColors()
  const { updateTask, chainTaskDependencies } = useProjects()
  const [selStoryId, setSelStoryId] = useState('')
  const [editTask, setEditTask]     = useState(null)
  const [depInput, setDepInput]     = useState([])

  const allTasks   = project.tasks || []
  const story      = project.features?.find(f => f.id === selStoryId)
  const storyTasks = selStoryId
    ? allTasks.filter(t => t.storyId === selStoryId || t.feature === story?.name)
    : allTasks

  function openDepEdit(task) { setEditTask(task); setDepInput(task.dependsOn || []) }
  async function saveDeps() {
    if (!editTask) return
    await updateTask(project.id, editTask.id, { dependsOn: depInput })
    setEditTask(null)
  }
  function toggleDep(taskId) {
    setDepInput(prev => prev.includes(taskId) ? prev.filter(d => d !== taskId) : [...prev, taskId])
  }

  async function chainVisibleTasks() {
    if (storyTasks.length < 2) return
    const ok = window.confirm(
      'This will chain the visible tasks in order and replace their current dependencies. Continue?'
    )
    if (!ok) return
    await chainTaskDependencies(storyTasks.map(t => t.id))
  }

  const { nodes, edges, startEdges, endEdges, startNode, endNode, width, height, projectDuration, criticalTaskIds, float, dur } = buildPertLayout(storyTasks)

  const CRIT_COLOR  = '#D97706'   // amber — critical path
  const CRIT_BG     = '#FEF3C7'
  const CRIT_BORDER = '#F59E0B'
  const NORM_COLOR  = C.primary
  const NORM_BG     = C.primary + '12'
  const DONE_COLOR  = C.success
  const DONE_BG     = C.success + '12'

  function nodeStyle(n) {
    if (n.status === 'Done')        return { fill: DONE_BG,  stroke: DONE_COLOR,  text: DONE_COLOR  }
    if (n.critical)                 return { fill: CRIT_BG,  stroke: CRIT_BORDER, text: CRIT_COLOR  }
    return                                 { fill: NORM_BG,  stroke: NORM_COLOR,  text: NORM_COLOR  }
  }

  const criticalNames = nodes.filter(n => n.critical).map(n => n.name)
  const hasDeps = edges.length > 0

  return (
    <div>
      {/* Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textSecondary, marginBottom: 4 }}>Filter by Story</label>
          <select value={selStoryId} onChange={e => setSelStoryId(e.target.value)}
            style={{ padding: '8px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit', minWidth: 240 }}>
            <option value="">All tasks</option>
            {(project.features || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <button
          onClick={chainVisibleTasks}
          disabled={storyTasks.length < 2}
          style={{
            padding: '9px 14px',
            background: storyTasks.length < 2 ? C.border : C.primary,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: storyTasks.length < 2 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            opacity: storyTasks.length < 2 ? 0.65 : 1,
          }}>
          Chain tasks in order
        </button>
        <div style={{ fontSize: 11, color: C.textSecondary, maxWidth: 360, lineHeight: 1.45 }}>
          Use this when the tasks should happen one after another instead of in parallel.
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Total Tasks',       v: storyTasks.length,              c: C.primary     },
          { l: 'Project Duration',  v: `${projectDuration} days`,      c: CRIT_COLOR    },
          { l: 'Critical Tasks',    v: criticalTaskIds.size,           c: CRIT_COLOR    },
          { l: 'With Dependencies', v: storyTasks.filter(t => (t.dependsOn || []).length > 0).length, c: C.warning },
        ].map(m => (
          <div key={m.l} style={{ padding: '12px 16px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: m.c }}>{m.v}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* Critical path callout */}
      {hasDeps && criticalNames.length > 0 && (
        <div style={{ background: CRIT_BG, border: `1px solid ${CRIT_BORDER}`, borderLeft: `4px solid ${CRIT_COLOR}`, borderRadius: 8, padding: '10px 16px', marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: CRIT_COLOR, marginBottom: 4 }}>Critical Path — {projectDuration} days total</div>
          <div style={{ fontSize: 12, color: '#78350F' }}>{criticalNames.join(' → ')}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Dependency list */}
        <PertCard C={C}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 14, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>Task Dependencies</div>
          {storyTasks.length === 0
            ? <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No tasks found.</p>
            : storyTasks.map(t => {
                const deps = (t.dependsOn || []).map(d => allTasks.find(tk => tk.id === d)?.name || d)
                const isCrit = criticalTaskIds.has(t.id)
                const floatVal = float?.[t.id] ?? '—'
                const duration = dur?.[t.id] ?? (t.storyPoints || 3)
                return (
                  <div key={t.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isCrit ? CRIT_COLOR : C.textPrimary }}>{t.name}</span>
                          {isCrit && <span style={{ fontSize: 9, fontWeight: 700, background: CRIT_BG, color: CRIT_COLOR, padding: '1px 6px', borderRadius: 3, border: `1px solid ${CRIT_BORDER}` }}>CRITICAL</span>}
                        </div>
                        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>
                          {duration}d duration · Float: {floatVal}d
                        </div>
                        {deps.length > 0 && (
                          <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>
                            After: {deps.map((d, i) => <span key={i} style={{ background: C.warning + '18', color: C.warning, padding: '1px 5px', borderRadius: 3, marginRight: 3, fontWeight: 600 }}>{d}</span>)}
                          </div>
                        )}
                      </div>
                      <button onClick={() => openDepEdit(t)}
                        style={{ padding: '3px 10px', background: C.primary + '12', color: C.primary, border: `1px solid ${C.primary}25`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                        Edit
                      </button>
                    </div>
                  </div>
                )
              })
          }
        </PertCard>

        {/* PERT SVG diagram */}
        <PertCard C={C} style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 6, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>PERT Network Diagram</div>
          <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 14 }}>
            Node duration = story points (days). {hasDeps ? 'Orange = critical path (zero float).' : 'Set dependencies using Edit to draw arrows.'}
          </div>

          {storyTasks.length === 0
            ? <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No tasks to display.</p>
            : <svg width={width} height={Math.max(height, 120)} style={{ display: 'block', minWidth: 400, overflow: 'visible' }}>
                <defs>
                  <marker id="arrow-norm" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill={NORM_COLOR} />
                  </marker>
                  <marker id="arrow-crit" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill={CRIT_COLOR} />
                  </marker>
                  <marker id="arrow-done" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill={DONE_COLOR} />
                  </marker>
                </defs>

                {/* Start node */}
                {startNode && (
                  <g>
                    <circle cx={startNode.x + startNode.r} cy={startNode.y + startNode.r} r={startNode.r} fill={C.success} />
                    <text x={startNode.x + startNode.r} y={startNode.y + startNode.r + 4} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">START</text>
                  </g>
                )}

                {/* End node */}
                {endNode && (
                  <g>
                    <circle cx={endNode.x + endNode.r} cy={endNode.y + endNode.r} r={endNode.r} fill={C.success} />
                    <text x={endNode.x + endNode.r} y={endNode.y + endNode.r + 4} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">END</text>
                  </g>
                )}

                {/* Start edges */}
                {startEdges.map((e, i) => {
                  const color = e.critical ? CRIT_COLOR : NORM_COLOR
                  const mx = (e.x1 + e.x2) / 2
                  return <path key={`se${i}`} d={`M${e.x1},${e.y1} L${e.x2},${e.y2}`}
                    fill="none" stroke={color} strokeWidth={e.critical ? 2 : 1.5}
                    markerEnd={e.critical ? 'url(#arrow-crit)' : 'url(#arrow-norm)'} opacity={0.8} />
                })}

                {/* End edges */}
                {endEdges.map((e, i) => {
                  const color = e.critical ? CRIT_COLOR : NORM_COLOR
                  const mx = (e.x1 + e.x2) / 2
                  return <path key={`ee${i}`} d={`M${e.x1},${e.y1} L${e.x2},${e.y2}`}
                    fill="none" stroke={color} strokeWidth={e.critical ? 2 : 1.5}
                    markerEnd={e.critical ? 'url(#arrow-crit)' : 'url(#arrow-norm)'} opacity={0.8} />
                })}

                {/* Task-to-task edges */}
                {edges.map((e, i) => {
                  const color = e.critical ? CRIT_COLOR : NORM_COLOR
                  const mx = (e.x1 + e.x2) / 2
                  return <path key={`e${i}`} d={`M${e.x1},${e.y1} L${e.x2},${e.y2}`}
                    fill="none" stroke={color} strokeWidth={e.critical ? 2.5 : 1.5}
                    markerEnd={e.critical ? 'url(#arrow-crit)' : 'url(#arrow-norm)'} opacity={0.85} />
                })}

                {/* Task nodes */}
                {nodes.map(n => {
                  const ns = nodeStyle(n)
                  const label = n.name.length > 24 ? n.name.slice(0, 22) + '…' : n.name
                  return (
                    <g key={n.id}>
                      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8}
                        fill={ns.fill} stroke={ns.stroke} strokeWidth={n.critical ? 2.5 : 1.5}
                        style={{ filter: n.critical ? `drop-shadow(0 2px 6px ${CRIT_COLOR}40)` : 'none' }} />
                      {/* Top divider line */}
                      <line x1={n.x} y1={n.y + n.h - 22} x2={n.x + n.w} y2={n.y + n.h - 22} stroke={ns.stroke} strokeWidth={0.8} opacity={0.4} />
                      {/* Task name */}
                      <foreignObject x={n.x + 7} y={n.y + 5} width={n.w - 14} height={n.h - 28}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: ns.text, lineHeight: 1.35, wordBreak: 'break-word', overflow: 'hidden' }}>{label}</div>
                      </foreignObject>
                      {/* Bottom bar: duration + status */}
                      <text x={n.x + 7} y={n.y + n.h - 7} fontSize={9} fontWeight={600} fill={ns.text} opacity={0.85}>
                        {n.duration}d
                      </text>
                      <text x={n.x + n.w - 7} y={n.y + n.h - 7} fontSize={9} fontWeight={600} fill={ns.text} opacity={0.85} textAnchor="end">
                        {n.status === 'Done' ? 'Done' : n.status === 'In Progress' ? 'Active' : `Float:${n.float}d`}
                      </text>
                    </g>
                  )
                })}
              </svg>
          }

          {/* Legend */}
          <div style={{ display: 'flex', gap: 18, marginTop: 16, flexWrap: 'wrap', paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            {[
              { fill: NORM_BG,  stroke: NORM_COLOR,  label: 'Normal task'    },
              { fill: CRIT_BG,  stroke: CRIT_BORDER, label: 'Critical path'  },
              { fill: DONE_BG,  stroke: DONE_COLOR,  label: 'Done'           },
            ].map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textSecondary }}>
                <span style={{ width: 24, height: 12, borderRadius: 3, background: l.fill, border: `2px solid ${l.stroke}`, display: 'inline-block' }} />
                {l.label}
              </span>
            ))}
            <span style={{ fontSize: 11, color: C.textSecondary }}>· Duration = story points (days) · Float = slack time available</span>
          </div>
        </PertCard>
      </div>

      {/* Edit dependencies modal */}
      {editTask && (
        <PertModal title={`Set Dependencies — ${editTask.name}`} onClose={() => setEditTask(null)} C={C}>
          <p style={{ margin: '0 0 14px', fontSize: 13, color: C.textSecondary }}>Select tasks that must finish before this one can start.</p>
          {allTasks.filter(t => t.id !== editTask.id).length === 0
            ? <p style={{ color: C.textSecondary, fontSize: 13 }}>No other tasks in this project.</p>
            : allTasks.filter(t => t.id !== editTask.id).map(t => {
                const checked = depInput.includes(t.id)
                const isCrit = criticalTaskIds.has(t.id)
                return (
                  <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${C.border}`, cursor: 'pointer' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleDep(t.id)} style={{ width: 14, height: 14, accentColor: C.primary, cursor: 'pointer' }} />
                    <span style={{ flex: 1, fontSize: 13, color: isCrit ? CRIT_COLOR : C.textPrimary, fontWeight: isCrit ? 600 : 400 }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: C.textSecondary }}>{dur?.[t.id] ?? (t.storyPoints || 3)}d</span>
                  </label>
                )
              })
          }
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button onClick={() => setEditTask(null)} style={{ padding: '8px 18px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={saveDeps} style={{ padding: '8px 18px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save Dependencies</button>
          </div>
        </PertModal>
      )}
    </div>
  )
}

// ---- Q14: Change Requests Tab ----
const CR_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Rejected']
const CR_IMPACTS  = ['Scope', 'Schedule', 'Budget', 'Scope + Schedule', 'Scope + Budget', 'All Three']

function ChangeRequestsTab({ projectId }) {
  const C = useThemeColors()
  const storageKey = `aspm_cr_${projectId}`
  const [crs, setCrs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] }
  })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', impact: 'Scope', status: 'Submitted' })

  function saveAll(updated) {
    setCrs(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  function submitCR() {
    if (!form.title.trim()) return
    const cr = {
      id: 'cr' + Date.now(),
      number: crs.length + 1,
      title: form.title.trim(),
      description: form.description.trim(),
      impact: form.impact,
      status: 'Submitted',
      date: new Date().toISOString().split('T')[0],
    }
    saveAll([...crs, cr])
    setForm({ title: '', description: '', impact: 'Scope', status: 'Submitted' })
    setShowModal(false)
  }

  function updateStatus(id, status) {
    saveAll(crs.map(c => c.id === id ? { ...c, status } : c))
  }

  const statusColor = { Submitted: C.primary, 'Under Review': C.warning, Approved: C.success, Rejected: C.danger }
  const inp = { width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Change Requests ({crs.length})</h4>
        <button onClick={() => setShowModal(true)}
          style={{ padding: '6px 14px', background: C.warning + '15', color: C.warning, border: `1px solid ${C.warning}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          + New CR
        </button>
      </div>

      {crs.length === 0 ? (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: C.textSecondary }}>No change requests yet. Use CRs to formally track scope, schedule, or budget changes for audit and impact analysis.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {crs.map(cr => (
            <div key={cr.id} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.textSecondary }}>CR-{String(cr.number).padStart(3, '0')}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{cr.title}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#e2e8f015', color: C.textSecondary, border: `1px solid ${C.border}` }}>{cr.impact}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: (statusColor[cr.status] || C.primary) + '15', color: statusColor[cr.status] || C.primary }}>{cr.status}</span>
                </div>
              </div>
              {cr.description && <p style={{ margin: '0 0 10px', fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}>{cr.description}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: C.textSecondary }}>Submitted: {cr.date}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {CR_STATUSES.filter(s => s !== cr.status).map(s => (
                    <button key={s} onClick={() => updateStatus(cr.id, s)}
                      style={{ padding: '3px 10px', border: `1px solid ${(statusColor[s] || C.border)}30`, borderRadius: 5, background: (statusColor[s] || C.border) + '10', color: statusColor[s] || C.textSecondary, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      â†’ {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.cardBg, borderRadius: 14, padding: 28, width: 480, boxShadow: '0 12px 40px rgba(0,0,0,0.18)', border: `1px solid ${C.border}` }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: C.textPrimary }}>New Change Request</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: C.textSecondary }}>Formally document a requested change for tracking, approval, and impact analysis.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>CR Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Add SSO authentication module" style={inp} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Description & Justification</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Why is this change needed? What are the business / technical drivers?"
                style={{ ...inp, minHeight: 72, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Impact Area</label>
              <select value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))} style={inp}>
                {CR_IMPACTS.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 18px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.cardBg, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={submitCR} style={{ padding: '8px 20px', background: C.warning, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Submit CR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Main Component ----
export default function ProjectDetail() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addComment, addTask, updateTaskStatus } = useProjects()
  const { profile } = useAuth()
  const isPM = ['pm', 'project_manager', 'admin'].includes(profile?.role)
  const project = getProject(id)
  const [tab, setTab] = useState('Overview')

  if (!project) {
    return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>
  }

  const tabs = ['Overview', 'Estimation', 'Risks', 'Team', 'Activity', 'Tasks', 'Timeline', 'PERT', 'Change Requests']
  const doneFeat = project.features.filter(f => f.status === 'Done').length
  const durationDays = Math.ceil((new Date(project.deadline) - new Date(project.startDate)) / 86400000)
  const budgetLabel = project.budget > 0 ? `$${Number(project.budget).toLocaleString()}` : 'Not set'
  const budgetSub = project.budget > 0 ? 'Allocated budget' : 'Needs project update'

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 14, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 2px', fontFamily: 'inherit', fontWeight: 600 }}>
        ← Back to Projects
      </button>

      <div style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5FBFF 100%)', border: `1px solid ${C.border}`, borderRadius: 18, padding: '24px 26px', marginBottom: 22, boxShadow: '0 18px 36px rgba(7, 42, 74, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: '1 1 520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.1, fontWeight: 800, color: C.textPrimary }}>{project.name}</h1>
              <StatusBadge status={project.status} />
              <span style={{ padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: C.primary + '14', color: C.primary }}>{project.domain}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: C.textSecondary, flexWrap: 'wrap' }}>
              <span style={{ display:'flex', alignItems:'center', gap:6, padding: '8px 12px', background: '#F6FAFD', borderRadius: 999, border: `1px solid ${C.border}` }}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {project.startDate} - {project.deadline}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:6, padding: '8px 12px', background: '#F6FAFD', borderRadius: 999, border: `1px solid ${C.border}` }}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                {project.teamSize} members
              </span>
            </div>
          </div>
          {isPM && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button onClick={() => navigate(`/dashboard/projects/${id}/risks`)}
                style={{ padding: '10px 15px', background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit', fontWeight: 700 }}>
                + Add Risk
              </button>
              <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)}
                style={{ padding: '10px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 12px 24px rgba(0,58,107,0.18)' }}>
                Run Estimation
              </button>
              <button onClick={() => navigate(`/dashboard/projects/${id}/edit`)}
                style={{ padding: '10px 15px', background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit', fontWeight: 700 }}>
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16, marginBottom: 22 }}>
        <MetricCard label="Total Features" value={project.features.length} sub={`${doneFeat} done`} icon="features" />
        <MetricCard label="Estimation Runs" value={project.estimations.length} sub={project.estimations.length > 0 ? `Latest: ${project.estimations[project.estimations.length - 1].technique}` : 'None yet'} icon="chart" color="#0891b2" />
        <MetricCard label="Total Risks" value={project.risks.length} sub={`${project.risks.filter(r => r.priority === 'High').length} High priority`} icon="shield" color={C.danger} />
        <MetricCard label="Duration" value={`${durationDays}d`} sub={`${project.startDate} - ${project.deadline}`} icon="calendar" color={C.success} />
        <MetricCard label="Budget" value={budgetLabel} sub={budgetSub} icon="dollar" color={project.budget > 0 ? '#059669' : '#B7791F'} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 16px', border: `1px solid ${tab === t ? C.primary + '30' : C.border}`, background: tab === t ? C.primary + '12' : C.cardBg, cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? C.primary : C.textSecondary, borderRadius: 999, fontFamily: 'inherit', boxShadow: tab === t ? '0 8px 18px rgba(0,58,107,0.10)' : 'none' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab project={project} />}
      {tab === 'Estimation' && <EstimationTab project={project} onRunEstimation={() => navigate(`/dashboard/projects/${id}/estimate`)} onViewComparison={() => navigate(`/dashboard/projects/${id}/estimations`)} />}
      {tab === 'Risks' && <RisksTab project={project} onManageRisks={() => navigate(`/dashboard/projects/${id}/risks`)} />}
      {tab === 'Team' && <TeamTab project={project} />}
      {tab === 'Activity' && <ActivityTab project={project} onAddComment={comment => addComment(id, comment)} />}
      {tab === 'Tasks' && <TasksBoardTab project={project} onAddTask={task => addTask(id, task)} onMoveTask={(taskId, status) => updateTaskStatus(id, taskId, status)} />}
      {tab === 'Timeline' && <TimelineTab project={project} />}
      {tab === 'PERT' && <PertTab project={project} />}
      {tab === 'Change Requests' && <ChangeRequestsTab projectId={id} />}
    </div>
  )
}
