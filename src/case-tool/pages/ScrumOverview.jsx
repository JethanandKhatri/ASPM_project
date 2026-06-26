import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'
import { useScrum } from '../context/ScrumContext'

function todayStr() { return new Date().toISOString().split('T')[0] }

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

// ── Shared atoms ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon, color }) {
  const C = useThemeColors()
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: (color || C.primary) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
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

function SectionTitle({ children }) {
  const C = useThemeColors()
  return <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{children}</h3>
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
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: bg, color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{label}</span>
}

function ReadOnlyBanner() {
  const C = useThemeColors()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: C.primary + '10', border: `1px solid ${C.primary}25`, borderRadius: 8, fontSize: 12, color: C.primary, marginBottom: 20 }}>
      <span>👁</span>
      <span><strong>Read-only view</strong> — This is a live snapshot of the Scrum Master's activity. You cannot edit sprint or standup data from here.</span>
    </div>
  )
}

// ── Sprint Health ─────────────────────────────────────────────────────────────

function SprintHealth({ sprints, allTasks }) {
  const C = useThemeColors()
  const active = sprints.find(s => s.status === 'active')
  const completed = sprints.filter(s => s.status === 'completed')

  if (!active) {
    return (
      <Card style={{ textAlign: 'center', padding: '32px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⚠</div>
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>No Active Sprint</p>
        <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>
          The Scrum Master has not started a sprint yet.
          {completed.length > 0 && ` ${completed.length} sprint(s) previously completed.`}
        </p>
      </Card>
    )
  }

  const spTasks     = allTasks.filter(t => active.taskIds.includes(t.id))
  const done        = spTasks.filter(t => t.status === 'Done').length
  const inProg      = spTasks.filter(t => t.status === 'In Progress').length
  const todo        = spTasks.filter(t => t.status === 'To Do').length
  const total       = spTasks.length
  const pct         = total > 0 ? Math.round((done / total) * 100) : 0
  const totalDays   = daysBetween(active.startDate, active.endDate)
  const elapsed     = Math.min(totalDays, Math.max(0, daysBetween(active.startDate, todayStr())))
  const remaining   = Math.max(0, totalDays - elapsed)
  const timePct     = totalDays > 0 ? Math.round((elapsed / totalDays) * 100) : 0
  const onTrack     = pct >= timePct

  return (
    <Card style={{ marginBottom: 20, borderLeft: `4px solid ${onTrack ? C.success : C.danger}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Sprint</span>
            <Badge label={onTrack ? 'On Track' : 'Behind Schedule'} color={onTrack ? C.success : C.danger} bg={(onTrack ? C.success : C.danger) + '15'} />
          </div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{active.name}</h2>
          {active.goal && <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Goal: {active.goal}</p>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: onTrack ? C.success : C.danger }}>{pct}%</div>
          <div style={{ fontSize: 11, color: C.textSecondary }}>tasks done</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>
            <span>Task completion</span><span style={{ fontWeight: 600 }}>{done}/{total}</span>
          </div>
          <Bar pct={pct} color={onTrack ? C.success : C.danger} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>
            <span>Time elapsed</span><span style={{ fontWeight: 600 }}>{elapsed}/{totalDays} days</span>
          </div>
          <Bar pct={timePct} color={C.primary} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'To Do',       value: todo,      color: C.textSecondary },
          { label: 'In Progress', value: inProg,    color: C.primary       },
          { label: 'Done',        value: done,      color: C.success       },
          { label: 'Days Left',   value: remaining, color: remaining <= 2 ? C.danger : C.warning },
        ].map(s => (
          <div key={s.label} style={{ background: C.mainBg, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: C.textSecondary }}>
        <span>Start: <strong style={{ color: C.textPrimary }}>{active.startDate}</strong></span>
        <span>End: <strong style={{ color: C.textPrimary }}>{active.endDate}</strong></span>
        <span>Total tasks: <strong style={{ color: C.textPrimary }}>{total}</strong></span>
      </div>
    </Card>
  )
}

// ── Velocity ──────────────────────────────────────────────────────────────────

function VelocitySection({ sprints }) {
  const C = useThemeColors()
  const completed = sprints.filter(s => s.status === 'completed')
  const velocities = completed.map(s => ({ name: s.name, count: s.completedTaskCount || 0 }))
  const avg  = velocities.length > 0 ? Math.round(velocities.reduce((s, v) => s + v.count, 0) / velocities.length) : 0
  const maxV = Math.max(...velocities.map(v => v.count), 1)
  const last = velocities[velocities.length - 1]?.count || 0
  const prev = velocities[velocities.length - 2]?.count || 0
  const trend = velocities.length >= 2 ? (last >= prev ? '↑ Improving' : '↓ Declining') : 'Not enough data'
  const trendColor = velocities.length >= 2 ? (last >= prev ? C.success : C.danger) : C.textSecondary

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle>Team Velocity</SectionTitle>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ color: C.textSecondary }}>Avg: <strong style={{ color: C.textPrimary }}>{avg} tasks/sprint</strong></span>
          <span style={{ fontWeight: 600, color: trendColor }}>{trend}</span>
        </div>
      </div>

      {completed.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No completed sprints yet — velocity data will appear here once the Scrum Master completes a sprint.</p>
      ) : (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 140 }}>
          {velocities.map((v, i) => {
            const barH   = Math.max(4, Math.round((v.count / maxV) * 120))
            const isLast = i === velocities.length - 1
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>{v.count}</div>
                <div style={{ width: '100%', height: barH, background: isLast ? C.primary : C.primary + '60', borderRadius: '4px 4px 0 0', transition: 'height 0.4s', position: 'relative' }}>
                  {v.count >= avg && <div style={{ position: 'absolute', top: -2, left: 0, right: 0, height: 2, background: C.success, borderRadius: 2 }} />}
                </div>
                <div style={{ fontSize: 10, color: C.textSecondary, textAlign: 'center' }}>{v.name}</div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ── Standup Summary ───────────────────────────────────────────────────────────

function StandupSummary() {
  const C = useThemeColors()
  const { standupNotes: notes } = useScrum()
  const today = todayStr()

  const last3Dates = [...new Set(notes.map(n => n.date))].sort().reverse().slice(0, 3)
  const byDate = last3Dates.reduce((acc, d) => {
    acc[d] = notes.filter(n => n.date === d)
    return acc
  }, {})

  const allBlockers = notes.filter(n => n.date === today && n.blockers?.trim())
  const totalToday  = notes.filter(n => n.date === today).length

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle>Standup Summary</SectionTitle>
        <span style={{ fontSize: 12, color: C.textSecondary }}>{totalToday} update{totalToday !== 1 ? 's' : ''} today</span>
      </div>

      {allBlockers.length > 0 && (
        <div style={{ background: C.danger + '0D', border: `1px solid ${C.danger}25`, borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.danger, marginBottom: 8 }}>⚠ Active Blockers Today ({allBlockers.length})</div>
          {allBlockers.map(n => (
            <div key={n.id} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, flexShrink: 0 }}>{n.memberName}:</span>
              <span style={{ fontSize: 12, color: C.danger }}>{n.blockers}</span>
            </div>
          ))}
        </div>
      )}

      {last3Dates.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No standup notes logged yet.</p>
      ) : last3Dates.map(date => (
        <div key={date} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            {date === today ? 'Today' : date} — {byDate[date].length} member{byDate[date].length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {byDate[date].map(n => (
              <div key={n.id} style={{ background: C.mainBg, border: `1px solid ${n.blockers?.trim() ? C.danger + '40' : C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>{n.memberName}</div>
                {n.did   && <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 3 }}><strong style={{ color: C.textPrimary }}>Did:</strong> {n.did}</div>}
                {n.will  && <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 3 }}><strong style={{ color: C.textPrimary }}>Will:</strong> {n.will}</div>}
                {n.blockers?.trim() && <div style={{ fontSize: 11, color: C.danger, marginTop: 4 }}><strong>Blocker:</strong> {n.blockers}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </Card>
  )
}

// ── Capacity Overview ─────────────────────────────────────────────────────────

function CapacityOverview({ sprints }) {
  const C = useThemeColors()
  const active = sprints.find(s => s.status === 'active')
  const capacity = active?.capacity || []
  const overloaded    = capacity.filter(m => m.availableDays / m.totalDays < 0.5)
  const underutilized = capacity.filter(m => m.availableDays / m.totalDays >= 0.9)

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle>Team Capacity — {active ? active.name : 'No active sprint'}</SectionTitle>
        {overloaded.length > 0 && (
          <Badge label={`${overloaded.length} at risk`} color={C.danger} bg={C.danger + '12'} />
        )}
      </div>

      {capacity.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No capacity data logged for the active sprint.</p>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            {capacity.map(m => {
              const pct   = m.totalDays > 0 ? Math.round((m.availableDays / m.totalDays) * 100) : 0
              const color = pct < 50 ? C.danger : pct < 80 ? C.warning : C.success
              return (
                <div key={m.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: C.textPrimary }}>{m.name}</span>
                    <span style={{ color: C.textSecondary }}>{m.availableDays}/{m.totalDays} days <strong style={{ color }}>{pct}%</strong></span>
                  </div>
                  <Bar pct={pct} color={color} />
                </div>
              )
            })}
          </div>

          {(overloaded.length > 0 || underutilized.length > 0) && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {overloaded.length > 0 && (
                <div style={{ background: C.danger + '0D', border: `1px solid ${C.danger}25`, borderRadius: 7, padding: '8px 12px', fontSize: 12 }}>
                  <strong style={{ color: C.danger }}>Capacity Risk:</strong>
                  <span style={{ color: C.textSecondary }}> {overloaded.map(m => m.name).join(', ')} under 50% available</span>
                </div>
              )}
              {underutilized.length > 0 && (
                <div style={{ background: C.success + '0D', border: `1px solid ${C.success}25`, borderRadius: 7, padding: '8px 12px', fontSize: 12 }}>
                  <strong style={{ color: C.success }}>Available:</strong>
                  <span style={{ color: C.textSecondary }}> {underutilized.map(m => m.name).join(', ')} have high availability</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

// ── Impediments ───────────────────────────────────────────────────────────────

function ImpedimentsOverview({ allRisks }) {
  const C = useThemeColors()
  const open = allRisks.filter(r => r.status === 'Open' || r.status === 'In Progress')
  const high = open.filter(r => r.priority === 'High')

  const sevC = {
    High:   { color: C.danger,  bg: C.danger  + '15' },
    Medium: { color: C.warning, bg: C.warning + '15' },
    Low:    { color: C.success, bg: C.success + '15' },
  }

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle>Open Impediments</SectionTitle>
        {high.length > 0 && <Badge label={`${high.length} high priority`} color={C.danger} bg={C.danger + '12'} />}
      </div>

      {open.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: C.success + '0D', border: `1px solid ${C.success}25`, borderRadius: 8 }}>
          <span style={{ fontSize: 20 }}>✓</span>
          <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>No open impediments — team is unblocked</span>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {['Impediment', 'Project', 'Priority', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {open.map((r, i) => {
              const sc = sevC[r.priority] || sevC.Medium
              return (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                  <td style={{ padding: '11px 12px', color: C.textPrimary, fontWeight: 500, maxWidth: 300 }}>{r.description}</td>
                  <td style={{ padding: '11px 12px', color: C.textSecondary, fontSize: 12 }}>{r.projectName}</td>
                  <td style={{ padding: '11px 12px' }}><Badge label={r.priority} color={sc.color} bg={sc.bg} /></td>
                  <td style={{ padding: '11px 12px' }}>
                    <Badge label={r.status} color={r.status === 'In Progress' ? C.warning : C.danger} bg={(r.status === 'In Progress' ? C.warning : C.danger) + '12'} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Card>
  )
}

// ── DoD Compliance ────────────────────────────────────────────────────────────

function DoDCompliance({ allFeatures }) {
  const C = useThemeColors()
  const { dodItems, dodChecks: checks } = useScrum()
  const active = dodItems.filter(d => d.enabled)

  if (active.length === 0 || allFeatures.length === 0) {
    return (
      <Card style={{ marginBottom: 20 }}>
        <SectionTitle>Definition of Done Compliance</SectionTitle>
        <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No DoD criteria configured yet.</p>
      </Card>
    )
  }

  const results = allFeatures.map(f => {
    const fc      = checks[f.id] || {}
    const checked = active.filter(d => fc[d.id]).length
    const pct     = Math.round((checked / active.length) * 100)
    return { ...f, checked, total: active.length, pct }
  })

  const shippable   = results.filter(f => f.pct === 100).length
  const avgPct      = results.length > 0 ? Math.round(results.reduce((s, f) => s + f.pct, 0) / results.length) : 0
  const notShippable = results.filter(f => f.pct < 100)

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle>Definition of Done Compliance</SectionTitle>
        <span style={{ fontSize: 12, color: C.textSecondary }}>{shippable}/{results.length} features shippable</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        <div style={{ background: C.mainBg, borderRadius: 8, padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.success }}>{shippable}</div>
          <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>Shippable (100% DoD)</div>
        </div>
        <div style={{ background: C.mainBg, borderRadius: 8, padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.warning }}>{results.length - shippable}</div>
          <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>Not Ready</div>
        </div>
        <div style={{ background: C.mainBg, borderRadius: 8, padding: '14px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: avgPct >= 80 ? C.success : avgPct >= 50 ? C.warning : C.danger }}>{avgPct}%</div>
          <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>Avg Compliance</div>
        </div>
      </div>

      {notShippable.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Features not yet shippable</div>
          {notShippable.slice(0, 8).map(f => (
            <div key={f.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 500, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{f.name}</span>
                <span style={{ color: C.textSecondary, flexShrink: 0 }}>{f.checked}/{f.total} criteria · <strong style={{ color: f.pct >= 80 ? C.warning : C.danger }}>{f.pct}%</strong></span>
              </div>
              <Bar pct={f.pct} color={f.pct >= 80 ? C.warning : C.danger} h={5} />
            </div>
          ))}
        </>
      )}

      {shippable > 0 && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: C.success + '0D', border: `1px solid ${C.success}25`, borderRadius: 8, fontSize: 12, color: C.success }}>
          ✓ <strong>{shippable} feature{shippable !== 1 ? 's' : ''}</strong> have met all DoD criteria and are ready to ship.
        </div>
      )}
    </Card>
  )
}

// ── Sprint History ────────────────────────────────────────────────────────────

function SprintHistory({ sprints, allTasks }) {
  const C = useThemeColors()
  const completed = [...sprints.filter(s => s.status === 'completed')].reverse()

  if (completed.length === 0) return null

  return (
    <Card>
      <SectionTitle>Sprint History</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${C.border}` }}>
            {['Sprint', 'Dates', 'Tasks Completed', 'Goal'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {completed.map((s, i) => (
            <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
              <td style={{ padding: '11px 12px', fontWeight: 600, color: C.textPrimary }}>{s.name}</td>
              <td style={{ padding: '11px 12px', color: C.textSecondary, fontSize: 12 }}>{s.startDate} → {s.endDate}</td>
              <td style={{ padding: '11px 12px' }}>
                <Badge label={`${s.completedTaskCount || 0} tasks`} color={C.success} bg={C.success + '15'} />
              </td>
              <td style={{ padding: '11px 12px', color: C.textSecondary, fontSize: 12 }}>{s.goal || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function ScrumOverview() {
  const C = useThemeColors()
  const { projects, loading } = useProjects()
  const { sprints, standupNotes, scrumLoading } = useScrum()

  const allTasks    = projects.flatMap(p => (p.tasks    || []).map(t => ({ ...t, projectName: p.name })))
  const allFeatures = projects.flatMap(p => (p.features || []).map(f => ({ ...f, projectName: p.name })))
  const allRisks    = projects.flatMap(p => (p.risks    || []).map(r => ({ ...r, projectName: p.name })))

  const activeSprint    = sprints.find(s => s.status === 'active')
  const openImpediments = allRisks.filter(r => r.status === 'Open' || r.status === 'In Progress').length
  const todayNotes      = standupNotes.filter(n => n.date === todayStr())
  const todayBlockers   = todayNotes.filter(n => n.blockers?.trim())
  const completed       = sprints.filter(s => s.status === 'completed')

  if (loading || scrumLoading) {
    return (
      <div style={{ padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <p style={{ color: C.textSecondary, fontSize: 14 }}>Loading scrum data…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Scrum Overview</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>
            Live view of Scrum Master activity across all projects
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {todayBlockers.length > 0 && (
            <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}30` }}>
              {todayBlockers.length} blocker{todayBlockers.length !== 1 ? 's' : ''} today
            </span>
          )}
          {openImpediments > 0 && (
            <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: C.warning + '15', color: C.warning, border: `1px solid ${C.warning}30` }}>
              {openImpediments} open impediment{openImpediments !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <ReadOnlyBanner />

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <MetricCard label="Active Sprint"     value={activeSprint ? activeSprint.name : 'None'}       icon="▣" color={activeSprint ? C.primary : C.textSecondary} />
        <MetricCard label="Sprints Completed" value={completed.length}                                icon="✓" color={C.success} />
        <MetricCard label="Standup Today"     value={`${todayNotes.length} members`}                  icon="📋" color={C.primary} sub={todayBlockers.length > 0 ? `${todayBlockers.length} blockers` : 'No blockers'} />
        <MetricCard label="Open Impediments"  value={openImpediments}                                 icon="⚠" color={openImpediments > 0 ? C.danger : C.success} sub={openImpediments === 0 ? 'All clear' : 'Need attention'} />
      </div>

      {/* Sprint Health */}
      <SprintHealth sprints={sprints} allTasks={allTasks} />

      {/* 2-column: Velocity + Standup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 0 }}>
        <VelocitySection sprints={sprints} />
        <StandupSummary />
      </div>

      {/* Capacity + Impediments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <CapacityOverview sprints={sprints} />
        <ImpedimentsOverview allRisks={allRisks} />
      </div>

      {/* DoD Compliance */}
      <DoDCompliance allFeatures={allFeatures} />

      {/* Sprint History */}
      <SprintHistory sprints={sprints} allTasks={allTasks} />
    </div>
  )
}
