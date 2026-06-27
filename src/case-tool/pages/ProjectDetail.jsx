import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

function StatusBadge({ status }) {
  const C = useThemeColors()
  const cfg = {
    Planning:  { bg: C.warning + '20',  color: C.warning  },
    Active:    { bg: C.primary + '15',  color: C.primary  },
    Completed: { bg: C.success + '15',  color: C.success  },
    'On Hold': { bg: C.border,          color: C.textSecondary },
  }[status] || { bg: C.border, color: C.textSecondary }
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{status}</span>
}

function PriorityBadge({ priority }) {
  const C = useThemeColors()
  const cfg = {
    'Must Have':    { bg: C.danger + '15',   color: C.danger },
    'Should Have':  { bg: C.warning + '20',  color: C.warning },
    'Could Have':   { bg: C.success + '15',  color: C.success },
    "Won't Have":   { bg: C.border,          color: C.textSecondary },
    High:   { bg: C.danger + '15',  color: C.danger },
    Medium: { bg: C.warning + '20', color: C.warning },
    Low:    { bg: C.success + '15', color: C.success },
  }[priority] || {}
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{priority}</span>
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
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, borderLeft: `3px solid ${clr}` }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: clr + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {svgFn ? svgFn(clr) : <span style={{ fontSize: 18, color: clr }}>{icon}</span>}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: clr, marginTop: 2, fontWeight: 500 }}>{sub}</div>}
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
            {project.features.map((f, i) => (
              <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                <td style={{ padding: '10px 12px', color: C.textSecondary }}>{i + 1}</td>
                <td style={{ padding: '10px 12px', fontWeight: 500, color: C.textPrimary }}>{f.name}</td>
                <td style={{ padding: '10px 12px', color: C.textSecondary }}>{f.description}</td>
                <td style={{ padding: '10px 12px' }}><PriorityBadge priority={f.priority} /></td>
                <td style={{ padding: '10px 12px', color: C.textSecondary, fontSize: 12, maxWidth: 180 }}>
                  {f.acceptanceCriteria || <span style={{ color: C.border }}>—</span>}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: statusColor[f.status] || C.textSecondary }}>{f.status}</span>
                </td>
              </tr>
            ))}
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
            {actuals ? '✓ Actuals Recorded' : '+ Enter Actuals'}
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
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Actual vs Estimated — Accuracy Report</h4>
            <span style={{ fontSize: 11, color: C.textSecondary, marginLeft: 'auto' }}>Completed: {actuals.completedDate}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Actual Effort', value: `${actuals.effortNum} staff months`, icon: '◷' },
              { label: 'Actual Cost', value: `$${Number(actuals.costNum).toLocaleString()}`, icon: '$' },
              { label: 'Actual Duration', value: `${actuals.durationNum} months`, icon: '▣' },
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
                const varText = v => v === null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`
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
            <p style={{ margin: '0 0 20px', fontSize: 13, color: C.textSecondary }}>Record what the project actually took — used for estimation accuracy reports.</p>
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
  const [mentionQuery, setMentionQuery] = useState('')
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
              {item.itemType === 'comment' ? (item.author || 'Y')[0] : '⚙'}
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
                          → {nextCol}
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

// ---- Enhanced Timeline / Gantt Tab ----
function TimelineTab({ project }) {
  const C = useThemeColors()
  const today = new Date()
  const start = new Date(project.startDate)
  const end = new Date(project.deadline)
  const totalMs = Math.max(end - start, 1)
  const statusColors = { Done: C.success, 'In Progress': C.primary, 'To Do': C.border }
  const overdue = today > end

  // Build month labels
  const months = []
  const cur = new Date(start.getFullYear(), start.getMonth(), 1)
  const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 1)
  while (cur < endMonth) {
    months.push(new Date(cur))
    cur.setMonth(cur.getMonth() + 1)
  }

  function pct(d) {
    return Math.min(100, Math.max(0, ((new Date(d) - start) / totalMs) * 100))
  }

  const todayPct = pct(today)

  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Gantt Chart — Feature Timeline</h4>
        <div style={{ display: 'flex', gap: 14 }}>
          {[['Done', C.success], ['In Progress', C.primary], ['To Do', C.border], ['Today', C.danger]].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: label === 'Today' ? 2 : 10, height: label === 'Today' ? 14 : 10, borderRadius: label === 'Today' ? 1 : 2, background: color }} />
              <span style={{ fontSize: 11, color: C.textSecondary }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 640 }}>
          {/* Month header */}
          <div style={{ display: 'flex', marginBottom: 6 }}>
            <div style={{ width: 160, flexShrink: 0 }} />
            <div style={{ flex: 1, position: 'relative', height: 20 }}>
              {months.map((m, i) => {
                const left = pct(m)
                return (
                  <div key={i} style={{ position: 'absolute', left: `${left}%`, fontSize: 10, color: C.textSecondary, fontWeight: 500, whiteSpace: 'nowrap', transform: 'translateX(-50%)' }}>
                    {m.toLocaleDateString('en', { month: 'short', year: i === 0 || m.getMonth() === 0 ? '2-digit' : undefined })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Grid lines + feature rows */}
          <div style={{ position: 'relative' }}>
            {/* Today marker */}
            {today >= start && today <= end && (
              <div style={{ position: 'absolute', left: `calc(160px + ${todayPct}% * (100% - 160px) / 100)`, top: 0, bottom: 0, width: 2, background: C.danger, zIndex: 3, opacity: 0.85 }} />
            )}

            {project.features.map((f, i) => {
              const segCount = project.features.length
              const segDuration = totalMs / segCount
              const segStart = start.getTime() + i * segDuration
              const segEnd = segStart + segDuration
              const leftPct = ((segStart - start.getTime()) / totalMs) * 100
              const widthPct = (segDuration / totalMs) * 100
              const isOverdue = f.status !== 'Done' && overdue
              const barColor = isOverdue ? C.danger : (statusColors[f.status] || C.border)

              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 0 }}>
                  <div style={{ width: 160, fontSize: 12, color: C.textPrimary, flexShrink: 0, paddingRight: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.name}>
                    {f.name}
                  </div>
                  <div style={{ flex: 1, height: 26, background: C.mainBg, borderRadius: 4, position: 'relative', overflow: 'visible' }}>
                    {/* Month grid lines */}
                    {months.map((m, mi) => {
                      const lp = pct(m)
                      return lp > 0 && lp < 100 ? (
                        <div key={mi} style={{ position: 'absolute', left: `${lp}%`, top: 0, bottom: 0, width: 1, background: C.border, opacity: 0.5 }} />
                      ) : null
                    })}
                    <div style={{
                      position: 'absolute',
                      left: `${leftPct}%`, width: `${widthPct}%`,
                      height: '100%', background: barColor,
                      borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 8,
                      transition: 'background 0.2s',
                    }}>
                      <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isOverdue ? '! Overdue' : f.status}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Date labels */}
          <div style={{ display: 'flex', marginTop: 4 }}>
            <div style={{ width: 160, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: C.textSecondary }}>{project.startDate}</span>
              {today >= start && today <= end && (
                <span style={{ fontSize: 10, color: C.danger, fontWeight: 600 }}>Today</span>
              )}
              <span style={{ fontSize: 10, color: overdue ? C.danger : C.textSecondary, fontWeight: overdue ? 600 : 400 }}>{project.deadline}{overdue ? ' !' : ''}</span>
            </div>
          </div>
        </div>
      </div>
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

  const tabs = ['Overview', 'Estimation', 'Risks', 'Team', 'Activity', 'Tasks', 'Timeline']
  const doneFeat = project.features.filter(f => f.status === 'Done').length
  const durationDays = Math.ceil((new Date(project.deadline) - new Date(project.startDate)) / 86400000)

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: 'inherit' }}>
        ← Back to Projects
      </button>

      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>{project.name}</h1>
              <StatusBadge status={project.status} />
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: C.primary + '18', color: C.primary }}>{project.domain}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: C.textSecondary }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {project.startDate} → {project.deadline}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                {project.teamSize} members
              </span>
            </div>
          </div>
          {isPM && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate(`/dashboard/projects/${id}/risks`)}
                style={{ padding: '8px 14px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>
                + Add Risk
              </button>
              <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)}
                style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Run Estimation
              </button>
              <button onClick={() => navigate(`/dashboard/projects/${id}/edit`)}
                style={{ padding: '8px 14px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20 }}>
        <MetricCard label="Total Features" value={project.features.length} sub={`${doneFeat} done`} icon="features" />
        <MetricCard label="Estimation Runs" value={project.estimations.length} sub={project.estimations.length > 0 ? `Latest: ${project.estimations[project.estimations.length - 1].technique}` : 'None yet'} icon="chart" color="#0891b2" />
        <MetricCard label="Total Risks" value={project.risks.length} sub={`${project.risks.filter(r => r.priority === 'High').length} High priority`} icon="shield" color={C.danger} />
        <MetricCard label="Duration" value={`${durationDays}d`} sub={`${project.startDate} – ${project.deadline}`} icon="calendar" color={C.success} />
        <MetricCard label="Budget" value={project.budget > 0 ? `$${Number(project.budget).toLocaleString()}` : 'Not set'} sub={project.budget > 0 ? 'Allocated budget' : 'Edit project to set'} icon="dollar" color="#059669" />
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${C.border}`, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? C.primary : C.textSecondary, borderBottom: tab === t ? `2px solid ${C.primary}` : '2px solid transparent', marginBottom: -2, fontFamily: 'inherit' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab project={project} />}
      {tab === 'Estimation' && <EstimationTab project={project} onRunEstimation={() => navigate(`/dashboard/projects/${id}/estimate`)} onViewComparison={() => navigate(`/dashboard/projects/${id}/estimations`)} />}
      {tab === 'Risks' && <RisksTab project={project} onManageRisks={() => navigate(`/dashboard/projects/${id}/risks`)} />}
      {tab === 'Team' && <TeamTab project={project} />}
      {tab === 'Activity' && <ActivityTab project={project} onAddComment={comment => addComment(id, comment)} />}
      {tab === 'Tasks' && <TasksTab project={project} onAddTask={task => addTask(id, task)} onMoveTask={(taskId, status) => updateTaskStatus(id, taskId, status)} />}
      {tab === 'Timeline' && <TimelineTab project={project} />}
    </div>
  )
}
