import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../case-tool/context/ProjectContext'
import { useThemeColors } from '../case-tool/context/ThemeContext'
import { useScrum } from '../case-tool/context/ScrumContext'

// ── Utilities ──────────────────────────────────────────────────────────────────
function uid()             { return Math.random().toString(36).slice(2, 9) }
function todayStr()        { return new Date().toISOString().split('T')[0] }
function initials(n = '')  { return (n||'').split(' ').map(w => w[0]||'').join('').slice(0,2).toUpperCase()||'?' }
function isOverdue(d)      { return d && d < todayStr() }
function daysLeft(end) {
  if (!end) return null
  return Math.ceil((new Date(end) - new Date(todayStr())) / 86400000)
}
function pColor(p, C) {
  return p === 'High' ? C.danger : p === 'Medium' ? C.warning : C.success
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_CYCLE  = { 'To Do': 'In Progress', 'In Progress': 'Done', 'Done': 'To Do' }
const RETRO_CATS    = [
  { id: 'good',    label: 'What went well?',  ck: 'success' },
  { id: 'improve', label: 'What to improve?', ck: 'warning' },
  { id: 'action',  label: 'Action items',     ck: 'primary' },
]
const RETRO_DEFAULTS = {
  good:    ['Good team communication', 'Stand-ups stayed on time', 'PR reviews were fast'],
  improve: ['Estimate accuracy can be improved', 'Documentation needs updates'],
  action:  ['Set up automated tests', 'Run a DoD review session'],
}
function lsGet(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb } catch { return fb } }
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

// ── Shared atoms ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon, color, C }) {
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 9, background: (color||C.primary)+'18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color||C.primary, marginTop: 1, fontWeight: 600 }}>{sub}</div>}
      </div>
    </div>
  )
}
function Card({ children, style, C }) {
  return <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>
}
function SecTitle({ children, action, C }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{children}</h3>
      {action}
    </div>
  )
}
function Badge({ label, color, bg }) {
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: bg, color, textTransform: 'capitalize', whiteSpace: 'nowrap', display: 'inline-block' }}>{label}</span>
}
function Bar({ pct, color, h = 7, C }) {
  return (
    <div style={{ height: h, background: C.border, borderRadius: h/2 }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: color, borderRadius: h/2, transition: 'width .4s' }} />
    </div>
  )
}
function Modal({ title, onClose, children, width = 560, C }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.cardBg, borderRadius: 14, width, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.35)', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.cardBg, zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.textSecondary, padding: '0 4px', lineHeight: 1, fontFamily: 'inherit' }}>×</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  )
}
function MiniRing({ todo, inProg, done, C, size = 64 }) {
  const total = todo + inProg + done || 1
  const d = done   / total * 360
  const p = inProg / total * 360
  const pct = Math.round(done / total * 100)
  const grad = `conic-gradient(${C.success} 0deg ${d}deg, ${C.primary} ${d}deg ${d+p}deg, ${C.border} ${d+p}deg 360deg)`
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: grad, position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '23%', left: '23%', right: '23%', bottom: '23%', background: C.cardBg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size*.19), fontWeight: 700, color: C.textPrimary }}>{pct}%</div>
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, C, onStatusChange, onClick }) {
  const [hov, setHov] = useState(false)
  const pc      = pColor(task.priority, C)
  const overdue = isOverdue(task.dueDate) && task.status !== 'Done'
  return (
    <div onClick={() => onClick && onClick(task)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.cardBg, border: `1px solid ${hov ? C.primary+'60' : C.border}`, borderLeft: `3px solid ${pc}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8, cursor: 'pointer', boxShadow: hov ? '0 4px 14px rgba(0,0,0,.12)' : 'none', transition: 'box-shadow .15s,border-color .15s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
        <Badge label={task.priority||'Low'} color={pc} bg={pc+'18'} />
        <span style={{ fontSize: 10, color: C.textSecondary, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.projectName}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 5, lineHeight: 1.4 }}>{task.name}</div>
      {task.feature && <div style={{ fontSize: 11, color: C.primary, background: C.primary+'10', padding: '2px 7px', borderRadius: 4, display: 'inline-block', marginBottom: 6 }}>{task.feature}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        {task.assignee
          ? <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.primary+'22', color: C.primary, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={task.assignee}>{initials(task.assignee)}</div>
          : <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.warning+'15', border: `1px dashed ${C.warning}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Unassigned"><span style={{ fontSize: 12, color: C.warning }}>?</span></div>
        }
        {task.dueDate && <span style={{ fontSize: 11, color: overdue ? C.danger : C.textSecondary, fontWeight: overdue ? 600 : 400 }}>{overdue ? '⚠ ' : ''}{task.dueDate}</span>}
      </div>
      {onStatusChange && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
          <button onClick={e => { e.stopPropagation(); onStatusChange(task.projectId, task.id, STATUS_CYCLE[task.status]||'In Progress') }}
            style={{ width: '100%', padding: '5px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>
            → {STATUS_CYCLE[task.status]||'In Progress'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Sprint Health Panel ───────────────────────────────────────────────────────
function SprintHealthPanel({ sprint, allTasks, standupNotes, teamMembers, C }) {
  if (!sprint) return (
    <div style={{ background: C.cardBg, border: `2px dashed ${C.border}`, borderRadius: 12, padding: '28px 24px', marginBottom: 20, textAlign: 'center' }}>
      <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>No Active Sprint</p>
      <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>Go to the Sprints tab to create and start a sprint.</p>
    </div>
  )
  const spTasks    = allTasks.filter(t => sprint.taskIds?.includes(t.id))
  const todo       = spTasks.filter(t => t.status === 'To Do').length
  const inProg     = spTasks.filter(t => t.status === 'In Progress').length
  const done       = spTasks.filter(t => t.status === 'Done').length
  const overdue    = spTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Done').length
  const unassigned = spTasks.filter(t => !t.assignee).length
  const dr         = daysLeft(sprint.endDate)
  const dayColor   = dr === null ? C.textSecondary : dr < 0 ? C.danger : dr <= 2 ? C.danger : dr <= 5 ? C.warning : C.success
  const dayLabel   = dr === null ? '—' : dr < 0 ? `${Math.abs(dr)}d overdue` : dr === 0 ? 'Ends today' : `${dr}d left`

  const todayNotes  = standupNotes.filter(n => n.date === todayStr())
  const loggedNames = new Set(todayNotes.map(n => n.memberName))
  const standupPct  = teamMembers.length > 0 ? (loggedNames.size / teamMembers.length * 100) : 0

  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
      {/* Sprint goal row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 3 }}>Sprint Goal — {sprint.name}</div>
          <div style={{ fontSize: 14, fontWeight: sprint.goal ? 600 : 400, color: sprint.goal ? C.textPrimary : C.textSecondary, fontStyle: sprint.goal ? 'normal' : 'italic', lineHeight: 1.4 }}>
            {sprint.goal || 'No goal set for this sprint'}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 2 }}>Time Remaining</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: dayColor, lineHeight: 1.1 }}>{dayLabel}</div>
          <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{sprint.startDate} → {sprint.endDate}</div>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(4,1fr) auto', gap: 14, alignItems: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
        <MiniRing todo={todo} inProg={inProg} done={done} C={C} size={62} />
        {[
          { label: 'To Do',       val: todo,   color: C.textSecondary },
          { label: 'In Progress', val: inProg,  color: C.primary       },
          { label: 'Done',        val: done,    color: C.success       },
          { label: 'Overdue',     val: overdue, color: overdue > 0 ? C.danger : C.textSecondary },
        ].map(m => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color, lineHeight: 1.1 }}>{m.val}</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{m.label}</div>
          </div>
        ))}
        {/* Standup today */}
        <div style={{ background: C.mainBg, borderRadius: 9, padding: '10px 14px', border: `1px solid ${C.border}`, minWidth: 130 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 5 }}>Today's Standup</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: standupPct === 100 ? C.success : C.textPrimary, marginBottom: 4 }}>
            {loggedNames.size}/{teamMembers.length} logged
          </div>
          <Bar pct={standupPct} color={standupPct === 100 ? C.success : standupPct >= 60 ? C.warning : C.danger} C={C} h={4} />
        </div>
      </div>

      {/* Warning chips */}
      {(overdue > 0 || unassigned > 0) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {overdue > 0 && <span style={{ padding: '3px 12px', background: C.danger+'10', border: `1px solid ${C.danger}25`, borderRadius: 20, fontSize: 11, color: C.danger, fontWeight: 600 }}>⚠ {overdue} overdue task{overdue !== 1?'s':''}</span>}
          {unassigned > 0 && <span style={{ padding: '3px 12px', background: C.warning+'10', border: `1px solid ${C.warning}25`, borderRadius: 20, fontSize: 11, color: C.warning, fontWeight: 600 }}>○ {unassigned} unassigned task{unassigned !== 1?'s':''}</span>}
        </div>
      )}
    </div>
  )
}

// ── BOARD TAB ─────────────────────────────────────────────────────────────────
function BoardTab({ allTasks, sprints, projects, standupNotes, teamMembers }) {
  const C = useThemeColors()
  const { updateTaskStatus } = useProjects()
  const activeSprint  = sprints.find(s => s.status === 'active')
  const [selSprint,   setSelSprint]   = useState(() => activeSprint?.id || 'all')
  const [selProject,  setSelProject]  = useState('all')
  const [selAssignee, setSelAssignee] = useState('all')
  const [selTask,     setSelTask]     = useState(null)

  const allAssignees = useMemo(() => [...new Set(allTasks.map(t => t.assignee).filter(Boolean))], [allTasks])

  const filtered = useMemo(() => {
    let tasks = allTasks
    if (selSprint !== 'all') { const sp = sprints.find(s => s.id === selSprint); tasks = tasks.filter(t => sp?.taskIds?.includes(t.id)) }
    if (selProject !== 'all') tasks = tasks.filter(t => t.projectId === selProject)
    if (selAssignee !== 'all') tasks = tasks.filter(t => t.assignee === selAssignee)
    return tasks
  }, [allTasks, selSprint, selProject, selAssignee, sprints])

  const COLS = [
    { id: 'To Do',       label: 'TO DO',       cc: C.textSecondary },
    { id: 'In Progress', label: 'IN PROGRESS',  cc: C.primary       },
    { id: 'Done',        label: 'DONE',         cc: C.success       },
  ]
  const inp = { padding: '7px 10px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: 'none', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit' }

  return (
    <>
      <SprintHealthPanel sprint={activeSprint} allTasks={allTasks} standupNotes={standupNotes} teamMembers={teamMembers} C={C} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { label: 'Sprint',   val: selSprint,   set: setSelSprint,   opts: [{ v: 'all', l: 'All sprints' }, ...sprints.map(s => ({ v: s.id, l: `${s.name} (${s.status})` }))] },
          { label: 'Project',  val: selProject,  set: setSelProject,  opts: [{ v: 'all', l: 'All projects' }, ...projects.map(p => ({ v: p.id, l: p.name }))] },
          { label: 'Assignee', val: selAssignee, set: setSelAssignee, opts: [{ v: 'all', l: 'All assignees' }, ...allAssignees.map(a => ({ v: a, l: a }))] },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary }}>{f.label}:</span>
            <select value={f.val} onChange={e => f.set(e.target.value)} style={inp}>
              {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
        ))}
        <span style={{ fontSize: 12, color: C.textSecondary, marginLeft: 'auto' }}>{filtered.length} tasks</span>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, alignItems: 'start' }}>
        {COLS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.id)
          return (
            <div key={col.id} style={{ background: C.mainBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '11px 13px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: col.cc+'08' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: col.cc, letterSpacing: 0.7 }}>{col.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: col.cc, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{colTasks.length}</span>
              </div>
              <div style={{ padding: 9, minHeight: 180, maxHeight: 'calc(100vh - 420px)', overflowY: 'auto' }}>
                {colTasks.length === 0
                  ? <div style={{ textAlign: 'center', padding: '28px 10px', color: C.textSecondary, fontSize: 12 }}>No tasks</div>
                  : colTasks.map(t => <TaskCard key={t.id} task={t} C={C} onClick={setSelTask} onStatusChange={updateTaskStatus} />)
                }
              </div>
            </div>
          )
        })}
      </div>

      {/* Task detail modal */}
      {selTask && (
        <Modal title={selTask.name} onClose={() => setSelTask(null)} width={500} C={C}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            {[
              { l: 'PRIORITY', v: <Badge label={selTask.priority||'Low'} color={pColor(selTask.priority,C)} bg={pColor(selTask.priority,C)+'18'} /> },
              { l: 'STATUS',   v: <Badge label={selTask.status} color={selTask.status==='Done'?C.success:selTask.status==='In Progress'?C.primary:C.textSecondary} bg={selTask.status==='Done'?C.success+'15':selTask.status==='In Progress'?C.primary+'15':C.border} /> },
              { l: 'ASSIGNEE', v: <span style={{ fontSize: 13, color: C.textPrimary }}>{selTask.assignee||'—'}</span> },
              { l: 'DUE DATE', v: <span style={{ fontSize: 13, color: isOverdue(selTask.dueDate)&&selTask.status!=='Done'?C.danger:C.textPrimary }}>{selTask.dueDate||'—'}</span> },
              { l: 'PROJECT',  v: <span style={{ fontSize: 13, color: C.textPrimary }}>{selTask.projectName}</span> },
              { l: 'FEATURE',  v: <span style={{ fontSize: 13, color: C.textPrimary }}>{selTask.feature||'—'}</span> },
            ].map(r => (
              <div key={r.l}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, marginBottom: 5, letterSpacing: 0.5 }}>{r.l}</div>
                {r.v}
              </div>
            ))}
          </div>
          {selTask.description && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, marginBottom: 5, letterSpacing: 0.5 }}>DESCRIPTION</div>
              <p style={{ margin: 0, fontSize: 13, color: C.textPrimary, lineHeight: 1.6, background: C.mainBg, padding: '10px 12px', borderRadius: 8 }}>{selTask.description}</p>
            </div>
          )}
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textSecondary, marginBottom: 8, letterSpacing: 0.5 }}>MOVE TO</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['To Do','In Progress','Done'].map(s => (
              <button key={s} onClick={async () => { await updateTaskStatus(selTask.projectId, selTask.id, s); setSelTask(p => ({...p, status: s})) }}
                style={{ flex: 1, padding: '8px', background: selTask.status===s?C.primary:C.cardBg, color: selTask.status===s?'#fff':C.textSecondary, border: `1px solid ${selTask.status===s?C.primary:C.border}`, borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {s}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}

// ── BACKLOG TAB ───────────────────────────────────────────────────────────────
function BacklogTab({ allTasks, sprints, projects, teamMembers }) {
  const C = useThemeColors()
  const { updateSprint } = useScrum()
  const { addTask }      = useProjects()
  const [selProject, setSelProject] = useState('all')
  const [expanded,   setExpanded]   = useState('unassigned')
  const [showComp,   setShowComp]   = useState(false)
  const [showAdd,    setShowAdd]    = useState(false)
  const [addForm,    setAddForm]    = useState({ projectId: '', name: '', priority: 'Medium', assignee: '', dueDate: '', feature: '' })
  const [addErr,     setAddErr]     = useState('')

  const filtered    = selProject === 'all' ? allTasks : allTasks.filter(t => t.projectId === selProject)
  const assignedIds = new Set(sprints.flatMap(s => s.taskIds||[]))
  const unassigned  = filtered.filter(t => !assignedIds.has(t.id))
  const active      = sprints.filter(s => s.status !== 'completed')
  const completed   = sprints.filter(s => s.status === 'completed')

  const allFeatures = projects.flatMap(p => (p.features||[]).map(f => ({ ...f, projectName: p.name })))

  function toggleTask(sprintId, taskId) {
    const sp = sprints.find(s => s.id === sprintId)
    if (!sp) return
    const taskIds = sp.taskIds?.includes(taskId) ? sp.taskIds.filter(id => id !== taskId) : [...(sp.taskIds||[]), taskId]
    updateSprint(sprintId, { taskIds })
  }

  async function submitAdd() {
    if (!addForm.projectId || !addForm.name.trim()) { setAddErr('Project and task name are required.'); return }
    await addTask(addForm.projectId, { name: addForm.name.trim(), priority: addForm.priority, assignee: addForm.assignee, dueDate: addForm.dueDate||null, feature: addForm.feature, status: 'To Do' })
    setAddForm({ projectId: '', name: '', priority: 'Medium', assignee: '', dueDate: '', feature: '' })
    setAddErr(''); setShowAdd(false)
  }

  const inp = { padding: '7px 10px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 12, outline: 'none', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit' }
  const inpF = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit', boxSizing: 'border-box' }
  const stB  = { planned:{ color:C.textSecondary,bg:C.border }, active:{ color:C.primary,bg:C.primary+'15' }, completed:{ color:C.success,bg:C.success+'15' } }

  function TaskRow({ task, sprintId, readOnly }) {
    const pc = pColor(task.priority, C)
    const ov = isOverdue(task.dueDate) && task.status !== 'Done'
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderBottom: `1px solid ${C.border}`, background: C.cardBg }}>
        <div style={{ width: 3, height: 30, borderRadius: 2, background: pc, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</div>
          <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 1 }}>{task.projectName}{task.feature?` · ${task.feature}`:''}</div>
        </div>
        <Badge label={task.priority||'Low'} color={pc} bg={pc+'18'} />
        <Badge label={task.status} color={task.status==='Done'?C.success:task.status==='In Progress'?C.primary:C.textSecondary} bg={task.status==='Done'?C.success+'15':task.status==='In Progress'?C.primary+'15':C.border} />
        {task.assignee && <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.primary+'20', color: C.primary, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title={task.assignee}>{initials(task.assignee)}</div>}
        {task.dueDate && <span style={{ fontSize: 11, color: ov?C.danger:C.textSecondary, flexShrink: 0 }}>{task.dueDate}</span>}
        {!readOnly && (sprintId
          ? <button onClick={() => toggleTask(sprintId, task.id)} style={{ padding: '3px 9px', background: C.danger+'10', color: C.danger, border: `1px solid ${C.danger}25`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>Remove</button>
          : <select defaultValue="" onChange={e => { if(e.target.value){ toggleTask(e.target.value, task.id); e.target.value='' } }} style={{ ...inp, fontSize: 11, padding: '3px 8px' }}>
              <option value="">+ Sprint</option>
              {sprints.filter(s=>s.status!=='completed').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        )}
      </div>
    )
  }

  function SprintSection({ sprint, readOnly }) {
    const spTasks = filtered.filter(t => sprint.taskIds?.includes(t.id))
    const done    = spTasks.filter(t => t.status==='Done').length
    const sc      = stB[sprint.status]||stB.planned
    const isExp   = expanded === sprint.id
    return (
      <div style={{ marginBottom: 10, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div onClick={() => setExpanded(isExp?null:sprint.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 15px', background: C.cardBg, cursor: 'pointer', borderBottom: isExp?`1px solid ${C.border}`:'none' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{sprint.name}</span>
          <Badge label={sprint.status} color={sc.color} bg={sc.bg} />
          <span style={{ fontSize: 12, color: C.textSecondary }}>{sprint.startDate} → {sprint.endDate}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: C.textSecondary }}>{done}/{spTasks.length} done</span>
            {sprint.reviewNotes && <span style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>◎ Review notes</span>}
            <span style={{ fontSize: 12, color: C.textSecondary }}>{isExp?'▲':'▼'}</span>
          </div>
        </div>
        {isExp && (
          <>
            {sprint.reviewNotes && (
              <div style={{ padding: '10px 14px', background: C.primary+'08', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.textPrimary }}>
                <strong>Review Notes:</strong> {sprint.reviewNotes}
              </div>
            )}
            {spTasks.length === 0
              ? <div style={{ padding: '14px 18px', fontSize: 13, color: C.textSecondary, background: C.mainBg }}>{readOnly ? 'No tasks were in this sprint.' : 'No tasks yet — assign from Backlog below.'}</div>
              : spTasks.map(t => <TaskRow key={t.id} task={t} sprintId={sprint.id} readOnly={readOnly} />)
            }
          </>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.textSecondary }}>Project:</span>
        <select value={selProject} onChange={e => setSelProject(e.target.value)} style={inp}>
          <option value="all">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span style={{ fontSize: 12, color: C.textSecondary }}>{filtered.length} tasks</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAdd(true)} style={{ padding: '7px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Task</button>
        </div>
      </div>

      {active.map(s => <SprintSection key={s.id} sprint={s} readOnly={false} />)}

      {/* Unassigned pool */}
      <div style={{ marginBottom: 10, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <div onClick={() => setExpanded(expanded==='unassigned'?null:'unassigned')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 15px', background: C.cardBg, cursor: 'pointer', borderBottom: expanded==='unassigned'?`1px solid ${C.border}`:'none' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>Backlog</span>
          <Badge label="unassigned" color={C.textSecondary} bg={C.border} />
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 12, color: C.textSecondary }}>{unassigned.length} tasks</span>
            <span style={{ fontSize: 12, color: C.textSecondary }}>{expanded==='unassigned'?'▲':'▼'}</span>
          </div>
        </div>
        {expanded==='unassigned' && (unassigned.length===0
          ? <div style={{ padding: '14px 18px', fontSize: 13, color: C.textSecondary, background: C.mainBg }}>All tasks are assigned to sprints.</div>
          : unassigned.map(t => <TaskRow key={t.id} task={t} sprintId={null} readOnly={false} />)
        )}
      </div>

      {/* Completed sprints */}
      {completed.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setShowComp(!showComp)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.textSecondary, fontFamily: 'inherit', padding: '4px 0', marginBottom: 8 }}>
            {showComp?'▲':'▼'} Completed Sprints ({completed.length})
          </button>
          {showComp && completed.map(s => <SprintSection key={s.id} sprint={s} readOnly={true} />)}
        </div>
      )}

      {/* Add task modal */}
      {showAdd && (
        <Modal title="Add Task to Backlog" onClose={() => setShowAdd(false)} C={C} width={480}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Project *</label>
            <select value={addForm.projectId} onChange={e => setAddForm(f=>({...f,projectId:e.target.value}))} style={{ ...inpF }}>
              <option value="">— select project —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Task Name *</label>
            <input value={addForm.name} onChange={e => setAddForm(f=>({...f,name:e.target.value}))} placeholder="Task name…" style={inpF} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Priority</label>
              <select value={addForm.priority} onChange={e => setAddForm(f=>({...f,priority:e.target.value}))} style={inpF}>
                {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Assignee</label>
              <input list="bl-members" value={addForm.assignee} onChange={e => setAddForm(f=>({...f,assignee:e.target.value}))} placeholder="Name…" style={inpF} />
              <datalist id="bl-members">{teamMembers.map(m => <option key={m} value={m} />)}</datalist>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Feature</label>
              <input list="bl-feats" value={addForm.feature} onChange={e => setAddForm(f=>({...f,feature:e.target.value}))} placeholder="Feature name…" style={inpF} />
              <datalist id="bl-feats">{allFeatures.filter(f=>!addForm.projectId||f.projectId===addForm.projectId).map(f=><option key={f.id} value={f.name}/>)}</datalist>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Due Date</label>
              <input type="date" value={addForm.dueDate} onChange={e => setAddForm(f=>({...f,dueDate:e.target.value}))} style={inpF} />
            </div>
          </div>
          {addErr && <p style={{ margin: '0 0 10px', color: C.danger, fontSize: 12 }}>{addErr}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: '8px 18px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={submitAdd} style={{ padding: '8px 18px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Add to Backlog</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── SPRINTS TAB ───────────────────────────────────────────────────────────────
function SprintsTab({ sprints, allTasks, projects }) {
  const C = useThemeColors()
  const { addSprint, updateSprint, deleteSprint } = useScrum()

  // Build Sprint Planning data for active sprint
  const activeSprint = sprints.find(s => s.status === 'active')
  const allStories   = projects ? projects.flatMap(p => (p.features || []).map(f => ({ ...f, projectName: p.name }))) : []
  const sprintTasks  = activeSprint ? allTasks.filter(t => activeSprint.taskIds?.includes(t.id)) : []

  // Group sprint tasks by storyId (or feature name as fallback)
  const storyMap = {}
  sprintTasks.forEach(t => {
    const key = t.storyId || t.feature || '(no story)'
    if (!storyMap[key]) storyMap[key] = { tasks: [], story: allStories.find(s => s.id === t.storyId) || null, storyName: t.feature || '(no story)' }
    storyMap[key].tasks.push(t)
  })
  const committedStories = Object.values(storyMap)
  const totalCommittedSP = committedStories.reduce((sum, s) => sum + (s.story?.storyPoints || 0), 0)
  const totalCapacity    = activeSprint ? (activeSprint.capacity || []).reduce((s, m) => s + (m.availableDays || 0), 0) : 0
  const [showCreate,   setShowCreate]   = useState(false)
  const [reviewModal,  setReviewModal]  = useState(null)
  const [reviewNotes,  setReviewNotes]  = useState('')
  const [form,         setForm]         = useState({ name:'', goal:'', startDate:'', endDate:'' })
  const [formErr,      setFormErr]      = useState('')

  const inp = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: C.cardBg, color: C.textPrimary, fontFamily: 'inherit', boxSizing: 'border-box' }
  const stB = { planned:{ color:C.textSecondary,bg:C.border }, active:{ color:C.primary,bg:C.primary+'15' }, completed:{ color:C.success,bg:C.success+'15' } }
  const hasActive = sprints.some(s => s.status === 'active')

  function save() {
    if (!form.name.trim()||!form.startDate||!form.endDate) { setFormErr('Name, start and end dates are required.'); return }
    if (form.endDate <= form.startDate) { setFormErr('End date must be after start date.'); return }
    addSprint({ name: form.name, goal: form.goal, startDate: form.startDate, endDate: form.endDate })
    setForm({ name:'', goal:'', startDate:'', endDate:'' }); setFormErr(''); setShowCreate(false)
  }

  function openReview(sprint) { setReviewModal(sprint); setReviewNotes('') }

  function completeSprint() {
    const done = allTasks.filter(t => reviewModal.taskIds?.includes(t.id) && t.status==='Done').length
    updateSprint(reviewModal.id, { status:'completed', completedAt:todayStr(), completedTaskCount:done, reviewNotes })
    setReviewModal(null)
  }

  return (
    <>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>{sprints.length} sprint{sprints.length!==1?'s':''}</p>
        <button onClick={() => setShowCreate(true)} style={{ padding:'8px 18px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>+ New Sprint</button>
      </div>

      {sprints.length===0 && (
        <Card C={C} style={{ textAlign:'center', padding:'40px 20px' }}>
          <p style={{ margin:'0 0 6px', fontSize:15, fontWeight:600, color:C.textPrimary }}>No sprints yet</p>
          <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>Create a sprint, then assign tasks in the Backlog tab.</p>
        </Card>
      )}

      {/* Sprint Planning Artifact — only shown for active sprint */}
      {activeSprint && committedStories.length > 0 && (
        <Card C={C} style={{ marginBottom:18, border:`2px solid ${C.primary}30` }}>
          <SecTitle C={C}>Sprint Planning Artifact — {activeSprint.name}</SecTitle>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
            <div style={{ padding:'10px 14px', background:C.primary+'10', borderRadius:8, textAlign:'center' }}>
              <div style={{ fontSize:11, color:C.textSecondary, marginBottom:3 }}>Committed Stories</div>
              <div style={{ fontSize:20, fontWeight:700, color:C.primary }}>{committedStories.length}</div>
            </div>
            <div style={{ padding:'10px 14px', background:C.primary+'10', borderRadius:8, textAlign:'center' }}>
              <div style={{ fontSize:11, color:C.textSecondary, marginBottom:3 }}>Committed SP</div>
              <div style={{ fontSize:20, fontWeight:700, color:C.primary }}>{totalCommittedSP}</div>
            </div>
            <div style={{ padding:'10px 14px', background:C.success+'10', borderRadius:8, textAlign:'center' }}>
              <div style={{ fontSize:11, color:C.textSecondary, marginBottom:3 }}>Team Capacity (days)</div>
              <div style={{ fontSize:20, fontWeight:700, color:C.success }}>{totalCapacity || '—'}</div>
            </div>
            <div style={{ padding:'10px 14px', background:C.warning+'10', borderRadius:8, textAlign:'center' }}>
              <div style={{ fontSize:11, color:C.textSecondary, marginBottom:3 }}>Sprint Tasks</div>
              <div style={{ fontSize:20, fontWeight:700, color:C.warning }}>{sprintTasks.length}</div>
            </div>
          </div>
          {activeSprint.goal && (
            <div style={{ padding:'8px 12px', background:C.primary+'08', borderRadius:8, marginBottom:14, borderLeft:`3px solid ${C.primary}` }}>
              <span style={{ fontSize:12, fontWeight:600, color:C.primary }}>Sprint Goal: </span>
              <span style={{ fontSize:12, color:C.textPrimary }}>{activeSprint.goal}</span>
            </div>
          )}
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${C.border}` }}>
                {['Story','SP','Tasks','Done','Status'].map(h => (
                  <th key={h} style={{ padding:'6px 10px', textAlign:'left', fontSize:11, fontWeight:600, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {committedStories.map((s, i) => {
                const doneT = s.tasks.filter(t => t.status==='Done').length
                const pct   = s.tasks.length > 0 ? Math.round(doneT/s.tasks.length*100) : 0
                return (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:'9px 10px', color:C.textPrimary, fontWeight:500 }}>{s.story?.name || s.storyName}</td>
                    <td style={{ padding:'9px 10px', color:C.primary, fontWeight:700 }}>{s.story?.storyPoints || '?'}</td>
                    <td style={{ padding:'9px 10px', color:C.textSecondary }}>{s.tasks.length}</td>
                    <td style={{ padding:'9px 10px', color:C.success }}>{doneT}</td>
                    <td style={{ padding:'9px 10px', minWidth:100 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <Bar pct={pct} color={pct===100?C.success:C.primary} C={C}/>
                        <span style={{ fontSize:11, fontWeight:600, color:C.textSecondary }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {sprints.map(sprint => {
        const sc      = stB[sprint.status]||stB.planned
        const spTasks = allTasks.filter(t => sprint.taskIds?.includes(t.id))
        const done    = spTasks.filter(t => t.status==='Done').length
        const pct     = spTasks.length>0?Math.round(done/spTasks.length*100):0
        const dr      = daysLeft(sprint.endDate)
        const drLabel = sprint.status==='active'
          ? (dr===null?''  : dr<0?`${Math.abs(dr)}d overdue` : dr===0?'Ends today':`${dr}d remaining`)
          : sprint.status==='completed'?`Completed ${sprint.completedAt||''}`:'Planned'
        const drColor = sprint.status==='active'
          ? (dr===null?C.textSecondary : dr<0?C.danger : dr<=3?C.danger : dr<=7?C.warning : C.success)
          : sprint.status==='completed'?C.success:C.textSecondary

        return (
          <Card key={sprint.id} C={C} style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <span style={{ fontSize:15, fontWeight:700, color:C.textPrimary }}>{sprint.name}</span>
                  <Badge label={sprint.status} color={sc.color} bg={sc.bg} />
                  <span style={{ fontSize:12, fontWeight:600, color:drColor, marginLeft:4 }}>{drLabel}</span>
                </div>
                {sprint.goal && <p style={{ margin:'0 0 6px', fontSize:12, color:C.primary, fontWeight:500 }}>Goal: {sprint.goal}</p>}
                <div style={{ fontSize:12, color:C.textSecondary, marginBottom:8 }}>{sprint.startDate} → {sprint.endDate} · {spTasks.length} tasks ({done} done)</div>
                {sprint.reviewNotes && (
                  <div style={{ fontSize:12, color:C.textSecondary, padding:'6px 10px', background:C.mainBg, borderRadius:6, marginBottom:8, borderLeft:`3px solid ${C.primary}` }}>
                    <strong>Review:</strong> {sprint.reviewNotes}
                  </div>
                )}
                {spTasks.length>0 && (
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.textSecondary, marginBottom:3 }}>
                      <span>Progress</span>
                      <span style={{ fontWeight:600, color:pct===100?C.success:C.textPrimary }}>{pct}%</span>
                    </div>
                    <Bar pct={pct} color={pct===100?C.success:C.primary} C={C} />
                  </div>
                )}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                {sprint.status==='planned'&&!hasActive && (
                  <button onClick={() => updateSprint(sprint.id,{status:'active'})} style={{ padding:'7px 15px', background:C.primary, color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Start Sprint</button>
                )}
                {sprint.status==='active' && (
                  <button onClick={() => openReview(sprint)} style={{ padding:'7px 15px', background:C.success, color:'#fff', border:'none', borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Complete Sprint</button>
                )}
                {sprint.status!=='active' && (
                  <button onClick={() => deleteSprint(sprint.id)} style={{ padding:'7px 13px', background:C.danger+'12', color:C.danger, border:`1px solid ${C.danger}25`, borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Delete</button>
                )}
              </div>
            </div>
          </Card>
        )
      })}

      {/* Create sprint modal */}
      {showCreate && (
        <Modal title="Create Sprint" onClose={() => setShowCreate(false)} C={C}>
          {[{l:'Sprint Name',k:'name',t:'text',ph:'e.g. Sprint 4'},{l:'Sprint Goal',k:'goal',t:'text',ph:'e.g. Complete auth module'},{l:'Start Date',k:'startDate',t:'date',ph:''},{l:'End Date',k:'endDate',t:'date',ph:''}].map(f => (
            <div key={f.k} style={{ marginBottom:13 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>{f.l}</label>
              <input type={f.t} style={inp} placeholder={f.ph} value={form[f.k]} onChange={e => setForm(p=>({...p,[f.k]:e.target.value}))} />
            </div>
          ))}
          {formErr && <p style={{ margin:'0 0 10px', color:C.danger, fontSize:12 }}>{formErr}</p>}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:18 }}>
            <button onClick={() => setShowCreate(false)} style={{ padding:'8px 18px', background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, cursor:'pointer', color:C.textSecondary, fontFamily:'inherit' }}>Cancel</button>
            <button onClick={save} style={{ padding:'8px 18px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Create</button>
          </div>
        </Modal>
      )}

      {/* Sprint review modal */}
      {reviewModal && (
        <Modal title="Complete Sprint — Sprint Review" onClose={() => setReviewModal(null)} C={C} width={520}>
          <p style={{ margin:'0 0 14px', fontSize:13, color:C.textSecondary }}>Record what was demoed and accepted before marking this sprint complete.</p>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:6 }}>Tasks Completed This Sprint</div>
            <div style={{ padding:'10px 14px', background:C.mainBg, borderRadius:8, border:`1px solid ${C.border}`, maxHeight:120, overflowY:'auto' }}>
              {allTasks.filter(t=>reviewModal.taskIds?.includes(t.id)&&t.status==='Done').map(t=>(
                <div key={t.id} style={{ fontSize:12, color:C.success, padding:'2px 0' }}>✓ {t.name}</div>
              ))}
              {allTasks.filter(t=>reviewModal.taskIds?.includes(t.id)&&t.status==='Done').length===0 && (
                <div style={{ fontSize:12, color:C.textSecondary }}>No tasks marked as Done in this sprint.</div>
              )}
            </div>
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Sprint Review Notes <span style={{ fontWeight:400, color:C.textSecondary }}>(optional)</span></label>
            <textarea value={reviewNotes} onChange={e=>setReviewNotes(e.target.value)} placeholder="Demoed, accepted, rejected, feedback…"
              style={{ ...inp, resize:'vertical', minHeight:80 }} />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <button onClick={() => setReviewModal(null)} style={{ padding:'8px 18px', background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, cursor:'pointer', color:C.textSecondary, fontFamily:'inherit' }}>Cancel</button>
            <button onClick={completeSprint} style={{ padding:'8px 18px', background:C.success, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Complete Sprint</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── REPORTS TAB ───────────────────────────────────────────────────────────────
const DAY_LABELS = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10']
const IDEAL_PTS  = [100,88,77,66,55,44,33,22,11,0]

function ReportsTab({ sprints, allTasks, allTeamMembers, burndownSnapshots, recordBurndownSnapshot, loadBurndownSnapshots }) {
  const C = useThemeColors()
  const { updateSprint } = useScrum()
  const [subTab, setSubTab] = useState('velocity')
  const [recordingBD, setRecordingBD] = useState(false)

  const completed = sprints.filter(s => s.status==='completed')
  const active    = sprints.find(s => s.status==='active')

  // Velocity
  const vels   = completed.map(s => ({ name:s.name, count:s.completedTaskCount||0 }))
  const avgVel = vels.length>0?Math.round(vels.reduce((a,v)=>a+v.count,0)/vels.length):0
  const maxV   = Math.max(...vels.map(v=>v.count),1)

  // Burndown — real snapshot data
  const spTasks    = active ? allTasks.filter(t => active.taskIds?.includes(t.id)) : []
  const doneCnt    = spTasks.filter(t => t.status==='Done').length
  const total      = spTasks.length
  const remaining  = total - doneCnt
  const velPct     = total>0 ? doneCnt/total : 0
  const realSnaps  = active ? (burndownSnapshots[active.id] || []) : []
  const hasRealData = realSnaps.length > 0

  // Build ideal burndown line (task count over sprint days)
  function buildIdealLine(sprint, totalTasks) {
    if (!sprint?.startDate || !sprint?.endDate || totalTasks === 0) return []
    const start = new Date(sprint.startDate)
    const end   = new Date(sprint.endDate)
    const days  = Math.max(1, Math.round((end - start) / 86400000))
    const pts   = []
    for (let i = 0; i <= days; i++) {
      const d = new Date(start); d.setDate(d.getDate() + i)
      pts.push({ date: d.toISOString().split('T')[0], ideal: Math.max(0, Math.round(totalTasks * (1 - i/days))) })
    }
    return pts
  }

  const idealLine = buildIdealLine(active, total)

  async function handleRecordSnapshot() {
    if (!active) return
    setRecordingBD(true)
    await recordBurndownSnapshot(active.id, remaining, doneCnt)
    await loadBurndownSnapshots(active.id)
    setRecordingBD(false)
  }

  // Projected fallback (for when no real snapshots)
  const actualPts = DAY_LABELS.map((_,i)=>Math.max(0,Math.round(100-velPct*100*(i/(DAY_LABELS.length-1))*1.1)))

  // Capacity
  const [capId,    setCapId]    = useState(()=>active?.id||sprints[0]?.id||'')
  const [capName,  setCapName]  = useState('')
  const [capTotal, setCapTotal] = useState('10')
  const [capAvail, setCapAvail] = useState('10')
  const capSprint  = sprints.find(s=>s.id===capId)
  const capacity   = capSprint?.capacity||[]
  const totAvail   = capacity.reduce((s,m)=>s+(m.availableDays||0),0)
  const totDays    = capacity.reduce((s,m)=>s+(m.totalDays||0),0)
  const utilPct    = totDays>0?Math.round(totAvail/totDays*100):0

  // Workload (all tasks)
  const workload = useMemo(()=>{
    const map={}
    allTasks.forEach(t=>{
      const k=t.assignee||'(Unassigned)'
      if(!map[k]) map[k]={name:k,todo:0,inProgress:0,done:0,total:0,overdue:0}
      map[k][t.status==='To Do'?'todo':t.status==='In Progress'?'inProgress':'done']++
      if(isOverdue(t.dueDate)&&t.status!=='Done') map[k].overdue++
      map[k].total++
    })
    return Object.values(map).sort((a,b)=>b.total-a.total)
  },[allTasks])

  const inp = { padding:'9px 10px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }
  function addMember() {
    if(!capName.trim()||!capSprint) return
    updateSprint(capId,{ capacity:[...capacity,{ id:uid(), name:capName.trim(), totalDays:parseInt(capTotal)||10, availableDays:parseInt(capAvail)||10 }] })
    setCapName('')
  }
  function importTeam() {
    const newCap=allTeamMembers.filter(m=>!capacity.find(c=>c.name===m)).map(m=>({ id:uid(), name:m, totalDays:10, availableDays:10 }))
    if(newCap.length) updateSprint(capId,{ capacity:[...capacity,...newCap] })
  }
  function removeMember(mid) { updateSprint(capId,{ capacity:capacity.filter(m=>m.id!==mid) }) }

  const SUB=[{id:'velocity',l:'Velocity'},{id:'burndown',l:'Burndown'},{id:'capacity',l:'Capacity'},{id:'workload',l:'Workload'}]

  return (
    <>
      <div style={{ display:'flex', gap:8, marginBottom:22 }}>
        {SUB.map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)}
            style={{ padding:'7px 16px', borderRadius:8, border:`1px solid ${subTab===t.id?C.primary:C.border}`, background:subTab===t.id?C.primary+'15':C.cardBg, color:subTab===t.id?C.primary:C.textSecondary, fontSize:13, fontWeight:subTab===t.id?600:400, cursor:'pointer', fontFamily:'inherit' }}>
            {t.l}
          </button>
        ))}
      </div>

      {subTab==='velocity' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
            <MetricCard C={C} label="Completed Sprints" value={completed.length}           icon="⬛" color={C.primary} />
            <MetricCard C={C} label="Avg Velocity"      value={`${avgVel} tasks`}          icon="⚡" color={C.success} />
            <MetricCard C={C} label="Best Sprint"       value={vels.length>0?`${Math.max(...vels.map(v=>v.count))} tasks`:'—'} icon="◎" color={C.warning} />
          </div>
          <Card C={C}>
            <SecTitle C={C}>Velocity per Sprint</SecTitle>
            {completed.length===0
              ? <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>Complete a sprint to see velocity data.</p>
              : <>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-end', height:180, marginBottom:12 }}>
                    {vels.map((v,i)=>{
                      const h=Math.max(4,Math.round(v.count/maxV*160))
                      return (
                        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                          <div style={{ fontSize:10, fontWeight:600, color:C.textPrimary }}>{v.count}</div>
                          <div style={{ width:'100%', height:h, background:v.count>=avgVel?C.success:C.primary, borderRadius:'4px 4px 0 0', transition:'height .4s' }} title={`${v.name}: ${v.count}`} />
                          <div style={{ fontSize:9, color:C.textSecondary, textAlign:'center', lineHeight:1.3 }}>{v.name}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display:'flex', gap:16, justifyContent:'center' }}>
                    {[{color:C.success,label:'Above avg'},{color:C.primary,label:'Below avg'}].map(l=>(
                      <span key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:C.textSecondary }}>
                        <span style={{ width:10, height:10, borderRadius:2, background:l.color, display:'inline-block' }}/>{l.label}
                      </span>
                    ))}
                  </div>
                </>
            }
          </Card>
        </>
      )}

      {subTab==='burndown' && (
        <Card C={C}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:C.textPrimary }}>{active ? `${active.name} — Burndown` : 'Sprint Burndown'}</h3>
            {active && (
              <button onClick={handleRecordSnapshot} disabled={recordingBD}
                style={{ padding:'7px 14px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:recordingBD?0.6:1 }}>
                {recordingBD ? 'Recording…' : "Record Today's Progress"}
              </button>
            )}
          </div>

          {!active ? (
            <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>Start a sprint to see burndown.</p>
          ) : hasRealData ? (
            <>
              {/* Real burndown chart using snapshots */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:18 }}>
                <div style={{ padding:'10px 14px', background:C.primary+'10', borderRadius:8, border:`1px solid ${C.primary}20` }}>
                  <div style={{ fontSize:10, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.5, marginBottom:2 }}>Total Tasks</div>
                  <div style={{ fontSize:20, fontWeight:700, color:C.primary }}>{total}</div>
                </div>
                <div style={{ padding:'10px 14px', background:C.success+'10', borderRadius:8, border:`1px solid ${C.success}20` }}>
                  <div style={{ fontSize:10, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.5, marginBottom:2 }}>Done</div>
                  <div style={{ fontSize:20, fontWeight:700, color:C.success }}>{doneCnt}</div>
                </div>
                <div style={{ padding:'10px 14px', background:remaining>0?C.warning+'10':C.success+'10', borderRadius:8, border:`1px solid ${remaining>0?C.warning:C.success}20` }}>
                  <div style={{ fontSize:10, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.5, marginBottom:2 }}>Remaining</div>
                  <div style={{ fontSize:20, fontWeight:700, color:remaining>0?C.warning:C.success }}>{remaining}</div>
                </div>
              </div>
              <div style={{ overflowX:'auto', marginBottom:12 }}>
                <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:180, minWidth:Math.max(realSnaps.length*40,280) }}>
                  {idealLine.map((pt, i) => {
                    const snap = realSnaps.find(s => s.date === pt.date)
                    const maxT = total || 1
                    const idealH = Math.round(pt.ideal/maxT*160)
                    const actH   = snap ? Math.round(snap.remainingPoints/maxT*160) : null
                    const behind = snap && snap.remainingPoints > pt.ideal
                    return (
                      <div key={pt.date} style={{ flex:1, minWidth:30, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                        <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:160 }}>
                          <div style={{ width:10, height:Math.max(2,idealH), background:C.border, borderRadius:'2px 2px 0 0' }} title={`Ideal: ${pt.ideal}`}/>
                          {actH !== null && <div style={{ width:10, height:Math.max(2,actH), background:behind?C.danger:C.success, borderRadius:'2px 2px 0 0' }} title={`Actual: ${snap.remainingPoints}`}/>}
                        </div>
                        <div style={{ fontSize:8, color:C.textSecondary, transform:'rotate(-45deg)', transformOrigin:'top left', whiteSpace:'nowrap', marginTop:4 }}>{pt.date.slice(5)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
                {[{color:C.border,label:'Ideal'},{color:C.success,label:'On track'},{color:C.danger,label:'Behind'}].map(l=>(
                  <span key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.textSecondary }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:l.color, display:'inline-block' }}/>{l.label}
                  </span>
                ))}
              </div>
              <p style={{ margin:'12px 0 0', fontSize:11, color:C.textSecondary, textAlign:'center' }}>{realSnaps.length} snapshot{realSnaps.length!==1?'s':''} recorded.</p>
            </>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'8px 12px', background:C.warning+'10', border:`1px solid ${C.warning}25`, borderRadius:8 }}>
                <span style={{ fontSize:14, color:C.warning }}>⚠</span>
                <span style={{ fontSize:12, color:C.warning, fontWeight:500 }}>No snapshots yet — showing projected burndown.</span>
              </div>
              <p style={{ margin:'0 0 18px', fontSize:13, color:C.textSecondary }}>
                {`${doneCnt}/${total} tasks done (${Math.round(velPct*100)}%) at current rate`}
              </p>
              <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:180, marginBottom:10 }}>
                {DAY_LABELS.map((label,i)=>{
                  const idealH=Math.round(IDEAL_PTS[i]/100*160)
                  const actH  =Math.round(actualPts[i]/100*160)
                  const behind=actualPts[i]>IDEAL_PTS[i]
                  return (
                    <div key={label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                      <div style={{ display:'flex', gap:2, alignItems:'flex-end', height:160 }}>
                        <div style={{ width:12, height:idealH, background:C.border, borderRadius:'2px 2px 0 0' }}/>
                        <div style={{ width:12, height:actH,   background:behind?C.danger:C.success, borderRadius:'2px 2px 0 0' }}/>
                      </div>
                      <div style={{ fontSize:9, color:C.textSecondary }}>{label}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
                {[{color:C.border,label:'Ideal'},{color:C.success,label:'On track'},{color:C.danger,label:'Behind'}].map(l=>(
                  <span key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.textSecondary }}>
                    <span style={{ width:10, height:10, borderRadius:'50%', background:l.color, display:'inline-block' }}/>{l.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {subTab==='capacity' && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
            <label style={{ fontSize:13, fontWeight:600, color:C.textPrimary }}>Sprint:</label>
            <select value={capId} onChange={e=>setCapId(e.target.value)} style={{ ...inp, minWidth:200 }}>
              <option value="">— select sprint —</option>
              {sprints.map(s=><option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
            </select>
          </div>
          {!capSprint
            ? <Card C={C} style={{ textAlign:'center', padding:'40px 20px' }}><p style={{ margin:0, fontSize:13, color:C.textSecondary }}>Select a sprint to plan capacity.</p></Card>
            : <>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
                  <MetricCard C={C} label="Team Members"   value={capacity.length}                      icon="◉" color={C.primary} />
                  <MetricCard C={C} label="Available Days" value={totAvail} sub={`${utilPct}% of total`} icon="◎" color={C.success} />
                  <MetricCard C={C} label="Sprint Tasks"   value={(capSprint.taskIds||[]).length}         icon="◎" color={C.warning} />
                </div>
                <Card C={C} style={{ marginBottom:14 }}>
                  <SecTitle C={C} action={
                    allTeamMembers.length>0&&<button onClick={importTeam} style={{ padding:'5px 12px', background:C.primary+'15', color:C.primary, border:`1px solid ${C.primary}30`, borderRadius:7, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Import Team</button>
                  }>Team Capacity — {capSprint.name}</SecTitle>
                  {capacity.length===0
                    ? <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>No members added.</p>
                    : <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr style={{ borderBottom:`2px solid ${C.border}` }}>
                          {['Member','Sprint Days','Available','Availability',''].map(h=>(
                            <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:600, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {capacity.map((m,i)=>{
                            const av=m.totalDays>0?Math.round(m.availableDays/m.totalDays*100):0
                            return (
                              <tr key={m.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.cardBg:C.mainBg }}>
                                <td style={{ padding:'11px 12px', fontWeight:500, color:C.textPrimary }}>{m.name}</td>
                                <td style={{ padding:'11px 12px', color:C.textSecondary }}>{m.totalDays}d</td>
                                <td style={{ padding:'11px 12px', color:C.textSecondary }}>{m.availableDays}d</td>
                                <td style={{ padding:'11px 12px', minWidth:150 }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                    <div style={{ flex:1 }}><Bar pct={av} color={av>=80?C.success:av>=50?C.warning:C.danger} C={C}/></div>
                                    <span style={{ fontSize:11, fontWeight:600, color:C.textSecondary, minWidth:28 }}>{av}%</span>
                                  </div>
                                </td>
                                <td style={{ padding:'11px 12px' }}>
                                  <button onClick={()=>removeMember(m.id)} style={{ padding:'3px 9px', background:C.danger+'12', color:C.danger, border:`1px solid ${C.danger}25`, borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Remove</button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                  }
                </Card>
                <Card C={C}>
                  <SecTitle C={C}>Add Member</SecTitle>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:10, alignItems:'end' }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:4 }}>Name</label>
                      <input list="cap-m" style={{ ...inp, width:'100%', boxSizing:'border-box' }} placeholder="Team member" value={capName} onChange={e=>setCapName(e.target.value)} />
                      <datalist id="cap-m">{allTeamMembers.map(m=><option key={m} value={m}/>)}</datalist>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:4 }}>Sprint Days</label>
                      <input type="number" min={1} max={30} style={{ ...inp, width:'100%', boxSizing:'border-box' }} value={capTotal} onChange={e=>setCapTotal(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:4 }}>Available</label>
                      <input type="number" min={0} max={30} style={{ ...inp, width:'100%', boxSizing:'border-box' }} value={capAvail} onChange={e=>setCapAvail(e.target.value)} />
                    </div>
                    <button onClick={addMember} disabled={!capName.trim()} style={{ padding:'9px 16px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:!capName.trim()?.5:1 }}>Add</button>
                  </div>
                </Card>
              </>
          }
        </>
      )}

      {subTab==='workload' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
            <MetricCard C={C} label="Total Tasks"    value={allTasks.length}                                       icon="◎" color={C.primary} />
            <MetricCard C={C} label="Overdue Tasks"  value={allTasks.filter(t=>isOverdue(t.dueDate)&&t.status!=='Done').length} icon="⚠" color={C.danger} />
            <MetricCard C={C} label="Unassigned"     value={allTasks.filter(t=>!t.assignee).length}               icon="○" color={C.warning} />
          </div>
          <Card C={C}>
            <SecTitle C={C}>Workload by Assignee</SecTitle>
            {workload.length===0
              ? <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>No tasks found.</p>
              : workload.map((w,i)=>{
                  const maxT=workload[0].total||1
                  return (
                    <div key={w.name} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:C.primary+'20', color:C.primary, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{initials(w.name)}</div>
                          <span style={{ fontSize:13, fontWeight:600, color:C.textPrimary }}>{w.name}</span>
                          {w.overdue>0&&<span style={{ fontSize:11, color:C.danger, fontWeight:600 }}>⚠ {w.overdue} overdue</span>}
                        </div>
                        <div style={{ display:'flex', gap:12, fontSize:12, color:C.textSecondary }}>
                          <span style={{ color:C.textSecondary }}>{w.todo} todo</span>
                          <span style={{ color:C.primary }}>{w.inProgress} in progress</span>
                          <span style={{ color:C.success }}>{w.done} done</span>
                          <span style={{ fontWeight:700, color:C.textPrimary }}>{w.total} total</span>
                        </div>
                      </div>
                      <div style={{ display:'flex', height:8, borderRadius:4, overflow:'hidden', background:C.border }}>
                        <div style={{ width:`${w.done/maxT*100}%`,    background:C.success,       transition:'width .4s' }}/>
                        <div style={{ width:`${w.inProgress/maxT*100}%`, background:C.primary,    transition:'width .4s' }}/>
                        <div style={{ width:`${w.todo/maxT*100}%`,    background:C.textSecondary+'50', transition:'width .4s' }}/>
                      </div>
                    </div>
                  )
                })
            }
          </Card>
        </>
      )}
    </>
  )
}

// ── TEAM TAB ──────────────────────────────────────────────────────────────────
function TeamTab({ allTeamMembers, allRisks, profile, sprints }) {
  const C = useThemeColors()
  const { standupNotes: notes, addStandupNote, deleteStandupNote } = useScrum()
  const [subTab, setSubTab] = useState('standup')

  // Standup
  const [form,         setForm]         = useState({ memberName:'', did:'', will:'', blockers:'' })
  const [selDate,      setSelDate]      = useState(todayStr())
  const [expandedDate, setExpandedDate] = useState(null)

  // Retro (localStorage-persisted per sprint)
  const activeSprint = sprints.find(s=>s.status==='active')
  const [retroId,    setRetroId]    = useState(activeSprint?.id||sprints[0]?.id||'global')
  const [retro,      setRetroRaw]   = useState(()=>lsGet(`sm_retro_${retroId}`,RETRO_DEFAULTS))
  const [newItems,   setNewItems]   = useState({ good:'', improve:'', action:'' })

  function setRetro(updater) {
    setRetroRaw(prev => {
      const next = typeof updater==='function' ? updater(prev) : updater
      lsSet(`sm_retro_${retroId}`, next)
      return next
    })
  }
  function switchRetroSprint(id) {
    setRetroId(id)
    setRetroRaw(lsGet(`sm_retro_${id}`, RETRO_DEFAULTS))
  }
  function retroAdd(cat)    { const v=newItems[cat].trim(); if(!v)return; setRetro(r=>({...r,[cat]:[...r[cat],v]})); setNewItems(n=>({...n,[cat]:''})) }
  function retroRemove(cat,i){ setRetro(r=>({...r,[cat]:r[cat].filter((_,idx)=>idx!==i)})) }

  // Impediments (localStorage-persisted)
  const [localImps, setLocalImpsRaw] = useState(()=>lsGet('sm_impediments',[]))
  const [impText,   setImpText]      = useState('')
  const [impOwner,  setImpOwner]     = useState('')

  function setLocalImps(updater) {
    setLocalImpsRaw(prev => {
      const next=typeof updater==='function'?updater(prev):updater
      lsSet('sm_impediments', next)
      return next
    })
  }
  function logImp() {
    if(!impText.trim()) return
    setLocalImps(p=>[{ id:'li'+uid(), title:impText.trim(), owner:impOwner||profile?.full_name||'Me', severity:'medium', status:'open', source:'manual' },...p])
    setImpText(''); setImpOwner('')
  }
  function resolveImp(id) { setLocalImps(p=>p.map(i=>i.id===id?{...i,status:'resolved'}:i)) }
  function removeImp(id)  { setLocalImps(p=>p.filter(i=>i.id!==id)) }

  const inp = { width:'100%', padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit', boxSizing:'border-box' }
  const ta  = { ...inp, resize:'vertical', minHeight:58 }

  // Standup helpers
  function saveStandup() {
    if(!form.memberName.trim()||!form.did.trim()) return
    addStandupNote({ id:uid(), date:selDate, ...form })
    setForm({ memberName:'', did:'', will:'', blockers:'' })
  }
  const todayNotes  = notes.filter(n=>n.date===selDate)
  const loggedNames = new Set(notes.filter(n=>n.date===todayStr()).map(n=>n.memberName))
  const missingList = allTeamMembers.filter(m=>!loggedNames.has(m))
  const byDate      = notes.reduce((acc,n)=>{ if(n.date!==selDate){(acc[n.date]=acc[n.date]||[]).push(n)} return acc },{})
  const histDates   = Object.keys(byDate).sort().reverse()

  // Impediments combined
  const dbImps  = allRisks.filter(r=>r.status==='Open'||r.status==='In Progress').map(r=>({
    id:r.id, title:r.description, owner:r.projectName, severity:(r.priority||'medium').toLowerCase(),
    status:r.status==='In Progress'?'in_progress':'open', source:'risk'
  }))
  const allImps    = [...dbImps, ...localImps]
  const openImpCnt = allImps.filter(i=>i.status!=='resolved').length

  const sevC = { high:{color:C.danger,bg:C.danger+'15'}, medium:{color:C.warning,bg:C.warning+'18'}, low:{color:C.success,bg:C.success+'15'} }
  const stC  = { open:{color:C.danger,bg:C.danger+'12'}, in_progress:{color:C.warning,bg:C.warning+'18'}, resolved:{color:C.success,bg:C.success+'12'} }

  const SUB=[{id:'standup',l:'Daily Standup'},{id:'retro',l:'Retrospective'},{id:'impediments',l:`Impediments${openImpCnt>0?` (${openImpCnt})`:''}`}]

  return (
    <>
      <div style={{ display:'flex', gap:8, marginBottom:22 }}>
        {SUB.map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)}
            style={{ padding:'7px 16px', borderRadius:8, border:`1px solid ${subTab===t.id?C.primary:C.border}`, background:subTab===t.id?C.primary+'15':C.cardBg, color:subTab===t.id?C.primary:C.textSecondary, fontSize:13, fontWeight:subTab===t.id?600:400, cursor:'pointer', fontFamily:'inherit' }}>
            {t.l}
          </button>
        ))}
      </div>

      {subTab==='standup' && (
        <>
          {/* Missing standup alert */}
          {selDate===todayStr() && missingList.length>0 && (
            <div style={{ marginBottom:16, padding:'10px 14px', background:C.warning+'10', border:`1px solid ${C.warning}25`, borderRadius:9, display:'flex', alignItems:'flex-start', gap:10 }}>
              <span style={{ fontSize:16, color:C.warning }}>⚠</span>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.warning, marginBottom:4 }}>Missing from today's standup ({missingList.length})</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {missingList.map(m=>(
                    <span key={m} style={{ fontSize:12, color:C.textPrimary, background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:14, padding:'2px 10px' }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Log form */}
            <Card C={C}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:C.textPrimary }}>Log Entry</h3>
                <input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} style={{ padding:'4px 8px', border:`1px solid ${C.border}`, borderRadius:6, fontSize:12, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }} />
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Team Member</label>
                <input list="sm-members" style={inp} placeholder="Select or type name" value={form.memberName} onChange={e=>setForm(f=>({...f,memberName:e.target.value}))} />
                <datalist id="sm-members">{allTeamMembers.map(m=><option key={m} value={m}/>)}</datalist>
              </div>
              {[{key:'did',label:'What did you do?',ph:'Completed login form…'},{key:'will',label:'What will you do?',ph:'Work on dashboard…'},{key:'blockers',label:'Any blockers?',ph:'None / Waiting for API…'}].map(f=>(
                <div key={f.key} style={{ marginBottom:12 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>{f.label}</label>
                  <textarea style={ta} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}/>
                </div>
              ))}
              <button onClick={saveStandup} disabled={!form.memberName.trim()||!form.did.trim()}
                style={{ width:'100%', padding:'9px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:!form.memberName.trim()?.5:1 }}>
                Log Update
              </button>
            </Card>

            <div>
              <Card C={C} style={{ marginBottom:14 }}>
                <SecTitle C={C}>{selDate===todayStr()?"Today's Stand-up":`${selDate} Stand-up`}</SecTitle>
                {todayNotes.length===0
                  ? <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>No entries for this date yet.</p>
                  : todayNotes.map(n=>(
                    <div key={n.id} style={{ background:C.mainBg, border:`1px solid ${C.border}`, borderRadius:8, padding:'11px 13px', marginBottom:9 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:7 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:26, height:26, borderRadius:'50%', background:C.primary+'20', color:C.primary, fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{initials(n.memberName)}</div>
                          <span style={{ fontSize:13, fontWeight:700, color:C.textPrimary }}>{n.memberName}</span>
                        </div>
                        <button onClick={()=>deleteStandupNote(n.id)} style={{ background:'none', border:'none', color:C.textSecondary, cursor:'pointer', fontSize:18, padding:'0 2px', lineHeight:1, fontFamily:'inherit' }}>×</button>
                      </div>
                      {[{l:'Did',v:n.did},{l:'Will',v:n.will},{l:'Blockers',v:n.blockers}].filter(r=>r.v).map(r=>(
                        <div key={r.l} style={{ marginBottom:3 }}>
                          <span style={{ fontSize:11, fontWeight:700, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.4 }}>{r.l}  </span>
                          <span style={{ fontSize:12, color:r.l==='Blockers'?C.danger:C.textPrimary }}>{r.v}</span>
                        </div>
                      ))}
                    </div>
                  ))
                }
              </Card>
              {histDates.length>0 && (
                <Card C={C}>
                  <SecTitle C={C}>History</SecTitle>
                  {histDates.slice(0,10).map(d=>(
                    <div key={d}>
                      <div onClick={()=>setExpandedDate(expandedDate===d?null:d)} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer' }}>
                        <span style={{ fontSize:13, fontWeight:500, color:C.textPrimary }}>{d}</span>
                        <div style={{ display:'flex', gap:8 }}>
                          <span style={{ fontSize:11, color:C.textSecondary }}>{byDate[d].length} entries</span>
                          <span style={{ fontSize:11, color:C.textSecondary }}>{expandedDate===d?'▲':'▼'}</span>
                        </div>
                      </div>
                      {expandedDate===d && byDate[d].map(n=>(
                        <div key={n.id} style={{ padding:'7px 0 7px 12px', borderBottom:`1px solid ${C.border}` }}>
                          <div style={{ fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:3 }}>{n.memberName}</div>
                          {n.did      && <div style={{ fontSize:11, color:C.textSecondary, marginBottom:2 }}><strong>Did:</strong> {n.did}</div>}
                          {n.will     && <div style={{ fontSize:11, color:C.textSecondary, marginBottom:2 }}><strong>Will:</strong> {n.will}</div>}
                          {n.blockers && <div style={{ fontSize:11, color:C.danger }}><strong>Blockers:</strong> {n.blockers}</div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {subTab==='retro' && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <label style={{ fontSize:12, fontWeight:600, color:C.textPrimary }}>Sprint:</label>
            <select value={retroId} onChange={e=>switchRetroSprint(e.target.value)}
              style={{ padding:'7px 10px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }}>
              <option value="global">— General —</option>
              {sprints.map(s=><option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
            </select>
            <span style={{ fontSize:11, color:C.success, fontWeight:600 }}>✓ Auto-saved to browser</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {RETRO_CATS.map(cat=>{
              const cc=C[cat.ck]
              return (
                <Card key={cat.id} C={C}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:C.textPrimary }}>{cat.label}</span>
                    <span style={{ fontSize:11, fontWeight:600, color:cc, background:cc+'15', borderRadius:10, padding:'2px 8px' }}>{retro[cat.id].length}</span>
                  </div>
                  <div style={{ borderBottom:`1px solid ${C.border}`, marginBottom:12 }}/>
                  {retro[cat.id].map((item,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:8 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:cc, flexShrink:0, marginTop:6 }}/>
                      <span style={{ fontSize:13, color:C.textSecondary, lineHeight:1.5, flex:1 }}>{item}</span>
                      <button onClick={()=>retroRemove(cat.id,i)} style={{ background:'none', border:'none', color:C.textSecondary, cursor:'pointer', fontSize:16, padding:0, lineHeight:1, fontFamily:'inherit' }}>×</button>
                    </div>
                  ))}
                  <div style={{ display:'flex', gap:6, marginTop:10 }}>
                    <input value={newItems[cat.id]} onChange={e=>setNewItems(n=>({...n,[cat.id]:e.target.value}))}
                      onKeyDown={e=>e.key==='Enter'&&retroAdd(cat.id)} placeholder="Add item…"
                      style={{ flex:1, padding:'7px 10px', border:`1.5px solid ${C.border}`, borderRadius:7, fontSize:12, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }}/>
                    <button onClick={()=>retroAdd(cat.id)} style={{ padding:'7px 12px', background:cc, color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>+</button>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {subTab==='impediments' && (
        <>
          <Card C={C} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:C.textPrimary }}>Log New Impediment</h3>
              <span style={{ fontSize:11, color:C.success, fontWeight:600 }}>✓ Saved to browser</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr auto', gap:10 }}>
              <input style={{ padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }}
                placeholder="Describe a blocker or impediment…" value={impText} onChange={e=>setImpText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&logImp()}/>
              <input list="imp-owners" style={{ padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }}
                placeholder="Owner (optional)" value={impOwner} onChange={e=>setImpOwner(e.target.value)}/>
              <datalist id="imp-owners">{allTeamMembers.map(m=><option key={m} value={m}/>)}</datalist>
              <button onClick={logImp} style={{ padding:'9px 18px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Log</button>
            </div>
          </Card>
          <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
            {allImps.length===0
              ? <div style={{ padding:'40px', textAlign:'center' }}>
                  <p style={{ margin:'0 0 4px', fontSize:14, fontWeight:600, color:C.textPrimary }}>No impediments</p>
                  <p style={{ margin:0, fontSize:12, color:C.textSecondary }}>No impediments.</p>
                </div>
              : <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                  <thead><tr style={{ borderBottom:`2px solid ${C.border}` }}>
                    {['Impediment','Owner','Severity','Source','Status',''].map(h=>(
                      <th key={h} style={{ padding:'10px 13px', textAlign:'left', fontSize:11, fontWeight:600, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.5 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {allImps.map((imp,i)=>{
                      const sv=sevC[imp.severity]||sevC.medium
                      const st=stC[imp.status]||stC.open
                      return (
                        <tr key={imp.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.cardBg:C.mainBg }}>
                          <td style={{ padding:'11px 13px', fontWeight:500, color:C.textPrimary, maxWidth:240 }}>{imp.title}</td>
                          <td style={{ padding:'11px 13px', color:C.textSecondary }}>{imp.owner}</td>
                          <td style={{ padding:'11px 13px' }}><Badge label={imp.severity} color={sv.color} bg={sv.bg}/></td>
                          <td style={{ padding:'11px 13px', fontSize:11, color:C.textSecondary }}>{imp.source==='risk'?'From risks':'Manual'}</td>
                          <td style={{ padding:'11px 13px' }}><Badge label={imp.status.replace('_',' ')} color={st.color} bg={st.bg}/></td>
                          <td style={{ padding:'11px 13px' }}>
                            <div style={{ display:'flex', gap:6 }}>
                              {imp.source==='manual'&&imp.status!=='resolved'&&(
                                <button onClick={()=>resolveImp(imp.id)} style={{ padding:'3px 9px', background:C.success+'15', color:C.success, border:`1px solid ${C.success}30`, borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Resolve</button>
                              )}
                              {imp.source==='manual'&&(
                                <button onClick={()=>removeImp(imp.id)} style={{ padding:'3px 9px', background:C.danger+'10', color:C.danger, border:`1px solid ${C.danger}25`, borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Delete</button>
                              )}
                              {imp.source==='risk'&&<span style={{ fontSize:11, color:C.textSecondary }}>Manage in Risks tab</span>}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
            }
          </div>
        </>
      )}
    </>
  )
}

// ── DOD TAB ───────────────────────────────────────────────────────────────────
function DoDTab({ projects }) {
  const C = useThemeColors()
  const { dodItems, addDodItem, deleteDodItem, toggleDodItem, dodChecks, setDodCheck } = useScrum()
  const [newText,   setNewText]   = useState('')
  const [newCat,    setNewCat]    = useState('Quality')
  const [selFeatId, setSelFeatId] = useState('')

  const allFeatures   = projects.flatMap(p => (p.features||[]).map(f=>({...f,projectName:p.name})))
  const selFeat       = allFeatures.find(f=>f.id===selFeatId)
  const featChecks    = dodChecks?.[selFeatId]||{}
  const activeItems   = dodItems.filter(d=>d.enabled)
  const checkedCount  = activeItems.filter(d=>featChecks[d.id]===true).length
  const completionPct = activeItems.length>0?Math.round(checkedCount/activeItems.length*100):0

  const byCategory = dodItems.reduce((acc,d)=>{ (acc[d.cat]=acc[d.cat]||[]).push(d); return acc },{})

  const inp = { width:'100%', padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit', boxSizing:'border-box' }

  function addItem() {
    if(!newText.trim()) return
    addDodItem({ text:newText.trim(), cat:newCat })
    setNewText('')
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
      {/* Left: global criteria */}
      <div>
        <Card C={C} style={{ marginBottom:14 }}>
          <SecTitle C={C}>Global DoD Criteria</SecTitle>
          <p style={{ margin:'0 0 14px', fontSize:12, color:C.textSecondary }}>Toggle criteria on/off. Enabled items apply to all feature trackers by default.</p>
          {dodItems.length===0 && <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>No criteria yet. Add your first one below.</p>}
          {Object.entries(byCategory).map(([cat,items])=>(
            <div key={cat} style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.6, marginBottom:6 }}>{cat}</div>
              {items.map(item=>(
                <div key={item.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 0', borderBottom:`1px solid ${C.border}` }}>
                  <input type="checkbox" checked={item.enabled} onChange={()=>toggleDodItem(item.id)} style={{ cursor:'pointer', width:14, height:14, accentColor:C.primary }}/>
                  <span style={{ flex:1, fontSize:13, color:item.enabled?C.textPrimary:C.textSecondary, textDecoration:item.enabled?'none':'line-through' }}>{item.text}</span>
                  <button onClick={()=>deleteDodItem(item.id)} style={{ background:'none', border:'none', color:C.textSecondary, cursor:'pointer', fontSize:15, padding:'0 2px', lineHeight:1, fontFamily:'inherit' }}>×</button>
                </div>
              ))}
            </div>
          ))}
        </Card>
        <Card C={C}>
          <SecTitle C={C}>Add Criterion</SecTitle>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Category</label>
            <select value={newCat} onChange={e=>setNewCat(e.target.value)} style={inp}>
              {['Quality','Testing','Deployment','Documentation','Security','Performance'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Criterion</label>
            <input style={inp} placeholder="e.g. Unit tests written and passing" value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addItem()}/>
          </div>
          <button onClick={addItem} disabled={!newText.trim()} style={{ width:'100%', padding:'9px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:!newText.trim()?.5:1 }}>Add Criterion</button>
        </Card>
      </div>

      {/* Right: per-feature tracker */}
      <Card C={C}>
        <SecTitle C={C}>Feature DoD Tracker</SecTitle>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Select Feature</label>
          <select value={selFeatId} onChange={e=>setSelFeatId(e.target.value)} style={inp}>
            <option value="">— select a feature —</option>
            {allFeatures.map(f=><option key={f.id} value={f.id}>{f.projectName} › {f.name}</option>)}
          </select>
        </div>
        {!selFeatId
          ? <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>Select a feature to track its DoD completion status.</p>
          : <>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16, padding:'12px 14px', background:C.mainBg, borderRadius:9, border:`1px solid ${C.border}` }}>
                <MiniRing todo={activeItems.length-checkedCount} inProg={0} done={checkedCount} C={C} size={52}/>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:completionPct===100?C.success:C.textPrimary }}>{completionPct}% DoD Complete</div>
                  <div style={{ fontSize:12, color:C.textSecondary }}>{selFeat?.name} · {selFeat?.projectName}</div>
                  <div style={{ fontSize:11, color:C.textSecondary, marginTop:2 }}>{checkedCount}/{activeItems.length} criteria met</div>
                </div>
              </div>
              {activeItems.length===0
                ? <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>Enable criteria on the left to track them here.</p>
                : activeItems.map(item=>(
                  <div key={item.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                    <input type="checkbox" checked={featChecks[item.id]===true} onChange={e=>setDodCheck(selFeatId,item.id,e.target.checked)} style={{ cursor:'pointer', width:14, height:14, accentColor:C.success }}/>
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:13, color:featChecks[item.id]?C.textSecondary:C.textPrimary, textDecoration:featChecks[item.id]?'line-through':'none' }}>{item.text}</span>
                    </div>
                    <span style={{ fontSize:10, color:C.textSecondary, background:C.border, padding:'1px 6px', borderRadius:3 }}>{item.cat}</span>
                  </div>
                ))
              }
            </>
        }
      </Card>
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function ScrumMasterPortal() {
  const C = useThemeColors()
  const { profile } = useAuth()
  const { projects, loading } = useProjects()
  const { sprints, standupNotes, scrumLoading, burndownSnapshots, recordBurndownSnapshot, loadBurndownSnapshots } = useScrum()
  const [tab, setTab] = useState('board')

  const allTasks       = projects.flatMap(p => (p.tasks||[]).map(t=>({...t,projectName:p.name,projectId:p.id})))
  const allRisks       = projects.flatMap(p => (p.risks||[]).map(r=>({...r,projectName:p.name})))
  const allTeamMembers = [...new Set(projects.flatMap(p => (p.team||[]).map(m=>m.name||m.email).filter(Boolean)))]
  const activeSprint   = sprints.find(s=>s.status==='active')
  const openImpCnt     = allRisks.filter(r=>r.status==='Open'||r.status==='In Progress').length
  const activeProjects = projects.filter(p=>p.status==='Active')

  const TABS = [
    { id:'board',   label:'Board',       icon:'⬛' },
    { id:'backlog', label:'Backlog',     icon:'☰'  },
    { id:'sprints', label:'Sprints',     icon:'▶'  },
    { id:'reports', label:'Reports',     icon:'◈'  },
    { id:'team',    label:`Team${openImpCnt>0?` (${openImpCnt})`:''}`, icon:'◉' },
    { id:'dod',     label:'Def of Done', icon:'✓'  },
  ]

  if (loading||scrumLoading) return (
    <div style={{ padding:28, background:C.mainBg, minHeight:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:C.textSecondary, fontSize:14, margin:0 }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ padding:28, background:C.mainBg, minHeight:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:C.textPrimary }}>Scrum Board</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:C.textSecondary }}>
            {activeProjects.length} active project{activeProjects.length!==1?'s':''}
            {activeSprint?` · Active: ${activeSprint.name}`:'  · No active sprint'}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {activeSprint && (
            <span style={{ padding:'5px 13px', borderRadius:20, fontSize:12, fontWeight:600, background:C.success+'12', color:C.success, border:`1px solid ${C.success}30` }}>● {activeSprint.name}</span>
          )}
          {openImpCnt>0 && (
            <span style={{ padding:'5px 13px', borderRadius:20, fontSize:12, fontWeight:600, background:C.danger+'12', color:C.danger, border:`1px solid ${C.danger}30` }}>⚠ {openImpCnt} impediment{openImpCnt!==1?'s':''}</span>
          )}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display:'flex', gap:2, borderBottom:`2px solid ${C.border}`, marginBottom:22 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:tab===t.id?700:400, fontFamily:'inherit', color:tab===t.id?C.primary:C.textSecondary, borderBottom:tab===t.id?`2px solid ${C.primary}`:'2px solid transparent', marginBottom:-2, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5, transition:'color .15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab==='board'   && <BoardTab   allTasks={allTasks} sprints={sprints} projects={projects} standupNotes={standupNotes} teamMembers={allTeamMembers}/>}
      {tab==='backlog' && <BacklogTab allTasks={allTasks} sprints={sprints} projects={projects} teamMembers={allTeamMembers}/>}
      {tab==='sprints' && <SprintsTab sprints={sprints} allTasks={allTasks} projects={projects}/>}
      {tab==='reports' && <ReportsTab sprints={sprints} allTasks={allTasks} allTeamMembers={allTeamMembers} burndownSnapshots={burndownSnapshots} recordBurndownSnapshot={recordBurndownSnapshot} loadBurndownSnapshots={loadBurndownSnapshots}/>}
      {tab==='team'    && <TeamTab    allTeamMembers={allTeamMembers} allRisks={allRisks} profile={profile} sprints={sprints}/>}
      {tab==='dod'     && <DoDTab     projects={projects}/>}
    </div>
  )
}
