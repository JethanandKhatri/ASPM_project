import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'

const C = {
  primary: '#3B5998', mainBg: '#F4F6FB', cardBg: '#FFFFFF', border: '#E0E4ED',
  textPrimary: '#1A1A2E', textSecondary: '#6B7280', danger: '#E24B4A',
}

const DOMAINS = ['Web', 'Mobile', 'Desktop', 'Embedded', 'Other']
const PRIORITIES = ['High', 'Medium', 'Low']

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8,
  fontSize: 13, outline: 'none', boxSizing: 'border-box', color: C.textPrimary, background: '#fff',
}

export default function CreateEditProject() {
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
    status: existing?.status || 'Active',
  })

  const [features, setFeatures] = useState(
    existing?.features || [{ id: 'nf1', name: '', description: '', priority: 'Medium', status: 'To Do' }]
  )
  const [error, setError] = useState('')

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function addFeature() {
    setFeatures(f => [...f, { id: 'nf' + Date.now(), name: '', description: '', priority: 'Medium', status: 'To Do' }])
  }

  function removeFeature(idx) {
    setFeatures(f => f.filter((_, i) => i !== idx))
  }

  function updateFeature(idx, key, val) {
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
      navigate(`/dashboard/projects/${newId}`)
    }
  }

  return (
    <div style={{ padding: 28, maxWidth: 820, margin: '0 auto' }}>
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
                {['Active', 'Completed', 'On Hold'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Start Date *">
              <input style={inputStyle} type="date" value={form.startDate} onChange={e => setField('startDate', e.target.value)} required />
            </Field>
            <Field label="Deadline *">
              <input style={inputStyle} type="date" value={form.deadline} onChange={e => setField('deadline', e.target.value)} required />
            </Field>
          </div>

          <Field label="Team Size">
            <input style={{ ...inputStyle, width: 120 }} type="number" min={1} max={50} value={form.teamSize} onChange={e => setField('teamSize', parseInt(e.target.value) || 1)} />
          </Field>
        </div>

        {/* Features card */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Features / Requirements</h3>
            <button type="button" onClick={addFeature}
              style={{ padding: '6px 14px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              + Add Feature
            </button>
          </div>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 36px', gap: 8, padding: '0 0 8px', borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
            {['Feature Name', 'Description', 'Priority', 'Status', ''].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
            ))}
          </div>

          {features.map((feat, idx) => (
            <div key={feat.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 36px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <input style={inputStyle} placeholder="Feature name" value={feat.name} onChange={e => updateFeature(idx, 'name', e.target.value)} />
              <input style={inputStyle} placeholder="Brief description" value={feat.description} onChange={e => updateFeature(idx, 'description', e.target.value)} />
              <select style={inputStyle} value={feat.priority} onChange={e => updateFeature(idx, 'priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
              <select style={inputStyle} value={feat.status} onChange={e => updateFeature(idx, 'status', e.target.value)}>
                {['To Do', 'In Progress', 'Done'].map(s => <option key={s}>{s}</option>)}
              </select>
              <button type="button" onClick={() => removeFeature(idx)} disabled={features.length <= 1}
                style={{ background: 'none', border: 'none', color: features.length <= 1 ? '#d1d5db' : C.danger, cursor: features.length <= 1 ? 'default' : 'pointer', fontSize: 18, padding: 0 }}>
                ✕
              </button>
            </div>
          ))}
        </div>

        {error && <div style={{ padding: '10px 14px', background: '#fef2f2', border: `1px solid #fecaca`, color: C.danger, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

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
