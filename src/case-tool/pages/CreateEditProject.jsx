import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'

const DOMAINS = ['Web', 'Mobile', 'Desktop', 'Embedded', 'Other']
const PRIORITIES = ['Must Have', 'Should Have', 'Could Have', "Won't Have"]
const PROJECT_STATUSES = ['Planning', 'Active', 'On Hold', 'Completed']

function Field({ label, children }) {
  const C = useThemeColors()
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

export default function CreateEditProject() {
  const C = useThemeColors()
  const inputStyle = {
    width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8,
    fontSize: 13, outline: 'none', boxSizing: 'border-box', color: C.textPrimary, background: C.cardBg,
  }
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addProject, updateProject } = useProjects()
  const isEdit = Boolean(id)
  const existing = isEdit ? getProject(id) : null

  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    domain: existing?.domain || 'Web',
    startDate: existing?.startDate || '',
    deadline: existing?.deadline || '',
    teamSize: existing?.teamSize || 3,
    teamRoles: existing?.teamRoles || '',
    status: existing?.status || (isEdit ? 'Active' : 'Planning'),
    budget: existing?.budget || 0,
  })

  const [features, setFeatures] = useState(
    existing?.features || [{ id: 'nf1', name: '', description: '', priority: 'Should Have', status: 'To Do', acceptanceCriteria: '' }]
  )
  const [error, setError] = useState('')
  const [acGateIdx, setAcGateIdx] = useState(null) // index of feature awaiting AC confirmation

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function addFeature() {
    setFeatures(f => [...f, { id: 'nf' + Date.now(), name: '', description: '', priority: 'Should Have', status: 'To Do', acceptanceCriteria: '' }])
  }

  function removeFeature(idx) {
    setFeatures(f => f.filter((_, i) => i !== idx))
  }

  function updateFeature(idx, key, val) {
    // Q2: AC gate — if marking Done and feature has ACs, ask for confirmation first
    if (key === 'status' && val === 'Done' && isEdit) {
      const feat = features[idx]
      if (feat.acceptanceCriteria && String(feat.acceptanceCriteria).trim()) {
        setAcGateIdx(idx)
        return
      }
    }
    setFeatures(f => f.map((feat, i) => i === idx ? { ...feat, [key]: val } : feat))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Project name is required.'); return }
    if (!form.startDate || !form.deadline) { setError('Start date and deadline are required.'); return }
    const validFeatures = features.filter(f => f.name.trim())
    if (validFeatures.length === 0) { setError('Add at least one feature.'); return }
    setError('')

    if (isEdit) {
      await updateProject(id, { ...form, features: validFeatures })
      navigate(`/dashboard/projects/${id}`)
    } else {
      const newId = await addProject({ ...form, features: validFeatures })
      if (newId) navigate(`/dashboard/projects/${newId}`)
      else navigate('/dashboard')
    }
  }

  const namedFeatures = features.filter(f => f.name.trim())
  const mustHaveCount = namedFeatures.filter(f => f.priority === 'Must Have').length
  const moscowOverload = namedFeatures.length >= 3 && (mustHaveCount / namedFeatures.length) > 0.6

  return (
    <div style={{ padding: 28, maxWidth: 820, margin: '0 auto' }}>
      {/* Q13: Reminder to enter actuals when marking Completed */}
      {form.status === 'Completed' && (
        <div style={{ padding: '10px 14px', background: C.success + '12', border: `1px solid ${C.success}30`, borderRadius: 8, marginBottom: 16, fontSize: 12, color: C.success, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="8,12 11,15 16,9"/></svg>
          <span><strong>Project marked Completed</strong> — Record actual effort, cost, and duration in the <strong>Estimation tab</strong> to generate accuracy reports in Analytics.</span>
        </div>
      )}
      {/* Q2: AC Confirmation Gate Modal */}
      {acGateIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, width: 420, boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Acceptance Criteria Verified?</h3>
            <p style={{ margin: '0 0 6px', fontSize: 13, color: C.textSecondary }}>This feature has defined acceptance criteria:</p>
            <div style={{ background: C.mainBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: C.textPrimary, lineHeight: 1.6 }}>
              {String(features[acGateIdx]?.acceptanceCriteria || '').slice(0, 300)}
            </div>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: C.textSecondary }}>Confirm that all criteria above have been tested and verified before marking Done.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setAcGateIdx(null)} style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 7, background: C.cardBg, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { setFeatures(f => f.map((feat, i) => i === acGateIdx ? { ...feat, status: 'Done' } : feat)); setAcGateIdx(null) }}
                style={{ padding: '8px 18px', background: C.success, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                All ACs Verified — Mark Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(isEdit ? `/dashboard/projects/${id}` : '/dashboard')}
          style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>{isEdit ? 'Edit Project' : 'Create New Project'}</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>Fill in the project details and add features below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Project details card */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Project Details</h3>

          <Field label="Project Name *">
            <input style={inputStyle} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Hospital Management System" required />
          </Field>

          <Field label="Description">
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Brief description of the project scope and goals..." />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Domain">
              <select style={inputStyle} value={form.domain} onChange={e => setField('domain', e.target.value)}>
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select style={inputStyle} value={form.status} onChange={e => setField('status', e.target.value)}>
                {PROJECT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Start Date *">
              <input style={inputStyle} type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} required />
            </Field>
            <div>
              <Field label="Deadline *">
                <input style={inputStyle} type="date" value={form.deadline} onChange={e => setField('deadline', e.target.value)} required />
              </Field>
              <p style={{ margin: '-12px 0 0', fontSize: 11, color: C.textSecondary }}>Defines your release window — scope can still flex after creation.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Team Size">
              <input style={inputStyle} type="number" min={1} max={50} value={form.teamSize} onChange={e => setField('teamSize', parseInt(e.target.value) || 1)} />
            </Field>
            <Field label="Budget (USD, optional)">
              <input style={inputStyle} type="number" min={0} step={1000} value={form.budget} onChange={e => setField('budget', parseFloat(e.target.value) || 0)} placeholder="0" />
            </Field>
          </div>

          <Field label="Team Roles (optional)">
            <input style={inputStyle} value={form.teamRoles} onChange={e => setField('teamRoles', e.target.value)} placeholder="e.g. 2 Developers, 1 QA, 1 BA" />
          </Field>
        </div>

        {/* Features card */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: moscowOverload ? 10 : 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Features / Requirements</h3>
            <button type="button" onClick={addFeature}
              style={{ padding: '6px 14px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              + Add Feature
            </button>
          </div>

          {/* Q1: MoSCoW distribution warning */}
          {moscowOverload && (
            <div style={{ padding: '9px 13px', background: C.warning + '14', border: `1px solid ${C.warning}35`, borderRadius: 8, marginBottom: 14, fontSize: 12, color: C.warning, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 3L2 20h20L12 3z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>
              <span><strong>MoSCoW Imbalance:</strong> {mustHaveCount} of {namedFeatures.length} features ({Math.round(mustHaveCount / namedFeatures.length * 100)}%) are Must Have. ASPM recommends keeping Must Have below 60% — too many mandatory features removes scope flexibility and increases delivery risk.</span>
            </div>
          )}
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '2fr 2fr 1fr 1fr 36px' : '2fr 2fr 1fr 36px', gap: 8, padding: '0 0 8px', borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
            {(isEdit ? ['Feature Name', 'Description', 'Priority', 'Status', ''] : ['Feature Name', 'Description', 'Priority', '']).map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>

          {features.map((feat, idx) => (
            <div key={feat.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: isEdit ? '2fr 2fr 1fr 1fr 36px' : '2fr 2fr 1fr 36px', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <input style={inputStyle} placeholder="Feature name" value={feat.name} onChange={e => updateFeature(idx, 'name', e.target.value)} />
                <input style={inputStyle} placeholder="Brief description" value={feat.description} onChange={e => updateFeature(idx, 'description', e.target.value)} />
                <select style={inputStyle} value={feat.priority} onChange={e => updateFeature(idx, 'priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
                {isEdit && (
                  <select style={inputStyle} value={feat.status} onChange={e => updateFeature(idx, 'status', e.target.value)}>
                    {['To Do', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}
                  </select>
                )}
                <button type="button" onClick={() => removeFeature(idx)} disabled={features.length <= 1}
                  style={{ background: 'none', border: 'none', color: features.length <= 1 ? '#d1d5db' : C.danger, cursor: features.length <= 1 ? 'default' : 'pointer', fontSize: 18, padding: 0 }}>
                  ✕
                </button>
              </div>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 44, fontSize: 12, color: C.textSecondary }}
                placeholder="Acceptance Criteria — how will we know this feature is done? (optional)"
                value={feat.acceptanceCriteria || ''}
                onChange={e => updateFeature(idx, 'acceptanceCriteria', e.target.value)}
              />
            </div>
          ))}
        </div>

        {error && <div style={{ padding: '10px 14px', background: C.danger + '12', border: `1px solid ${C.danger}30`, color: C.danger, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate(isEdit ? `/dashboard/projects/${id}` : '/dashboard')}
            style={{ padding: '10px 20px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.textSecondary }}>
            Cancel
          </button>
          <button type="submit"
            style={{ padding: '10px 24px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {isEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
