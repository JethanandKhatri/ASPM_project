import { useState } from 'react'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'

const CHART_COLORS = ['#3776A1', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']

function BarChart({ data, title, formatter, height = 140 }) {
  const C = useThemeColors()
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
        {data.map((d, i) => {
          const h = Math.max((d.value / max) * (height - 24), 4)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textPrimary }}>{formatter ? formatter(d.value) : d.value}</div>
              <div style={{ width: '100%', height: h, background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: '4px 4px 0 0', transition: 'height 0.4s' }} title={d.label} />
              <div style={{ fontSize: 9, color: C.textSecondary, textAlign: 'center', lineHeight: 1.2 }}>{d.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DonutChart({ data, title }) {
  const C = useThemeColors()
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let offset = 0
  const r = 50, cx = 60, cy = 60
  const circumference = 2 * Math.PI * r
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          {data.map((d, i) => {
            const pct = d.value / total
            const strokeDash = circumference * pct
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={20} strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={-circumference * offset} transform="rotate(-90 60 60)" />
            )
            offset += pct
            return el
          })}
          <circle cx={cx} cy={cy} r={40} fill={C.cardBg} />
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.textPrimary}>{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill={C.textSecondary}>total</text>
        </svg>
        <div style={{ flex: 1 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.textSecondary, flex: 1 }}>{d.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BenchmarkRow({ project, actuals, allProjects }) {
  const C = useThemeColors()
  const riskDensity = project.features.length > 0
    ? (project.risks.length / project.features.length).toFixed(2)
    : '—'
  const completionRate = project.features.length > 0
    ? Math.round((project.features.filter(f => f.status === 'Done').length / project.features.length) * 100)
    : 0
  const estCount = project.estimations.length
  const avgEstEffort = estCount > 0
    ? Math.round(project.estimations.reduce((s, e) => s + (e.effortNum || 0), 0) / estCount)
    : null
  const actualEffort = actuals?.effortNum || null
  const accuracy = avgEstEffort && actualEffort
    ? Math.round((1 - Math.abs(avgEstEffort - actualEffort) / actualEffort) * 100)
    : null

  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td style={{ padding: '10px 14px', fontWeight: 600, color: C.textPrimary, fontSize: 13 }}>{project.name}</td>
      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, color: C.textSecondary }}>{project.domain}</td>
      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, color: C.textPrimary }}>{project.features.length}</td>
      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${completionRate}%`, background: completionRate >= 80 ? C.success : completionRate >= 50 ? C.warning : C.primary, borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary, minWidth: 32 }}>{completionRate}%</span>
        </div>
      </td>
      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, color: riskDensity > 1 ? C.danger : C.textSecondary }}>{riskDensity}</td>
      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, color: C.primary }}>{estCount}</td>
      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: accuracy === null ? C.textSecondary : accuracy >= 85 ? C.success : accuracy >= 70 ? C.warning : C.danger }}>
        {accuracy === null ? <span style={{ color: C.textSecondary, fontWeight: 400 }}>No actuals</span> : `${accuracy}%`}
      </td>
    </tr>
  )
}

export default function Analytics() {
  const C = useThemeColors()
  const { projects, getActuals } = useProjects()
  const [selectedProject, setSelectedProject] = useState('all')

  const proj = selectedProject === 'all' ? projects : projects.filter(p => p.id === selectedProject)

  const totalRisks = proj.reduce((s, p) => s + p.risks.length, 0)
  const completedProjects = proj.filter(p => p.status === 'Completed').length

  const projectsWithActuals = projects.filter(p => getActuals(p.id))
  const avgAccuracy = projectsWithActuals.length > 0
    ? Math.round(projectsWithActuals.reduce((s, p) => {
        const actuals = getActuals(p.id)
        const estCount = p.estimations.length
        if (!estCount || !actuals?.effortNum) return s
        const avgEst = p.estimations.reduce((a, e) => a + (e.effortNum || 0), 0) / estCount
        return s + (1 - Math.abs(avgEst - actuals.effortNum) / actuals.effortNum) * 100
      }, 0) / projectsWithActuals.length)
    : null

  const effortComparison = proj.flatMap(p => p.estimations.map(e => ({ label: `${p.name.substring(0, 8)}… ${e.version}`, value: e.effortNum || 0 }))).slice(0, 6)
  const costComparison = proj.flatMap(p => p.estimations.map(e => ({ label: `${e.version} (${e.technique.substring(0, 5)})`, value: e.costNum || 0 }))).slice(0, 6)

  const techniqueUsage = (() => {
    const counts = {}
    proj.forEach(p => p.estimations.forEach(e => { counts[e.technique] = (counts[e.technique] || 0) + 1 }))
    return Object.entries(counts).map(([label, value]) => ({ label, value }))
  })()

  const priorityCounts = [
    { label: 'Must Have',   value: proj.reduce((s, p) => s + p.features.filter(f => f.priority === 'Must Have'   || f.priority === 'High').length, 0) },
    { label: 'Should Have', value: proj.reduce((s, p) => s + p.features.filter(f => f.priority === 'Should Have' || f.priority === 'Medium').length, 0) },
    { label: 'Could Have',  value: proj.reduce((s, p) => s + p.features.filter(f => f.priority === 'Could Have'  || f.priority === 'Low').length, 0) },
    { label: "Won't Have",  value: proj.reduce((s, p) => s + p.features.filter(f => f.priority === "Won't Have").length, 0) },
  ].filter(d => d.value > 0)

  const riskExposureTrend = proj.slice(0, 6).map(p => ({
    label: p.name.substring(0, 10) + (p.name.length > 10 ? '…' : ''),
    value: p.risks.reduce((s, r) => s + r.riskExposure, 0),
  }))

  const card = { background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Analytics Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Project-level metrics, estimation accuracy, and cross-project benchmarking</p>
        </div>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.cardBg, color: C.textPrimary }}>
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Summary strip */}
      {(() => {
        const activeRisks = totalRisks - proj.reduce((s, p) => s + p.risks.filter(r => r.status === 'Resolved').length, 0)
        const statCards = [
          {
            label: 'Total Projects', value: proj.length, color: C.primary,
            svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
          },
          {
            label: 'Estimation Accuracy', value: avgAccuracy !== null ? `${avgAccuracy}%` : 'No actuals', color: C.success,
            svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><polyline points="8,12 11,15 16,9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
          },
          {
            label: 'Active Risks', value: activeRisks, color: C.danger,
            svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3L2 20h20L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg>,
          },
          {
            label: 'Completed', value: `${completedProjects}/${proj.length}`, color: '#0891b2',
            svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
          },
        ]
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {statCards.map(m => (
              <div key={m.label} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color, flexShrink: 0 }}>{m.svg}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>{m.value}</div>
                  <div style={{ fontSize: 12, color: C.textSecondary }}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* Charts 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={card}>
          <BarChart data={effortComparison} title="Estimation Effort per Run (staff months)" formatter={v => `${v}mo`} />
        </div>
        <div style={card}>
          <BarChart data={riskExposureTrend} title="Total Risk Exposure per Project ($)" formatter={v => `$${(v / 1000).toFixed(0)}k`} />
        </div>
        <div style={card}>
          <DonutChart data={techniqueUsage.length > 0 ? techniqueUsage : [{ label: 'No estimations', value: 1 }]} title="Estimation Technique Usage" />
        </div>
        <div style={card}>
          <DonutChart data={priorityCounts.length > 0 ? priorityCounts : [{ label: 'No features', value: 1 }]} title="Feature Priority Breakdown" />
        </div>
      </div>

      {costComparison.length > 0 && (
        <div style={{ ...card, marginBottom: 20 }}>
          <BarChart data={costComparison} title="Cost Comparison across Estimation Runs ($)" formatter={v => `$${(v / 1000).toFixed(0)}k`} height={160} />
        </div>
      )}

      {/* Priority × Completion Delivery Matrix */}
      {(() => {
        const MOSCOW = ['Must Have', 'Should Have', 'Could Have', "Won't Have"]
        const allFeatures = proj.flatMap(p => p.features)
        const matrix = MOSCOW.map(priority => {
          const legacy = { 'Must Have': 'High', 'Should Have': 'Medium', 'Could Have': 'Low' }
          const group = allFeatures.filter(f => f.priority === priority || f.priority === legacy[priority])
          const todo   = group.filter(f => f.status === 'To Do').length
          const inProg = group.filter(f => f.status === 'In Progress').length
          const done   = group.filter(f => f.status === 'Done').length
          const total  = group.length
          const pct    = total > 0 ? Math.round((done / total) * 100) : null
          return { priority, todo, inProg, done, total, pct }
        }).filter(r => r.total > 0)
        if (matrix.length === 0) return null
        const priorityColor = {
          'Must Have': C.danger, 'Should Have': C.warning,
          'Could Have': C.success, "Won't Have": C.textSecondary,
        }
        return (
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>🎯</span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Priority × Delivery Matrix</h3>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textSecondary }}>Are high-priority features being delivered first?</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.primary + '0d', borderBottom: `2px solid ${C.border}` }}>
                  {['Priority', 'To Do', 'In Progress', 'Done', 'Total', 'Delivery %'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Priority' ? 'left' : 'center', fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((r, i) => {
                  const color = priorityColor[r.priority] || C.textSecondary
                  const pctColor = r.pct >= 80 ? C.success : r.pct >= 50 ? C.warning : C.danger
                  return (
                    <tr key={r.priority} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: color + '18', color }}>{r.priority}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: C.textSecondary, fontWeight: 500 }}>{r.todo}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: C.primary, fontWeight: 500 }}>{r.inProg}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: C.success, fontWeight: 600 }}>{r.done}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: C.textPrimary }}>{r.total}</td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        {r.pct === null ? <span style={{ color: C.textSecondary }}>—</span> : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: C.border, borderRadius: 3 }}>
                              <div style={{ height: '100%', width: `${r.pct}%`, background: pctColor, borderRadius: 3, transition: 'width 0.4s' }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: pctColor, minWidth: 36 }}>{r.pct}%</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {matrix[0]?.pct !== null && matrix[0]?.pct < (matrix[matrix.length - 1]?.pct ?? 0) && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: C.danger + '0d', border: `1px solid ${C.danger}25`, borderRadius: 8, fontSize: 12, color: C.danger }}>
                ⚠ Lower-priority features have a higher completion rate than Must Have items — review sprint scope.
              </div>
            )}
          </div>
        )
      })()}

      {/* Cross-Project Benchmarking Table */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Cross-Project Benchmarking</h3>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textSecondary }}>Accuracy % requires actuals to be recorded on each project</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.primary + '0d', borderBottom: `2px solid ${C.border}` }}>
                {['Project', 'Domain', 'Features', 'Completion', 'Risk Density', 'Estimations', 'Est. Accuracy'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Features' || h === 'Estimations' || h === 'Est. Accuracy' || h === 'Risk Density' ? 'center' : 'left', fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: C.textSecondary }}>No projects yet.</td></tr>
              ) : projects.map(p => (
                <BenchmarkRow key={p.id} project={p} actuals={getActuals(p.id)} allProjects={projects} />
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: C.mainBg, borderRadius: 8, fontSize: 11, color: C.textSecondary }}>
          <strong style={{ color: C.textPrimary }}>Risk Density</strong> = total risks ÷ total features &nbsp;|&nbsp;
          <strong style={{ color: C.textPrimary }}>Est. Accuracy</strong> = 1 − |avg estimated effort − actual effort| / actual effort
        </div>
      </div>
    </div>
  )
}
