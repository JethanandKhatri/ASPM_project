import { useState } from 'react'
import { useProjects } from '../context/ProjectContext'

const C = { primary: '#3B5998', mainBg: '#F4F6FB', cardBg: '#FFFFFF', border: '#E0E4ED', textPrimary: '#1A1A2E', textSecondary: '#6B7280', success: '#639922' }

const REPORT_TYPES = [
  { id: 'overview', label: 'Project Overview', desc: 'Name, domain, status, dates, team size, description' },
  { id: 'features', label: 'Requirements / Features List', desc: 'All features with priority and status' },
  { id: 'estimations', label: 'Estimation Results (all versions)', desc: 'All estimation runs with effort, cost, duration' },
  { id: 'risks', label: 'Risk Table with RMMM', desc: 'Full risk log with mitigation, monitoring, management plans' },
  { id: 'activity', label: 'Activity Log', desc: 'System events and comment history' },
]

export default function Reports() {
  const { projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '')
  const [checkedTypes, setCheckedTypes] = useState({ overview: true, features: true, estimations: true, risks: true, activity: false })
  const [format, setFormat] = useState('PDF')
  const [recentExports, setRecentExports] = useState([
    { id: 'r1', filename: 'E-Commerce_Website_Report.pdf', date: '2024-06-30', types: ['overview', 'estimations', 'risks'] },
    { id: 'r2', filename: 'Hospital_Management_Full_Report.pdf', date: '2024-11-15', types: ['overview', 'features', 'risks'] },
  ])

  const project = projects.find(p => p.id === selectedProject)

  function toggleType(id) {
    setCheckedTypes(t => ({ ...t, [id]: !t[id] }))
  }

  function generateReport() {
    if (!project) return
    const filename = `${project.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`
    const newExport = { id: 'r' + Date.now(), filename, date: new Date().toISOString().split('T')[0], types: Object.keys(checkedTypes).filter(k => checkedTypes[k]) }
    setRecentExports(prev => [newExport, ...prev])
    alert(`Report generated: ${filename}\n\nIn a production system, this would download a real ${format} file.`)
  }

  const selectedSections = REPORT_TYPES.filter(t => checkedTypes[t.id])

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Reports / Export Center</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Generate and download project reports in PDF or Excel format</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Left: configuration */}
        <div>
          {/* Project selector */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>1. Select Project</h3>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.status})</option>)}
            </select>
          </div>

          {/* Report type checkboxes */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>2. Select Report Sections</h3>
            {REPORT_TYPES.map(rt => (
              <div key={rt.id} onClick={() => toggleType(rt.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: checkedTypes[rt.id] ? C.primary + '0a' : 'transparent', border: `1px solid ${checkedTypes[rt.id] ? C.primary + '40' : 'transparent'}`, transition: 'all 0.15s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checkedTypes[rt.id] ? C.primary : '#d1d5db'}`, background: checkedTypes[rt.id] ? C.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {checkedTypes[rt.id] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{rt.label}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{rt.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Format selector */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>3. Export Format</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {['PDF', 'Excel'].map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  style={{ flex: 1, padding: '12px', border: `2px solid ${format === f ? C.primary : C.border}`, borderRadius: 8, background: format === f ? C.primary + '0d' : '#fff', color: format === f ? C.primary : C.textSecondary, fontSize: 13, fontWeight: format === f ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {f === 'PDF' ? '📄 PDF' : '📊 Excel'}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateReport} disabled={selectedSections.length === 0}
            style={{ width: '100%', padding: '12px', background: selectedSections.length === 0 ? '#d1d5db' : C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: selectedSections.length === 0 ? 'default' : 'pointer' }}>
            Generate Report ({selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''})
          </button>
        </div>

        {/* Right: live preview + recent exports */}
        <div>
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Preview</h3>
            {project ? (
              <div style={{ background: C.mainBg, borderRadius: 8, padding: 14, fontSize: 12, lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: C.textPrimary, borderBottom: `2px solid ${C.primary}`, paddingBottom: 6 }}>
                  {project.name} — Project Report
                </div>
                {checkedTypes.overview && <div style={{ color: C.textSecondary }}>▸ Project Overview ({project.domain}, {project.status})</div>}
                {checkedTypes.features && <div style={{ color: C.textSecondary }}>▸ Features List ({project.features.length} features)</div>}
                {checkedTypes.estimations && <div style={{ color: C.textSecondary }}>▸ Estimation Results ({project.estimations.length} run{project.estimations.length !== 1 ? 's' : ''})</div>}
                {checkedTypes.risks && <div style={{ color: C.textSecondary }}>▸ Risk Table — RMMM ({project.risks.length} risks)</div>}
                {checkedTypes.activity && <div style={{ color: C.textSecondary }}>▸ Activity Log ({(project.activityLog || []).length} events)</div>}
                <div style={{ marginTop: 8, color: C.textSecondary, fontSize: 11 }}>Format: {format}</div>
              </div>
            ) : (
              <p style={{ color: C.textSecondary, fontSize: 13, margin: 0 }}>Select a project to preview.</p>
            )}
          </div>

          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Recent Exports</h3>
            {recentExports.length === 0 ? (
              <p style={{ color: C.textSecondary, fontSize: 12, margin: 0 }}>No exports yet.</p>
            ) : (
              recentExports.map(ex => (
                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary }}>{ex.filename}</div>
                    <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 1 }}>{ex.date} · {ex.types.length} section(s)</div>
                  </div>
                  <button onClick={() => alert(`Re-downloading ${ex.filename}...`)}
                    style={{ padding: '4px 10px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    ↓ Re-download
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
