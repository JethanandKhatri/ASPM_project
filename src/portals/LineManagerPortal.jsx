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
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: bg, color }}>{label}</span>
}

export default function LineManagerPortal() {
  const C = useThemeColors()
  const { projects, loading } = useProjects()
  const { sprints, standupNotes: standups, scrumLoading } = useScrum()
  const [tab, setTab] = useState('overview')

  const allTasks = projects.flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name })))
  const allRisks = projects.flatMap(p => (p.risks || []).map(r => ({ ...r, projectName: p.name })))

  // Build team roster from standup names + task assignees
  const memberMap = useMemo(() => {
    const map = new Map()
    standups.forEach(s => {
      if (!s.memberName) return
      if (!map.has(s.memberName)) map.set(s.memberName, { name: s.memberName, standupCount: 0, blockers: 0 })
      const m = map.get(s.memberName)
      m.standupCount += 1
      if (s.blockers && s.blockers.toLowerCase() !== 'none' && s.blockers.trim() !== '') m.blockers += 1
    })
    allTasks.forEach(t => {
      if (t.assignee && !map.has(t.assignee)) map.set(t.assignee, { name: t.assignee, standupCount: 0, blockers: 0 })
    })
    return map
  }, [standups, allTasks])
  const teamMembers = Array.from(memberMap.values())

  const velocityData = useMemo(() => {
    return sprints
      .filter(s => s.status === 'completed' || s.completedTaskCount !== undefined)
      .map(s => ({ name: s.name, completed: s.completedTaskCount || 0, capacity: s.capacity || 0 }))
      .slice(-6)
  }, [sprints])

  const activeSprint   = sprints.find(s => s.status === 'active')
  const activeProjects = projects.filter(p => p.status === 'Active')
  const highRisks      = allRisks.filter(r => r.priority === 'High' && r.status !== 'Resolved')
  const avgVelocity    = velocityData.length
    ? Math.round(velocityData.reduce((a, b) => a + b.completed, 0) / velocityData.length)
    : 0

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'team',     label: `Team (${teamMembers.length})` },
    { id: 'projects', label: `Projects (${projects.length})` },
    { id: 'velocity', label: 'Velocity' },
  ]

  if (loading || scrumLoading) return <div style={{ padding: 28, color: C.textSecondary, fontSize: 14 }}>Loading…</div>

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Team Management</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>
          Line Manager view · {activeProjects.length} active project{activeProjects.length !== 1 ? 's' : ''} · {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
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
            <MetricCard label="Active Projects" value={activeProjects.length} icon="◈" color={C.primary}  sub={`${projects.length} total`}     />
            <MetricCard label="Team Members"    value={teamMembers.length}    icon="◉" color={C.success}  sub="across all projects"             />
            <MetricCard label="Avg Velocity"    value={avgVelocity}           icon="◈" color={C.warning}  sub={`${velocityData.length} sprints`} />
            <MetricCard label="High Risks"      value={highRisks.length}      icon="⚠" color={C.danger}   sub="unresolved"                      />
          </div>

          {activeSprint && (
            <Card style={{ marginBottom: 16, borderLeft: `4px solid ${C.primary}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Sprint</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{activeSprint.name}</span>
                </div>
                <span style={{ fontSize: 12, color: C.textSecondary }}>{activeSprint.startDate} → {activeSprint.endDate}</span>
              </div>
              {activeSprint.goal && <p style={{ margin: '0 0 10px', fontSize: 13, color: C.textSecondary }}>Goal: {activeSprint.goal}</p>}
              {activeSprint.capacity > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>
                    <span>Capacity utilisation</span>
                    <span style={{ fontWeight: 600 }}>{activeSprint.completedTaskCount || 0}/{activeSprint.capacity}</span>
                  </div>
                  <Bar pct={((activeSprint.completedTaskCount || 0) / activeSprint.capacity) * 100} color={C.primary} h={8} />
                </div>
              )}
            </Card>
          )}

          <Card>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Project Health</h3>
            {projects.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No projects yet.</p>
            ) : projects.map(p => {
              const tasks   = p.tasks || []
              const done    = tasks.filter(t => t.status === 'Done').length
              const pct     = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
              const risks   = (p.risks || []).filter(r => r.priority === 'High' && r.status !== 'Resolved').length
              const stColor = p.status === 'Active' ? C.primary : p.status === 'Completed' ? C.success : C.warning
              return (
                <div key={p.id} style={{ padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{p.name}</span>
                      <Badge label={p.status} color={stColor} bg={stColor + '15'} />
                      {risks > 0 && <Badge label={`${risks} risk${risks > 1 ? 's' : ''}`} color={C.danger} bg={C.danger + '12'} />}
                    </div>
                    <span style={{ fontSize: 12, color: C.textSecondary }}>{done}/{tasks.length} tasks · {pct}%</span>
                  </div>
                  <Bar pct={pct} color={pct >= 70 ? C.success : pct >= 40 ? C.warning : C.primary} h={6} />
                </div>
              )
            })}
          </Card>
        </>
      )}

      {/* Team Tab */}
      {tab === 'team' && (
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Team Roster</h3>
          {teamMembers.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>
              No team data available yet. Members appear here when tasks are assigned to them or they submit standup notes.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Member', 'Tasks Assigned', 'Done', 'In Progress', 'Standups', 'Blockers'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((m, i) => {
                  const assigned = allTasks.filter(t => (t.assignee || '').toLowerCase() === m.name.toLowerCase())
                  const done     = assigned.filter(t => t.status === 'Done').length
                  const inProg   = assigned.filter(t => t.status === 'In Progress').length
                  const initial  = m.name.trim()[0]?.toUpperCase() || '?'
                  return (
                    <tr key={m.name} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                      <td style={{ padding: '11px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.primary + '20', color: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initial}</div>
                          <span style={{ fontWeight: 500, color: C.textPrimary }}>{m.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 12px', color: C.textPrimary }}>{assigned.length}</td>
                      <td style={{ padding: '11px 12px' }}><Badge label={String(done)}   color={C.success} bg={C.success + '15'} /></td>
                      <td style={{ padding: '11px 12px' }}><Badge label={String(inProg)} color={C.primary} bg={C.primary + '15'} /></td>
                      <td style={{ padding: '11px 12px', color: C.textSecondary }}>{m.standupCount}</td>
                      <td style={{ padding: '11px 12px' }}>
                        {m.blockers > 0
                          ? <Badge label={`${m.blockers} blocker${m.blockers > 1 ? 's' : ''}`} color={C.danger} bg={C.danger + '12'} />
                          : <span style={{ color: C.textSecondary, fontSize: 12 }}>None</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Projects Tab */}
      {tab === 'projects' && (
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>All Projects</h3>
          {projects.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No projects in the system yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Project', 'Domain', 'Status', 'Team Size', 'Features', 'Deadline', 'Risks'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const stColor = p.status === 'Active' ? C.primary : p.status === 'Completed' ? C.success : C.warning
                  const feats   = (p.features || []).length
                  const done    = (p.features || []).filter(f => f.status === 'Done').length
                  const risks   = (p.risks || []).filter(r => r.status !== 'Resolved').length
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                      <td style={{ padding: '11px 12px', fontWeight: 600, color: C.textPrimary }}>{p.name}</td>
                      <td style={{ padding: '11px 12px' }}><Badge label={p.domain || '—'} color={C.primary} bg={C.primary + '12'} /></td>
                      <td style={{ padding: '11px 12px' }}><Badge label={p.status}        color={stColor}   bg={stColor + '15'}    /></td>
                      <td style={{ padding: '11px 12px', color: C.textSecondary }}>{p.teamSize || '—'}</td>
                      <td style={{ padding: '11px 12px', color: C.textSecondary }}>{done}/{feats} done</td>
                      <td style={{ padding: '11px 12px', color: C.textSecondary, fontSize: 12 }}>{p.deadline || '—'}</td>
                      <td style={{ padding: '11px 12px' }}>
                        {risks > 0
                          ? <Badge label={`${risks} open`} color={C.danger}  bg={C.danger + '12'}  />
                          : <Badge label="clear"           color={C.success} bg={C.success + '12'} />
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Velocity Tab */}
      {tab === 'velocity' && (
        <Card>
          <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Sprint Velocity</h3>
          <p style={{ margin: '0 0 20px', fontSize: 12, color: C.textSecondary }}>Completed tasks vs capacity per sprint</p>
          {velocityData.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No completed sprints yet.</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'Avg Velocity',   value: avgVelocity,                                               color: C.primary },
                  { label: 'Best Sprint',     value: Math.max(...velocityData.map(s => s.completed)),           color: C.success },
                  { label: 'Total Completed', value: velocityData.reduce((a, b) => a + b.completed, 0),         color: C.warning },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'center', padding: '14px', background: m.color + '0D', border: `1px solid ${m.color}25`, borderRadius: 8 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, padding: '0 0 8px' }}>
                {velocityData.map(s => {
                  const maxVal      = Math.max(...velocityData.map(x => Math.max(x.completed, x.capacity)), 1)
                  const completedH  = Math.max(4, (s.completed / maxVal) * 130)
                  const capacityH   = Math.max(4, (s.capacity  / maxVal) * 130)
                  return (
                    <div key={s.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: 2, height: 140 }}>
                        {s.capacity > 0 && (
                          <div style={{ flex: 1, height: capacityH, background: C.border, borderRadius: '3px 3px 0 0' }} title={`Capacity: ${s.capacity}`} />
                        )}
                        <div style={{ flex: 1, height: completedH, background: C.primary, borderRadius: '3px 3px 0 0' }} title={`Completed: ${s.completed}`} />
                      </div>
                      <div style={{ fontSize: 10, color: C.textSecondary, textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>{s.completed}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textSecondary }}><div style={{ width: 12, height: 12, borderRadius: 2, background: C.primary }} /> Completed</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.textSecondary }}><div style={{ width: 12, height: 12, borderRadius: 2, background: C.border  }} /> Capacity</div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
