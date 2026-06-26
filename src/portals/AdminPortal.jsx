import { useState, useMemo } from 'react'
import { useProjects } from '../case-tool/context/ProjectContext'
import { useThemeColors } from '../case-tool/context/ThemeContext'
import { useScrum } from '../case-tool/context/ScrumContext'

function MetricCard({ label, value, sub, icon, color }) {
  const C = useThemeColors()
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: (color || C.primary) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color || C.primary, marginTop: 1, fontWeight: 500 }}>{sub}</div>}
      </div>
    </div>
  )
}

function Card({ children, style }) {
  const C = useThemeColors()
  return <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>
}

function Bar({ pct, color, h = 7 }) {
  const C = useThemeColors()
  return (
    <div style={{ height: h, background: C.border, borderRadius: h / 2 }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: h / 2, transition: 'width 0.4s' }} />
    </div>
  )
}

function Badge({ label, color, bg }) {
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: bg, color, whiteSpace: 'nowrap' }}>{label}</span>
}

function parseCost(costStr) {
  if (!costStr) return 0
  const n = parseFloat(String(costStr).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

export default function AdminPortal() {
  const C = useThemeColors()
  const { projects, loading } = useProjects()
  const { sprints, scrumLoading } = useScrum()
  const [tab, setTab] = useState('overview')

  const allTasks    = projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name })))
  const allRisks    = projects.flatMap(p => (p.risks || []).map(r => ({ ...r, projectName: p.name })))
  const allFeatures = projects.flatMap(p => (p.features || []).map(f => ({ ...f, projectName: p.name })))

  const totalAllocated = useMemo(() =>
    projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  [projects])
  const totalEstimated = useMemo(() =>
    projects.flatMap(p => p.estimations || []).reduce((sum, e) => sum + parseCost(e.cost), 0),
  [projects])

  const milestones = useMemo(() => {
    const list = []
    projects.forEach(p => {
      if (p.deadline) list.push({ label: `${p.name} — Deadline`, date: p.deadline, type: 'deadline', project: p.name })
      if (p.startDate) list.push({ label: `${p.name} — Start`, date: p.startDate, type: 'start', project: p.name })
    })
    sprints.forEach(s => {
      if (s.endDate) list.push({ label: `Sprint: ${s.name}`, date: s.endDate, type: 'sprint', project: 'Scrum' })
    })
    return list.sort((a, b) => a.date.localeCompare(b.date))
  }, [projects, sprints])

  const active    = projects.filter(p => p.status === 'Active').length
  const completed = projects.filter(p => p.status === 'Completed').length
  const onHold    = projects.filter(p => p.status === 'On Hold').length
  const openRisks = allRisks.filter(r => r.status !== 'Resolved').length

  const TABS = [
    { id: 'overview',   label: 'Overview' },
    { id: 'portfolio',  label: `Portfolio (${projects.length})` },
    { id: 'milestones', label: `Milestones (${milestones.length})` },
    { id: 'budget',     label: 'Budget' },
  ]

  if (loading || scrumLoading) return <div style={{ padding: 28, color: C.textSecondary, fontSize: 14 }}>Loading…</div>

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Admin Dashboard</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>
          Portfolio overview · {projects.length} project{projects.length !== 1 ? 's' : ''} · {active} active
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: `2px solid ${C.border}`, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, fontFamily: 'inherit', color: tab === t.id ? C.primary : C.textSecondary, borderBottom: tab === t.id ? `2px solid ${C.primary}` : '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            <MetricCard label="Total Projects"  value={projects.length}           icon="📂" color={C.primary}  sub={`${active} active`}         />
            <MetricCard label="Completed"       value={completed}                 icon="✓"  color={C.success}  sub={`${onHold} on hold`}        />
            <MetricCard label="Open Risks"      value={openRisks}                 icon="⚠" color={C.danger}   sub="across all projects"         />
            <MetricCard label="Allocated Budget" value={totalAllocated > 0 ? `$${(totalAllocated/1000).toFixed(0)}k` : '—'} icon="💰" color={C.warning} sub="across all projects" />
          </div>

          {/* Domain distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Card>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Status Distribution</h3>
              {[
                { label: 'Active',    count: active,    color: C.primary },
                { label: 'Completed', count: completed, color: C.success },
                { label: 'On Hold',   count: onHold,    color: C.warning },
              ].map(s => (
                <div key={s.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>
                    <span>{s.label}</span><span style={{ fontWeight: 600, color: C.textPrimary }}>{s.count}</span>
                  </div>
                  <Bar pct={projects.length > 0 ? (s.count / projects.length) * 100 : 0} color={s.color} h={7} />
                </div>
              ))}
            </Card>

            <Card>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Feature Progress</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Done',        count: allFeatures.filter(f => f.status === 'Done').length,        color: C.success },
                  { label: 'In Progress', count: allFeatures.filter(f => f.status === 'In Progress').length, color: C.primary },
                  { label: 'To Do',       count: allFeatures.filter(f => f.status === 'To Do').length,       color: C.textSecondary },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: C.mainBg, borderRadius: 6, fontSize: 13 }}>
                    <span style={{ color: C.textPrimary }}>{s.label}</span>
                    <span style={{ fontWeight: 700, color: s.color }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sprint summary */}
          <Card>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Sprint Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Total Sprints',     value: sprints.length,                                   color: C.primary },
                { label: 'Active Sprints',    value: sprints.filter(s => s.status === 'active').length, color: C.success },
                { label: 'Completed Sprints', value: sprints.filter(s => s.status === 'completed').length, color: C.warning },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center', padding: '14px', background: m.color + '0D', border: `1px solid ${m.color}25`, borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Portfolio Tab */}
      {tab === 'portfolio' && (
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Project Portfolio</h3>
          {projects.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No projects in the system yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Project', 'Domain', 'Status', 'Team', 'Progress', 'Risks', 'Estimations', 'Deadline'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const stColor   = p.status === 'Active' ? C.primary : p.status === 'Completed' ? C.success : C.warning
                  const feats     = (p.features || []).length
                  const done      = (p.features || []).filter(f => f.status === 'Done').length
                  const pct       = feats > 0 ? Math.round((done / feats) * 100) : 0
                  const openR     = (p.risks || []).filter(r => r.status !== 'Resolved').length
                  const estCount  = (p.estimations || []).length
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                      <td style={{ padding: '10px 10px', fontWeight: 600, color: C.textPrimary, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                      <td style={{ padding: '10px 10px' }}><Badge label={p.domain || '—'} color={C.primary} bg={C.primary + '12'} /></td>
                      <td style={{ padding: '10px 10px' }}><Badge label={p.status}        color={stColor}   bg={stColor + '15'}    /></td>
                      <td style={{ padding: '10px 10px', color: C.textSecondary }}>{p.teamSize || '—'}</td>
                      <td style={{ padding: '10px 10px', minWidth: 80 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1 }}><Bar pct={pct} color={pct >= 70 ? C.success : pct >= 40 ? C.warning : C.primary} h={5} /></div>
                          <span style={{ fontSize: 11, color: C.textSecondary, flexShrink: 0 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        {openR > 0
                          ? <Badge label={`${openR} open`} color={C.danger}  bg={C.danger + '12'}  />
                          : <Badge label="clear"           color={C.success} bg={C.success + '12'} />
                        }
                      </td>
                      <td style={{ padding: '10px 10px', color: C.textSecondary }}>{estCount}</td>
                      <td style={{ padding: '10px 10px', color: C.textSecondary, fontSize: 12 }}>{p.deadline || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Milestones Tab */}
      {tab === 'milestones' && (
        <Card>
          <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Milestones</h3>
          <p style={{ margin: '0 0 20px', fontSize: 12, color: C.textSecondary }}>Project start dates, deadlines, and sprint end dates — sorted chronologically</p>
          {milestones.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No milestones yet. Create projects with start dates and deadlines to see them here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {milestones.map((m, i) => {
                const today   = new Date().toISOString().split('T')[0]
                const isPast  = m.date < today
                const isToday = m.date === today
                const typeColor = m.type === 'deadline' ? C.danger : m.type === 'sprint' ? C.primary : C.success
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: isToday ? C.warning + '0D' : C.mainBg, border: `1px solid ${isToday ? C.warning + '50' : C.border}`, borderRadius: 8, opacity: isPast && !isToday ? 0.6 : 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: typeColor + '15', color: typeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {m.type === 'deadline' ? '🏁' : m.type === 'sprint' ? '🔄' : '🚀'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{m.project}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{m.date}</div>
                      {isToday && <div style={{ fontSize: 10, color: C.warning, fontWeight: 600, marginTop: 2 }}>TODAY</div>}
                      {isPast && !isToday && <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 2 }}>Past</div>}
                      {!isPast && !isToday && (
                        <div style={{ fontSize: 10, color: typeColor, marginTop: 2 }}>
                          {Math.ceil((new Date(m.date) - new Date()) / 86400000)}d away
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* Budget Tab */}
      {tab === 'budget' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
            <MetricCard label="Total Allocated"    value={totalAllocated > 0 ? `$${totalAllocated.toLocaleString()}` : '—'} icon="💰" color={C.primary} sub="from project budgets"  />
            <MetricCard label="Est. Total Cost"    value={totalEstimated > 0 ? `$${totalEstimated.toLocaleString()}` : '—'} icon="📊" color={C.warning} sub="from estimations"       />
            <MetricCard label="Projects w/ Budget" value={projects.filter(p => (p.budget || 0) > 0).length}                 icon="✓"  color={C.success} sub="have allocated budget"  />
          </div>

          <Card>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Budget Breakdown by Project</h3>
            {projects.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No projects yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {['Project', 'Allocated Budget', 'Est. Runs', 'Latest Technique', 'Latest Cost', 'Variance'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => {
                    const ests      = p.estimations || []
                    const latest    = ests[ests.length - 1]
                    const estCost   = parseCost(latest?.cost)
                    const allocated = p.budget || 0
                    const variance  = allocated > 0 && estCost > 0 ? ((estCost - allocated) / allocated * 100) : null
                    const varColor  = variance === null ? C.textSecondary : Math.abs(variance) < 15 ? C.success : Math.abs(variance) < 30 ? C.warning : C.danger
                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                        <td style={{ padding: '11px 12px', fontWeight: 600, color: C.textPrimary }}>{p.name}</td>
                        <td style={{ padding: '11px 12px', fontWeight: allocated > 0 ? 600 : 400, color: allocated > 0 ? C.primary : C.textSecondary }}>
                          {allocated > 0 ? `$${allocated.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ padding: '11px 12px', color: C.textSecondary }}>{ests.length}</td>
                        <td style={{ padding: '11px 12px' }}>
                          {latest ? <Badge label={latest.technique} color={C.primary} bg={C.primary + '12'} /> : <span style={{ color: C.textSecondary }}>—</span>}
                        </td>
                        <td style={{ padding: '11px 12px', fontWeight: estCost > 0 ? 600 : 400, color: estCost > 0 ? C.warning : C.textSecondary }}>
                          {estCost > 0 ? `$${estCost.toLocaleString()}` : '—'}
                        </td>
                        <td style={{ padding: '11px 12px', fontWeight: 600, color: varColor }}>
                          {variance === null ? '—' : `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
