import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'

const C = { primary: '#3B5998', mainBg: '#F4F6FB', cardBg: '#FFFFFF', border: '#E0E4ED', textPrimary: '#1A1A2E', textSecondary: '#6B7280', danger: '#E24B4A', warning: '#EF9F27', success: '#639922' }

const CATEGORIES = ['Product Size', 'Business Impact', 'Customer', 'Process', 'Technology', 'Staff/People', 'Schedule']
const PRIORITIES = { High: { bg: '#fef2f2', color: C.danger }, Medium: { bg: '#fffbeb', color: C.warning }, Low: { bg: '#f0fdf4', color: C.success } }
const STATUS_COLORS = { Open: C.textSecondary, 'In Progress': C.warning, Resolved: C.success }

function RiskRow({ risk, projectId, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...risk })

  function saveEdit() {
    onUpdate(risk.id, form)
    setEditing(false)
  }

  const pri = PRIORITIES[risk.priority] || {}
  const inp = { width: '100%', padding: '6px 8px', border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 12, outline: 'none', boxSizing: 'border-box' }

  return (
    <>
      <tr onClick={() => setExpanded(e => !e)} style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: expanded ? '#f8f9ff' : 'inherit' }}
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
        <tr style={{ background: '#f8f9ff', borderBottom: `1px solid ${C.border}` }}>
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
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>Probability (%)</label>
                    <input type="number" min={0} max={100} style={inp} value={form.probability} onChange={e => setForm(f => ({ ...f, probability: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>Impact (1-5)</label>
                    <input type="number" min={1} max={5} style={inp} value={form.impact} onChange={e => setForm(f => ({ ...f, impact: parseInt(e.target.value) || 1 }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>Cost Impact ($)</label>
                    <input type="number" min={0} style={inp} value={form.costImpact} onChange={e => setForm(f => ({ ...f, costImpact: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>Status</label>
                    <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      {['Open', 'In Progress', 'Resolved'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {[['Mitigation Plan', 'mitigation'], ['Monitoring Plan', 'monitoring'], ['Management Plan', 'management']].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: 4 }}>{label}</label>
                    <textarea style={{ ...inp, minHeight: 60, resize: 'none', fontFamily: 'Inter, sans-serif' }} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={`Enter ${label.toLowerCase()}...`} />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button onClick={() => setEditing(false)} style={{ padding: '6px 14px', border: `1px solid ${C.border}`, borderRadius: 6, background: '#fff', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={saveEdit} style={{ padding: '6px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
                  {[['Mitigation Plan', risk.mitigation], ['Monitoring Plan', risk.monitoring], ['Management Plan', risk.management]].map(([label, val]) => (
                    <div key={label} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                      <p style={{ margin: 0, fontSize: 12, color: val ? C.textPrimary : C.textSecondary, fontStyle: val ? 'normal' : 'italic', lineHeight: 1.5 }}>{val || 'Not defined yet.'}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button onClick={() => { setEditing(true); setExpanded(true) }} style={{ padding: '5px 12px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit RMMM</button>
                  <button onClick={() => onUpdate(risk.id, { status: risk.status === 'Resolved' ? 'Open' : 'Resolved' })}
                    style={{ padding: '5px 12px', background: risk.status === 'Resolved' ? '#fef2f2' : '#f0fdf4', color: risk.status === 'Resolved' ? C.danger : C.success, border: `1px solid ${risk.status === 'Resolved' ? C.danger : C.success}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {risk.status === 'Resolved' ? 'Reopen' : 'Mark Resolved'}
                  </button>
                  <button onClick={() => onDelete(risk.id)} style={{ padding: '5px 12px', background: '#fef2f2', color: C.danger, border: `1px solid ${C.danger}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export default function RiskTable() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addRisk, updateRisk, deleteRisk } = useProjects()
  const project = getProject(id)
  const [showModal, setShowModal] = useState(false)
  const [newRisk, setNewRisk] = useState({ description: '', category: 'Technology', probability: 30, impact: 3, costImpact: 10000 })

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  const risks = project.risks
  const highCount = risks.filter(r => r.priority === 'High').length
  const resolvedCount = risks.filter(r => r.status === 'Resolved').length
  const totalExposure = risks.reduce((s, r) => s + r.riskExposure, 0)

  function submitRisk() {
    if (!newRisk.description.trim()) return
    addRisk(id, newRisk)
    setShowModal(false)
    setNewRisk({ description: '', category: 'Technology', probability: 30, impact: 3, costImpact: 10000 })
  }

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>← Back to {project.name}</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>Risk Table (RMMM)</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>{project.name} — sorted by Risk Exposure (highest first)</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: '10px 18px', background: C.danger, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Risk</button>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Risks', value: risks.length, icon: '⚠', color: C.textPrimary },
          { label: 'High Priority', value: highCount, icon: '🔴', color: C.danger },
          { label: 'Resolved', value: resolvedCount, icon: '✓', color: C.success },
          { label: 'Total Risk Exposure', value: `$${totalExposure.toLocaleString()}`, icon: '$', color: C.warning },
        ].map(m => (
          <div key={m.label} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: m.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 11, color: C.textSecondary }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk table */}
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
                <RiskRow key={r.id} risk={r} projectId={id}
                  onUpdate={(riskId, updates) => updateRisk(id, riskId, updates)}
                  onDelete={riskId => deleteRisk(id, riskId)} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Risk Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 26, width: 520, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Add New Risk</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Risk Description *</label>
              <input value={newRisk.description} onChange={e => setNewRisk(r => ({ ...r, description: e.target.value }))} placeholder="Describe the risk..."
                style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Category</label>
                <select value={newRisk.category} onChange={e => setNewRisk(r => ({ ...r, category: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Probability (%)</label>
                <input type="number" min={0} max={100} value={newRisk.probability} onChange={e => setNewRisk(r => ({ ...r, probability: parseInt(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Impact (1–5)</label>
                <input type="number" min={1} max={5} value={newRisk.impact} onChange={e => setNewRisk(r => ({ ...r, impact: parseInt(e.target.value) || 1 }))}
                  style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Cost Impact ($)</label>
                <input type="number" min={0} value={newRisk.costImpact} onChange={e => setNewRisk(r => ({ ...r, costImpact: parseInt(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ background: C.mainBg, borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 12, color: C.textSecondary }}>
              Auto-calculated: Risk Exposure = ${Math.round((newRisk.probability / 100) * newRisk.costImpact).toLocaleString()} | Priority: {newRisk.probability / 100 * newRisk.costImpact >= 10000 ? 'High' : newRisk.probability / 100 * newRisk.costImpact >= 3000 ? 'Medium' : 'Low'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 18px', border: `1px solid ${C.border}`, borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitRisk} style={{ padding: '8px 20px', background: C.danger, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Risk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
