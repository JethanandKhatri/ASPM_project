import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['Product Size', 'Business Impact', 'Customer', 'Process', 'Technology', 'Staff/People', 'Schedule']

function RiskRow({ risk, onUpdate, onDelete, isPM }) {
  const C = useThemeColors()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...risk })
  const [showResolveNote, setShowResolveNote] = useState(false)
  const [resolveNote, setResolveNote] = useState('')

  function confirmResolve() {
    const stamp = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const note = resolveNote.trim()
      ? `[Resolved ${stamp}: ${resolveNote.trim()}]`
      : `[Resolved ${stamp}]`
    onUpdate(risk.id, {
      status: 'Resolved',
      monitoring: risk.monitoring ? risk.monitoring + '\n' + note : note,
    })
    setShowResolveNote(false)
    setResolveNote('')
  }
  const PRIORITIES = { High: { bg: C.danger + '15', color: C.danger }, Medium: { bg: C.warning + '18', color: C.warning }, Low: { bg: C.success + '15', color: C.success } }
  const STATUS_COLORS = { Open: C.textSecondary, 'In Progress': C.warning, Resolved: C.success }

  function saveEdit() {
    onUpdate(risk.id, form)
    setEditing(false)
  }

  const pri = PRIORITIES[risk.priority] || {}
  const inp = { width: '100%', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, outline: 'none', boxSizing: 'border-box', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit' }

  return (
    <>
      <tr onClick={() => setExpanded(e => !e)} style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: expanded ? C.primary + '08' : 'inherit' }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = C.mainBg }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'inherit' }}>
        <td style={{ padding: '11px 14px', color: C.textPrimary, fontSize: 13, maxWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: C.textSecondary, fontSize: 11 }}>{expanded ? '▼' : '▶'}</span>
            {risk.description}
          </div>
        </td>
        <td style={{ padding: '11px 14px', fontSize: 12, color: C.textSecondary }}>{risk.category}</td>
        <td style={{ padding: '11px 14px', fontSize: 13, color: C.textPrimary, textAlign: 'center' }}>{risk.probability}%</td>
        <td style={{ padding: '11px 14px', fontSize: 13, color: C.textPrimary, textAlign: 'center' }}>{risk.impact}</td>
        <td style={{ padding: '11px 14px', fontSize: 13, color: C.textPrimary, textAlign: 'right' }}>${risk.costImpact.toLocaleString()}</td>
        <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, textAlign: 'right', color: pri.color }}>${risk.riskExposure.toLocaleString()}</td>
        <td style={{ padding: '11px 14px' }}>
          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: pri.bg, color: pri.color }}>{risk.priority}</span>
        </td>
        <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 600, color: STATUS_COLORS[risk.status] }}>{risk.status}</td>
      </tr>
      {expanded && (
        <tr style={{ background: C.primary + '05', borderBottom: `1px solid ${C.border}` }}>
          <td colSpan={8} style={{ padding: '16px 20px' }}>
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>Description</label>
                  <textarea style={{ ...inp, minHeight: 60, resize: 'none' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>Category</label>
                  <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['Probability (%)', 'probability', 0, 100], ['Impact (1-5)', 'impact', 1, 5], ['Cost Impact ($)', 'costImpact', 0, null]].map(([label, key, min, max]) => (
                    <div key={key}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>{label}</label>
                      <input type="number" min={min} max={max || undefined} style={inp} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>Status</label>
                    <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {['Open', 'In Progress', 'Resolved'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {[['Mitigation Plan', 'mitigation'], ['Monitoring Plan', 'monitoring'], ['Contingency & Escalation Plan', 'management']].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>{label}</label>
                    <textarea style={{ ...inp, minHeight: 60, resize: 'none' }} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={`Enter ${label.toLowerCase()}...`} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button onClick={() => setEditing(false)} style={{ padding: '6px 14px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.cardBg, fontSize: 12, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
                  <button onClick={saveEdit} style={{ padding: '6px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
                  {[['Mitigation Plan', risk.mitigation], ['Monitoring Plan', risk.monitoring], ['Contingency & Escalation Plan', risk.management]].map(([label, val]) => (
                    <div key={label} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                      <p style={{ margin: 0, fontSize: 12, color: val ? C.textPrimary : C.textSecondary, fontStyle: val ? 'normal' : 'italic', lineHeight: 1.5 }}>{val || 'Not defined yet.'}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {isPM && (
                    <button onClick={() => { setEditing(true); setExpanded(true) }} style={{ padding: '5px 12px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Edit RMMM</button>
                  )}
                  {isPM && risk.status === 'Resolved' && (
                    <button onClick={() => onUpdate(risk.id, { status: 'Open' })}
                      style={{ padding: '5px 12px', background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Reopen
                    </button>
                  )}
                  {isPM && risk.status !== 'Resolved' && (
                    <button onClick={() => setShowResolveNote(v => !v)}
                      style={{ padding: '5px 12px', background: C.success + '12', color: C.success, border: `1px solid ${C.success}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Mark Resolved
                    </button>
                  )}
                  {isPM && (
                    <button onClick={() => onDelete(risk.id)} style={{ padding: '5px 12px', background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                  )}
                </div>
                {/* Q7: Resolution evidence note */}
                {showResolveNote && (
                  <div style={{ marginTop: 12, background: C.success + '08', border: `1px solid ${C.success}30`, borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>Resolution Evidence — what action was taken to close this risk?</div>
                    <textarea value={resolveNote} onChange={e => setResolveNote(e.target.value)}
                      placeholder="e.g. Migrated to PostgreSQL 15 with encryption at rest — verified by InfoSec team on 15 Jun 2026"
                      style={{ ...inp, minHeight: 56, resize: 'none', display: 'block', width: '100%' }} />
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                      <button onClick={() => { setShowResolveNote(false); setResolveNote('') }} style={{ padding: '5px 13px', border: `1px solid ${C.border}`, borderRadius: 5, background: C.cardBg, fontSize: 12, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
                      <button onClick={confirmResolve} style={{ padding: '5px 14px', background: C.success, color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Confirm Resolved</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ---- Risk Sheet (Pressman RMMM format) ----
const IMPACT_NARRATIVE = {
  1: 'Negligible effect on project — can be absorbed within existing schedule and budget.',
  2: 'Minor delays or cost overrun likely; recoverable without major rework.',
  3: 'Moderate delays and rework required; schedule and budget adjustment needed.',
  4: 'Project completion will be delayed; significant budget and resource impact expected.',
  5: 'Critical — project failure risk if not mitigated; immediate escalation required.',
}

function RiskSheet({ risks, project }) {
  const C = useThemeColors()
  if (risks.length === 0) return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 48, textAlign: 'center', color: C.textSecondary }}>
      No risks logged yet.
    </div>
  )

  const PRI_COLOR = { High: C.danger, Medium: C.warning, Low: C.success }
  const STATUS_COLOR = { Open: C.danger, 'In Progress': C.warning, Resolved: C.success }

  const field = (label, value, mono = false) => (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 190, flexShrink: 0, padding: '9px 14px', fontSize: 12, fontWeight: 700, color: C.textSecondary, background: C.mainBg, borderRight: `1px solid ${C.border}` }}>
        {label}
      </div>
      <div style={{ flex: 1, padding: '9px 14px', fontSize: 12, color: C.textPrimary, lineHeight: 1.55, fontFamily: mono ? 'monospace' : 'inherit' }}>
        {value || <span style={{ color: C.border, fontStyle: 'italic' }}>Not defined</span>}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {risks.map((r, idx) => {
        const priColor = PRI_COLOR[r.priority] || C.textSecondary
        return (
          <div key={r.id} style={{ background: C.cardBg, border: `2px solid ${priColor}40`, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

            {/* Sheet header */}
            <div style={{ background: `linear-gradient(135deg, ${priColor}18, ${priColor}08)`, borderBottom: `1px solid ${priColor}30`, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: priColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3L2 20h20L12 3z" stroke={priColor} strokeWidth="2" strokeLinejoin="round"/>
                    <line x1="12" y1="10" x2="12" y2="14" stroke={priColor} strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="17" r="0.8" fill={priColor}/>
                  </svg>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>
                  Risk Sheet #{String(idx + 1).padStart(2, '0')} — {project.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: priColor + '18', color: priColor, border: `1px solid ${priColor}30` }}>{r.priority} Priority</span>
                <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: (STATUS_COLOR[r.status] || C.textSecondary) + '15', color: STATUS_COLOR[r.status] || C.textSecondary, border: `1px solid ${(STATUS_COLOR[r.status] || C.textSecondary)}25` }}>{r.status}</span>
              </div>
            </div>

            {/* Sheet body — Pressman fields */}
            <div style={{ borderTop: 'none' }}>
              {field('Project', project.name)}
              {field('Risk Type', r.category)}
              {field('Priority (1 low … 5 critical)', `${r.impact}  —  ${r.impact >= 5 ? 'Critical' : r.impact >= 4 ? 'High' : r.impact >= 3 ? 'Medium' : r.impact >= 2 ? 'Low' : 'Negligible'}`)}
              {field('Risk Factor', r.description)}
              {field('Probability', `${r.probability}%`)}
              {field('Impact', IMPACT_NARRATIVE[r.impact] || IMPACT_NARRATIVE[3])}
              {field('Monitoring Approach', r.monitoring)}
              {field('Contingency & Escalation Plan', r.management)}
              {field('Mitigation Strategy', r.mitigation)}
              <div style={{ display: 'flex', gap: 0 }}>
                <div style={{ width: 190, flexShrink: 0, padding: '9px 14px', fontSize: 12, fontWeight: 700, color: C.textSecondary, background: C.mainBg, borderRight: `1px solid ${C.border}` }}>
                  Estimated Resources
                </div>
                <div style={{ flex: 1, padding: '9px 14px', display: 'flex', gap: 24 }}>
                  <span style={{ fontSize: 12, color: C.textSecondary }}>Cost Impact: <strong style={{ color: C.textPrimary }}>${r.costImpact.toLocaleString()}</strong></span>
                  <span style={{ fontSize: 12, color: C.textSecondary }}>Risk Exposure: <strong style={{ color: priColor }}>${r.riskExposure.toLocaleString()}</strong></span>
                  <span style={{ fontSize: 12, color: C.textSecondary }}>Formula: {r.probability}% × ${r.costImpact.toLocaleString()} = <strong style={{ color: priColor }}>${r.riskExposure.toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---- Risk Heatmap ----
function RiskHeatmap({ risks }) {
  const C = useThemeColors()
  const PROB_BANDS = [
    { label: '80–100%', min: 80, max: 100 },
    { label: '60–80%', min: 60, max: 80 },
    { label: '40–60%', min: 40, max: 60 },
    { label: '20–40%', min: 20, max: 40 },
    { label: '0–20%', min: 0, max: 20 },
  ]
  const IMPACT_BANDS = [1, 2, 3, 4, 5]

  function getRisksInCell(probBand, impact) {
    return risks.filter(r => r.probability >= probBand.min && r.probability < probBand.max && r.impact === impact)
  }

  function cellColor(probBand, impact) {
    const score = (impact / 5) * ((probBand.min + probBand.max) / 2 / 100)
    if (score >= 0.48) return { bg: C.danger + 'CC', text: '#fff' }
    if (score >= 0.24) return { bg: C.warning + 'CC', text: '#fff' }
    if (score >= 0.10) return { bg: '#F5D742CC', text: '#12324A' }
    return { bg: C.success + '40', text: C.textPrimary }
  }

  const [tooltip, setTooltip] = useState(null)

  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Risk Heatmap — Probability × Impact</h4>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['High', C.danger], ['Medium', C.warning], ['Low', C.success]].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 11, color: C.textSecondary }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {/* Y-axis label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', writing: 'vertical', width: 20 }}>
          <span style={{ fontSize: 10, color: C.textSecondary, writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: 1, textTransform: 'uppercase' }}>Probability</span>
        </div>

        <div style={{ flex: 1 }}>
          {/* Heatmap grid */}
          {PROB_BANDS.map(probBand => (
            <div key={probBand.label} style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
              <div style={{ width: 52, fontSize: 10, color: C.textSecondary, textAlign: 'right', paddingRight: 8, flexShrink: 0 }}>{probBand.label}</div>
              {IMPACT_BANDS.map(impact => {
                const cellRisks = getRisksInCell(probBand, impact)
                const colors = cellColor(probBand, impact)
                return (
                  <div key={impact}
                    style={{ flex: 1, height: 56, borderRadius: 6, background: colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: cellRisks.length > 0 ? 'pointer' : 'default', transition: 'opacity 0.15s', position: 'relative', border: `1px solid ${C.border}` }}
                    onMouseEnter={() => cellRisks.length > 0 && setTooltip({ probBand, impact, risks: cellRisks })}
                    onMouseLeave={() => setTooltip(null)}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: cellRisks.length > 0 ? colors.text : C.border }}>{cellRisks.length > 0 ? cellRisks.length : '·'}</span>
                    {cellRisks.length > 0 && (
                      <span style={{ fontSize: 9, color: colors.text, opacity: 0.8 }}>{cellRisks.length === 1 ? 'risk' : 'risks'}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* X-axis */}
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <div style={{ width: 60, flexShrink: 0 }} />
            {IMPACT_BANDS.map(i => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: C.textSecondary }}>Impact {i}</div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 10, color: C.textSecondary, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Impact (1 = Low → 5 = Critical)</div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{ marginTop: 16, background: C.mainBg, borderRadius: 8, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 8 }}>
            Risks: Probability {tooltip.probBand.label}, Impact {tooltip.impact}
          </div>
          {tooltip.risks.map(r => (
            <div key={r.id} style={{ fontSize: 12, color: C.textSecondary, padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontWeight: 500, color: C.textPrimary }}>{r.description}</span>
              {' — '}Exposure: <strong style={{ color: r.priority === 'High' ? C.danger : r.priority === 'Medium' ? C.warning : C.success }}>${r.riskExposure.toLocaleString()}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RiskTable() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addRisk, updateRisk, deleteRisk } = useProjects()
  const { profile } = useAuth()
  const isPM = ['pm', 'project_manager', 'admin'].includes(profile?.role)
  const project = getProject(id)
  const [showModal, setShowModal] = useState(false)
  const [view, setView] = useState('table')
  const [newRisk, setNewRisk] = useState({ description: '', category: 'Technology', probability: 30, impact: 3, costImpact: 10000 })

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  const risks = project.risks
  const highCount = risks.filter(r => r.priority === 'High').length
  const resolvedCount = risks.filter(r => r.status === 'Resolved').length
  const totalExposure = risks.reduce((s, r) => s + r.riskExposure, 0)

  const [showDownload, setShowDownload] = useState(false)
  const downloadRef = useRef(null)

  useEffect(() => {
    function close(e) { if (downloadRef.current && !downloadRef.current.contains(e.target)) setShowDownload(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function submitRisk() {
    if (!newRisk.description.trim()) return
    addRisk(id, newRisk)
    setShowModal(false)
    setNewRisk({ description: '', category: 'Technology', probability: 30, impact: 3, costImpact: 10000 })
  }

  function downloadCSV() {
    const headers = ['#', 'Risk Factor', 'Category', 'Probability (%)', 'Impact (1-5)', 'Cost Impact ($)', 'Risk Exposure ($)', 'Priority', 'Status', 'Mitigation Strategy', 'Monitoring Approach', 'Contingency & Escalation Plan']
    const rows = risks.map((r, i) => [
      i + 1, `"${(r.description || '').replace(/"/g, '""')}"`, r.category,
      r.probability, r.impact, r.costImpact, r.riskExposure, r.priority, r.status,
      `"${(r.mitigation || '').replace(/"/g, '""')}"`,
      `"${(r.monitoring || '').replace(/"/g, '""')}"`,
      `"${(r.management || '').replace(/"/g, '""')}"`,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_RMMM_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setShowDownload(false)
  }

  function downloadPDF() {
    const IMPACT_NAR = {
      1: 'Negligible effect on project.',
      2: 'Minor delays or cost overrun likely; recoverable.',
      3: 'Moderate delays and rework required.',
      4: 'Project completion will be delayed; significant budget impact.',
      5: 'Critical — project failure risk if not mitigated; immediate escalation required.',
    }
    const priColors = { High: '#dc2626', Medium: '#d97706', Low: '#059669' }
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>RMMM Risk Sheet — ${project.name}</title>
<style>
  body{font-family:Arial,sans-serif;padding:24px;background:#fff;color:#111;font-size:12px}
  h1{font-size:18px;margin:0 0 4px}p.sub{color:#666;font-size:11px;margin:0 0 20px}
  .sheet{border:2px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:24px;page-break-inside:avoid}
  .sheet-header{padding:12px 16px;display:flex;justify-content:space-between;align-items:center}
  .badge{padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700}
  .field{display:flex;border-bottom:1px solid #e5e7eb}
  .field:last-child{border-bottom:none}
  .field-label{width:200px;flex-shrink:0;padding:8px 14px;font-weight:700;color:#666;background:#f9fafb;border-right:1px solid #e5e7eb}
  .field-value{flex:1;padding:8px 14px;line-height:1.5;color:#222}
  @media print{body{padding:0}@page{margin:20mm}}
</style></head><body>
<h1>Risk Sheet (RMMM) — ${project.name}</h1>
<p class="sub">Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;·&nbsp; Total Risks: ${risks.length} &nbsp;·&nbsp; Total Exposure: $${totalExposure.toLocaleString()}</p>
${risks.map((r, i) => {
  const pc = priColors[r.priority] || '#6b7280'
  return `<div class="sheet">
  <div class="sheet-header" style="background:${pc}15;border-bottom:1px solid ${pc}30">
    <strong style="font-size:13px">Risk Sheet #${String(i+1).padStart(2,'0')} — ${project.name}</strong>
    <span>
      <span class="badge" style="background:${pc}18;color:${pc};border:1px solid ${pc}30">${r.priority} Priority</span>
      &nbsp;<span class="badge" style="background:#f3f4f6;color:#374151;border:1px solid #e5e7eb">${r.status}</span>
    </span>
  </div>
  <div class="field"><div class="field-label">Project</div><div class="field-value">${project.name}</div></div>
  <div class="field"><div class="field-label">Risk Type</div><div class="field-value">${r.category}</div></div>
  <div class="field"><div class="field-label">Priority (1 low … 5 critical)</div><div class="field-value">${r.impact} — ${r.impact>=5?'Critical':r.impact>=4?'High':r.impact>=3?'Medium':r.impact>=2?'Low':'Negligible'}</div></div>
  <div class="field"><div class="field-label">Risk Factor</div><div class="field-value">${r.description}</div></div>
  <div class="field"><div class="field-label">Probability</div><div class="field-value">${r.probability}%</div></div>
  <div class="field"><div class="field-label">Impact</div><div class="field-value">${IMPACT_NAR[r.impact] || IMPACT_NAR[3]}</div></div>
  <div class="field"><div class="field-label">Monitoring Approach</div><div class="field-value">${r.monitoring || '<em style="color:#aaa">Not defined</em>'}</div></div>
  <div class="field"><div class="field-label">Contingency &amp; Escalation Plan</div><div class="field-value">${r.management || '<em style="color:#aaa">Not defined</em>'}</div></div>
  <div class="field"><div class="field-label">Mitigation Strategy</div><div class="field-value">${r.mitigation || '<em style="color:#aaa">Not defined</em>'}</div></div>
  <div class="field"><div class="field-label">Estimated Resources</div><div class="field-value">Cost Impact: <strong>$${r.costImpact.toLocaleString()}</strong> &nbsp; Risk Exposure: <strong style="color:${pc}">$${r.riskExposure.toLocaleString()}</strong> &nbsp; Formula: ${r.probability}% × $${r.costImpact.toLocaleString()} = <strong style="color:${pc}">$${r.riskExposure.toLocaleString()}</strong></div></div>
</div>`
}).join('')}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    setShowDownload(false)
  }

  const inp = { width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none', background: C.cardBg, color: C.textPrimary }

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0, fontFamily: 'inherit' }}>← Back to {project.name}</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>Risk Table (RMMM)</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>{project.name} — sorted by Risk Exposure (highest first)</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            {[['table', 'Table'], ['sheet', 'Risk Sheet'], ['heatmap', 'Heatmap']].map(([v, label]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '7px 14px', border: 'none', borderRight: `1px solid ${C.border}`, background: view === v ? C.primary : C.cardBg, color: view === v ? '#fff' : C.textSecondary, fontSize: 12, fontWeight: view === v ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                {label}
              </button>
            ))}
          </div>
          {/* Download dropdown */}
          <div ref={downloadRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowDownload(v => !v)}
              style={{ padding: '7px 14px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showDownload && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 180, overflow: 'hidden' }}>
                <button onClick={downloadPDF}
                  style={{ width: '100%', padding: '11px 16px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: 13, cursor: 'pointer', color: C.textPrimary, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primary + '10'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>
                  <div>
                    <div style={{ fontWeight: 600 }}>Download PDF</div>
                    <div style={{ fontSize: 11, color: C.textSecondary }}>Print / Save as PDF</div>
                  </div>
                </button>
                <button onClick={downloadCSV}
                  style={{ width: '100%', padding: '11px 16px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: 13, cursor: 'pointer', color: C.textPrimary, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}
                  onMouseEnter={e => e.currentTarget.style.background = C.primary + '10'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.success} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
                  <div>
                    <div style={{ fontWeight: 600 }}>Download CSV</div>
                    <div style={{ fontSize: 11, color: C.textSecondary }}>All risks as spreadsheet</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          {isPM && <button onClick={() => setShowModal(true)} style={{ padding: '8px 18px', background: C.danger, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Risk</button>}
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Risks', value: risks.length, color: C.textPrimary,
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg> },
          { label: 'High Priority', value: highCount, color: C.danger,
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="0.8" fill="currentColor"/></svg> },
          { label: 'Resolved', value: resolvedCount, color: C.success,
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><polyline points="8,12 11,15 16,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
          { label: 'Total Risk Exposure', value: `$${totalExposure.toLocaleString()}`, color: C.warning,
            svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/><line x1="7" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        ].map(m => (
          <div key={m.label} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: m.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, flexShrink: 0 }}>{m.svg}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 11, color: C.textSecondary }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {view === 'heatmap' ? (
        <RiskHeatmap risks={risks} />
      ) : view === 'sheet' ? (
        <RiskSheet risks={risks} project={project} />
      ) : (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.danger + '0d', borderBottom: `2px solid ${C.border}` }}>
                {['Risk Description', 'Category', 'Probability', 'Impact', 'Cost Impact', 'Risk Exposure', 'Priority', 'Status'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: h === 'Cost Impact' || h === 'Risk Exposure' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: C.danger, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {risks.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>No risks logged yet. Click "+ Add Risk" to get started.</td></tr>
              ) : (
                risks.map(r => (
                  <RiskRow key={r.id} risk={r} projectId={id} isPM={isPM}
                    onUpdate={(riskId, updates) => updateRisk(id, riskId, updates)}
                    onDelete={riskId => deleteRisk(id, riskId)} />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Risk Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.cardBg, borderRadius: 12, padding: 26, width: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: `1px solid ${C.border}` }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Add New Risk</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Risk Description *</label>
              <input value={newRisk.description} onChange={e => setNewRisk(r => ({ ...r, description: e.target.value }))} placeholder="Describe the risk..."
                style={{ ...inp }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Category</label>
                <select value={newRisk.category} onChange={e => setNewRisk(r => ({ ...r, category: e.target.value }))} style={{ ...inp }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Probability (%)</label>
                <input type="number" min={0} max={100} value={newRisk.probability} onChange={e => setNewRisk(r => ({ ...r, probability: parseInt(e.target.value) || 0 }))} style={{ ...inp }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Impact (1–5)</label>
                <input type="number" min={1} max={5} value={newRisk.impact} onChange={e => setNewRisk(r => ({ ...r, impact: parseInt(e.target.value) || 1 }))} style={{ ...inp }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Cost Impact ($)</label>
                <input type="number" min={0} value={newRisk.costImpact} onChange={e => setNewRisk(r => ({ ...r, costImpact: parseInt(e.target.value) || 0 }))} style={{ ...inp }} />
              </div>
            </div>
            <div style={{ background: C.mainBg, borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 12, color: C.textSecondary }}>
              Auto-calculated: Risk Exposure = ${Math.round((newRisk.probability / 100) * newRisk.costImpact).toLocaleString()} | Priority: {newRisk.probability / 100 * newRisk.costImpact >= 10000 ? 'High' : newRisk.probability / 100 * newRisk.costImpact >= 3000 ? 'Medium' : 'Low'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 18px', border: `1px solid ${C.border}`, borderRadius: 6, background: C.cardBg, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={submitRisk} style={{ padding: '8px 20px', background: C.danger, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add Risk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
