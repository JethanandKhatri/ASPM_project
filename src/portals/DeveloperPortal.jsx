import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../case-tool/context/ProjectContext'
import { useThemeColors } from '../case-tool/context/ThemeContext'
import { useScrum } from '../case-tool/context/ScrumContext'

function uid() { return Math.random().toString(36).slice(2, 9) }
function todayStr() { return new Date().toISOString().split('T')[0] }

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
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: bg, color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{label}</span>
}

const STATUS_ORDER = ['To Do', 'In Progress', 'Done']

export default function DeveloperPortal() {
  const C = useThemeColors()
  const { profile } = useAuth()
  const { projects, loading } = useProjects()
  const [tab, setTab]   = useState('overview')
  const [form, setForm] = useState({ did: '', will: '', blockers: '' })
  const [submitted, setSubmitted] = useState(false)

  const { sprints, addStandupNote } = useScrum()
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Developer'
  const activeSprint = sprints.find(s => s.status === 'active')

  // My tasks — any task where assignee matches my name or email
  const allTasks = projects.flatMap(p =>
    (p.tasks || []).map(t => ({ ...t, projectName: p.name, projectId: p.id }))
  )
  const myTasks = allTasks.filter(t => {
    const a = (t.assignee || '').toLowerCase()
    return a === displayName.toLowerCase() || a === (profile?.email || '').toLowerCase() || a.includes(displayName.toLowerCase().split(' ')[0])
  })
  const sprintTasks = activeSprint
    ? allTasks.filter(t => activeSprint.taskIds.includes(t.id))
    : myTasks

  const done   = myTasks.filter(t => t.status === 'Done').length
  const inProg = myTasks.filter(t => t.status === 'In Progress').length
  const todo   = myTasks.filter(t => t.status === 'To Do').length
  const pct    = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0

  const daysLeft = activeSprint
    ? Math.max(0, Math.round((new Date(activeSprint.endDate) - new Date()) / 86400000))
    : null

  const TABS = [
    { id: 'overview', label: 'Overview'     },
    { id: 'tasks',    label: `My Tasks (${myTasks.length})` },
    { id: 'board',    label: 'Sprint Board' },
    { id: 'standup',  label: 'Daily Standup'},
  ]

  function submitStandup() {
    if (!form.did.trim()) return
    addStandupNote({ id: uid(), date: todayStr(), memberName: displayName, did: form.did, will: form.will, blockers: form.blockers })
    setSubmitted(true)
  }

  if (loading) {
    return <div style={{ padding: 28, color: C.textSecondary, fontSize: 14 }}>Loading…</div>
  }

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>My Workspace</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>
            {displayName} · {activeSprint ? `Active: ${activeSprint.name}` : 'No active sprint'}
          </p>
        </div>
        {activeSprint && daysLeft !== null && (
          <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: daysLeft <= 2 ? C.danger + '12' : C.primary + '12', color: daysLeft <= 2 ? C.danger : C.primary, border: `1px solid ${daysLeft <= 2 ? C.danger : C.primary}30` }}>
            {daysLeft === 0 ? 'Sprint ends today' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
          </span>
        )}
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
            <MetricCard label="Assigned Tasks"  value={myTasks.length} icon="📋" color={C.primary}        />
            <MetricCard label="In Progress"     value={inProg}         icon="⚡" color={C.warning}        />
            <MetricCard label="Completed"       value={done}           icon="✓"  color={C.success}        />
            <MetricCard label="To Do"           value={todo}           icon="◎"  color={C.textSecondary}  />
          </div>

          <Card style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>My Progress</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textSecondary, marginBottom: 4 }}>
              <span>Task completion</span><span style={{ fontWeight: 600 }}>{done}/{myTasks.length} ({pct}%)</span>
            </div>
            <Bar pct={pct} color={C.success} h={10} />
          </Card>

          {activeSprint && (
            <Card style={{ marginBottom: 16, borderLeft: `4px solid ${C.primary}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Sprint</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{activeSprint.name}</span>
              </div>
              {activeSprint.goal && <p style={{ margin: '0 0 8px', fontSize: 13, color: C.textSecondary }}>Goal: {activeSprint.goal}</p>}
              <div style={{ fontSize: 12, color: C.textSecondary }}>{activeSprint.startDate} → {activeSprint.endDate} · {sprintTasks.length} tasks total</div>
            </Card>
          )}

          <Card>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Recent Tasks</h3>
            {myTasks.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No tasks assigned to you yet. Ask your Scrum Master to assign tasks.</p>
            ) : myTasks.slice(0, 5).map(t => {
              const stColor = t.status === 'Done' ? C.success : t.status === 'In Progress' ? C.primary : C.textSecondary
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: stColor, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{t.projectName}</div>
                  </div>
                  <Badge label={t.status} color={stColor} bg={stColor + '15'} />
                  {t.priority && <Badge label={t.priority} color={t.priority === 'High' ? C.danger : t.priority === 'Medium' ? C.warning : C.success} bg={(t.priority === 'High' ? C.danger : t.priority === 'Medium' ? C.warning : C.success) + '15'} />}
                </div>
              )
            })}
          </Card>
        </>
      )}

      {/* My Tasks */}
      {tab === 'tasks' && (
        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>All My Tasks</h3>
          {myTasks.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No tasks assigned to you. Tasks assigned to "{displayName}" across all projects will appear here.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Task', 'Project', 'Priority', 'Due Date', 'Status'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myTasks.map((t, i) => {
                  const stColor = t.status === 'Done' ? C.success : t.status === 'In Progress' ? C.primary : C.textSecondary
                  const prColor = t.priority === 'High' ? C.danger : t.priority === 'Medium' ? C.warning : C.success
                  return (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                      <td style={{ padding: '11px 12px', fontWeight: 500, color: t.status === 'Done' ? C.textSecondary : C.textPrimary, textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>{t.name}</td>
                      <td style={{ padding: '11px 12px', color: C.textSecondary, fontSize: 12 }}>{t.projectName}</td>
                      <td style={{ padding: '11px 12px' }}>{t.priority && <Badge label={t.priority} color={prColor} bg={prColor + '15'} />}</td>
                      <td style={{ padding: '11px 12px', color: C.textSecondary, fontSize: 12 }}>{t.dueDate || '—'}</td>
                      <td style={{ padding: '11px 12px' }}><Badge label={t.status} color={stColor} bg={stColor + '15'} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Sprint Board */}
      {tab === 'board' && (
        <>
          {!activeSprint ? (
            <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>No active sprint</p>
              <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>The Scrum Master hasn't started a sprint yet.</p>
            </Card>
          ) : (
            <>
              <div style={{ marginBottom: 16, padding: '12px 16px', background: C.primary + '0D', border: `1px solid ${C.primary}25`, borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>{activeSprint.name}</span>
                <span style={{ fontSize: 12, color: C.textSecondary, marginLeft: 12 }}>{activeSprint.startDate} → {activeSprint.endDate} · {sprintTasks.length} tasks</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {STATUS_ORDER.map(status => {
                  const colTasks = sprintTasks.filter(t => t.status === status)
                  const colColor = status === 'Done' ? C.success : status === 'In Progress' ? C.primary : C.textSecondary
                  return (
                    <div key={status} style={{ background: C.mainBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: colColor }}>{status}</span>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: colColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{colTasks.length}</span>
                      </div>
                      {colTasks.length === 0 && <p style={{ margin: 0, fontSize: 12, color: C.textSecondary, textAlign: 'center', padding: '12px 0' }}>Empty</p>}
                      {colTasks.map(t => (
                        <div key={t.id} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: C.textPrimary, marginBottom: 6 }}>{t.name}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, color: C.textSecondary }}>{t.projectName}</span>
                            {t.priority && <Badge label={t.priority} color={t.priority === 'High' ? C.danger : t.priority === 'Medium' ? C.warning : C.success} bg={(t.priority === 'High' ? C.danger : t.priority === 'Medium' ? C.warning : C.success) + '15'} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Daily Standup */}
      {tab === 'standup' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Card>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Daily Standup</h3>
            <p style={{ margin: '0 0 20px', fontSize: 12, color: C.textSecondary }}>{todayStr()} · {displayName}</p>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
                <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: C.success }}>Standup Submitted!</h4>
                <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>Your update has been recorded. The Scrum Master can see it on the Sprint Board.</p>
                <button onClick={() => { setSubmitted(false); setForm({ did: '', will: '', blockers: '' }) }}
                  style={{ marginTop: 16, padding: '8px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Submit Another
                </button>
              </div>
            ) : (
              <>
                {[
                  { key: 'did',      label: 'What did you do yesterday?',  ph: 'Completed login API, reviewed PR #42…' },
                  { key: 'will',     label: 'What will you do today?',     ph: 'Work on dashboard feature, write tests…' },
                  { key: 'blockers', label: 'Any blockers or impediments?', ph: 'None / Waiting for API spec from PM…'    },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>{f.label}</label>
                    <textarea rows={3} placeholder={f.ph} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit', resize: 'vertical', minHeight: 70, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button onClick={submitStandup} disabled={!form.did.trim()}
                  style={{ width: '100%', padding: '11px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: !form.did.trim() ? 0.5 : 1 }}>
                  Submit Standup
                </button>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
