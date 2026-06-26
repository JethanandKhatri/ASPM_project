import { useState } from 'react'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'

const REPORT_TYPES = [
  { id: 'overview', label: 'Project Overview', desc: 'Name, domain, status, dates, team size, description' },
  { id: 'features', label: 'Requirements / Features List', desc: 'All features with priority and status' },
  { id: 'estimations', label: 'Estimation Results (all versions)', desc: 'All estimation runs with effort, cost, duration' },
  { id: 'risks', label: 'Risk Table with RMMM', desc: 'Full risk log with mitigation, monitoring, management plans' },
  { id: 'activity', label: 'Activity Log', desc: 'System events and comment history' },
]

function buildPdfHtml(project, checkedTypes) {
  const sections = []

  if (checkedTypes.overview) {
    sections.push(`
      <section>
        <h2>Project Overview</h2>
        <table>
          <tr><th>Name</th><td>${project.name}</td><th>Status</th><td>${project.status}</td></tr>
          <tr><th>Domain</th><td>${project.domain}</td><th>Team Size</th><td>${project.teamSize}</td></tr>
          <tr><th>Start Date</th><td>${project.startDate}</td><th>Deadline</th><td>${project.deadline}</td></tr>
          <tr><th colspan="4">Description</th></tr>
          <tr><td colspan="4">${project.description}</td></tr>
        </table>
      </section>`)
  }

  if (checkedTypes.features) {
    const rows = project.features.map((f, i) =>
      `<tr><td>${i + 1}</td><td>${f.name}</td><td>${f.description || '—'}</td><td>${f.priority}</td><td>${f.status}</td></tr>`
    ).join('')
    sections.push(`
      <section>
        <h2>Requirements / Features (${project.features.length})</h2>
        <table>
          <tr><th>#</th><th>Feature</th><th>Description</th><th>Priority</th><th>Status</th></tr>
          ${rows}
        </table>
      </section>`)
  }

  if (checkedTypes.estimations) {
    const rows = project.estimations.map(e =>
      `<tr><td>${e.version}</td><td>${e.technique}</td><td>${e.date}</td><td>${e.effort}</td><td>${e.cost}</td><td>${e.duration}</td><td>${e.status}</td></tr>`
    ).join('')
    sections.push(`
      <section>
        <h2>Estimation Results (${project.estimations.length} runs)</h2>
        <table>
          <tr><th>Version</th><th>Technique</th><th>Date</th><th>Effort</th><th>Cost</th><th>Duration</th><th>Status</th></tr>
          ${rows || '<tr><td colspan="7">No estimations yet.</td></tr>'}
        </table>
      </section>`)
  }

  if (checkedTypes.risks) {
    const rows = project.risks.map((r, i) =>
      `<tr><td>${i + 1}</td><td>${r.description}</td><td>${r.category}</td><td>${r.probability}%</td><td>${r.impact}</td><td>$${r.riskExposure.toLocaleString()}</td><td>${r.priority}</td><td>${r.status}</td></tr>
       <tr class="muted"><td></td><td colspan="7"><em>Mitigation:</em> ${r.mitigation || '—'} &nbsp;|&nbsp; <em>Monitoring:</em> ${r.monitoring || '—'} &nbsp;|&nbsp; <em>Management:</em> ${r.management || '—'}</td></tr>`
    ).join('')
    sections.push(`
      <section>
        <h2>Risk Table — RMMM (${project.risks.length} risks)</h2>
        <table>
          <tr><th>#</th><th>Description</th><th>Category</th><th>Probability</th><th>Impact</th><th>Exposure</th><th>Priority</th><th>Status</th></tr>
          ${rows || '<tr><td colspan="8">No risks logged.</td></tr>'}
        </table>
      </section>`)
  }

  if (checkedTypes.activity) {
    const rows = (project.activityLog || []).map(a =>
      `<tr><td>${new Date(a.timestamp).toLocaleString()}</td><td>${a.user}</td><td>${a.action}</td></tr>`
    ).join('')
    sections.push(`
      <section>
        <h2>Activity Log</h2>
        <table>
          <tr><th>Timestamp</th><th>User</th><th>Action</th></tr>
          ${rows || '<tr><td colspan="3">No activity.</td></tr>'}
        </table>
      </section>`)
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${project.name} — ASPM Report</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #12324A; margin: 0; padding: 24px 32px; }
    h1 { font-size: 20px; color: #003A6B; margin-bottom: 4px; }
    .meta { font-size: 11px; color: #5F7E95; margin-bottom: 20px; }
    h2 { font-size: 14px; color: #003A6B; border-bottom: 2px solid #CFE2F1; padding-bottom: 6px; margin-top: 24px; }
    section { page-break-inside: avoid; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #EAF4FB; padding: 7px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #3776A1; border: 1px solid #CFE2F1; }
    td { padding: 7px 10px; border: 1px solid #CFE2F1; vertical-align: top; }
    tr:nth-child(even) td { background: #F9FCFF; }
    tr.muted td { font-size: 11px; color: #5F7E95; background: #F4FAFE !important; border-top: none; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${project.name} — Project Report</h1>
  <div class="meta">Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; ASPM CASE Tool</div>
  ${sections.join('\n')}
</body>
</html>`
}

function buildCsv(project, checkedTypes) {
  const lines = []
  lines.push(`ASPM CASE Tool Report — ${project.name}`)
  lines.push(`Generated: ${new Date().toLocaleString()}`)
  lines.push('')

  if (checkedTypes.overview) {
    lines.push('PROJECT OVERVIEW')
    lines.push(`Name,${project.name}`)
    lines.push(`Domain,${project.domain}`)
    lines.push(`Status,${project.status}`)
    lines.push(`Start Date,${project.startDate}`)
    lines.push(`Deadline,${project.deadline}`)
    lines.push(`Team Size,${project.teamSize}`)
    lines.push('')
  }

  if (checkedTypes.features) {
    lines.push('FEATURES')
    lines.push('#,Feature Name,Description,Priority,Status')
    project.features.forEach((f, i) => {
      lines.push(`${i + 1},"${f.name}","${f.description || ''}",${f.priority},${f.status}`)
    })
    lines.push('')
  }

  if (checkedTypes.estimations) {
    lines.push('ESTIMATIONS')
    lines.push('Version,Technique,Date,Effort,Cost,Duration,Status')
    project.estimations.forEach(e => {
      lines.push(`${e.version},${e.technique},${e.date},"${e.effort}","${e.cost}","${e.duration}",${e.status}`)
    })
    lines.push('')
  }

  if (checkedTypes.risks) {
    lines.push('RISK TABLE (RMMM)')
    lines.push('#,Description,Category,Probability%,Impact,Risk Exposure,Priority,Status,Mitigation,Monitoring,Management')
    project.risks.forEach((r, i) => {
      lines.push(`${i + 1},"${r.description}",${r.category},${r.probability},${r.impact},$${r.riskExposure.toLocaleString()},${r.priority},${r.status},"${r.mitigation || ''}","${r.monitoring || ''}","${r.management || ''}"`)
    })
    lines.push('')
  }

  return lines.join('\n')
}

export default function Reports() {
  const C = useThemeColors()
  const { projects, getActuals } = useProjects()
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '')
  const [checkedTypes, setCheckedTypes] = useState({ overview: true, features: true, estimations: true, risks: true, activity: false })
  const [format, setFormat] = useState('PDF')
  const [recentExports, setRecentExports] = useState([])

  const project = projects.find(p => p.id === selectedProject)

  function toggleType(id) {
    setCheckedTypes(t => ({ ...t, [id]: !t[id] }))
  }

  function generateReport() {
    if (!project) return
    const filename = `${project.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`

    if (format === 'PDF') {
      const html = buildPdfHtml(project, checkedTypes)
      const win = window.open('', '_blank', 'width=900,height=700')
      if (!win) { alert('Please allow popups for this site to generate PDF reports.'); return }
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 500)
    } else {
      const csv = buildCsv(project, checkedTypes)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename.replace('.pdf', '.csv')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    const newExport = {
      id: 'r' + Date.now(), filename, date: new Date().toISOString().split('T')[0],
      types: Object.keys(checkedTypes).filter(k => checkedTypes[k]),
      format,
    }
    setRecentExports(prev => [newExport, ...prev.slice(0, 9)])
  }

  function redownload(ex) {
    if (!project) return
    if (ex.format === 'PDF') {
      const html = buildPdfHtml(project, Object.fromEntries(ex.types.map(t => [t, true])))
      const win = window.open('', '_blank', 'width=900,height=700')
      if (!win) return
      win.document.write(html)
      win.document.close()
      setTimeout(() => win.print(), 500)
    } else {
      const csv = buildCsv(project, Object.fromEntries(ex.types.map(t => [t, true])))
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = ex.filename.replace('.pdf', '.csv')
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const selectedSections = REPORT_TYPES.filter(t => checkedTypes[t.id])

  const card = { background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }
  const inp = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.cardBg, color: C.textPrimary }

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Reports / Export Center</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Generate and download project reports as PDF or CSV</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        <div>
          {/* Project selector */}
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>1. Select Project</h3>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={inp}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.status})</option>)}
            </select>
          </div>

          {/* Sections */}
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>2. Select Report Sections</h3>
            {REPORT_TYPES.map(rt => (
              <div key={rt.id} onClick={() => toggleType(rt.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: checkedTypes[rt.id] ? C.primary + '0a' : 'transparent', border: `1px solid ${checkedTypes[rt.id] ? C.primary + '40' : 'transparent'}`, transition: 'all 0.15s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${checkedTypes[rt.id] ? C.primary : C.border}`, background: checkedTypes[rt.id] ? C.primary : C.cardBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {checkedTypes[rt.id] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{rt.label}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{rt.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Format */}
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>3. Export Format</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              {[['PDF', '📄 PDF', 'Opens print dialog — save as PDF or print'], ['CSV', '📊 CSV / Excel', 'Downloads a spreadsheet-compatible .csv file']].map(([f, label, hint]) => (
                <button key={f} onClick={() => setFormat(f)}
                  style={{ flex: 1, padding: '12px', border: `2px solid ${format === f ? C.primary : C.border}`, borderRadius: 8, background: format === f ? C.primary + '0d' : C.cardBg, color: format === f ? C.primary : C.textSecondary, fontSize: 13, fontWeight: format === f ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', fontFamily: 'inherit' }}>
                  <div>{label}</div>
                  <div style={{ fontSize: 10, marginTop: 3, opacity: 0.8 }}>{hint}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateReport} disabled={selectedSections.length === 0 || !project}
            style={{ width: '100%', padding: '13px', background: selectedSections.length === 0 || !project ? C.border : C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: selectedSections.length === 0 || !project ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: selectedSections.length > 0 && project ? '0 6px 18px rgba(0,58,107,0.18)' : 'none' }}>
            {format === 'PDF' ? '📄' : '📊'} Generate {format} Report ({selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''})
          </button>
        </div>

        <div>
          {/* Preview */}
          <div style={{ ...card, marginBottom: 16 }}>
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

          {/* Recent exports */}
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Recent Exports ({recentExports.length})</h3>
            {recentExports.length === 0 ? (
              <p style={{ color: C.textSecondary, fontSize: 12, margin: 0 }}>No exports yet this session.</p>
            ) : (
              recentExports.map(ex => (
                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary }}>{ex.filename}</div>
                    <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 1 }}>{ex.date} · {ex.types.length} section(s) · {ex.format}</div>
                  </div>
                  <button onClick={() => redownload(ex)}
                    style={{ padding: '4px 10px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ↓ Regenerate
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
