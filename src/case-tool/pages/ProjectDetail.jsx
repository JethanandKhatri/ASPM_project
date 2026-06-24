import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'

const C = {
  primary: '#3B5998', mainBg: '#F4F6FB', cardBg: '#FFFFFF', border: '#E0E4ED',
  textPrimary: '#1A1A2E', textSecondary: '#6B7280',
  danger: '#E24B4A', warning: '#EF9F27', success: '#639922',
}

function StatusBadge({ status }) {
  const cfg = { Active: { bg: '#dbeafe', color: '#1d4ed8' }, Completed: { bg: '#dcfce7', color: '#15803d' }, 'On Hold': { bg: '#fef9c3', color: '#92400e' } }[status] || { bg: '#f3f4f6', color: '#374151' }
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{status}</span>
}

function PriorityBadge({ priority }) {
  const cfg = { High: { bg: '#fef2f2', color: C.danger }, Medium: { bg: '#fffbeb', color: C.warning }, Low: { bg: '#f0fdf4', color: C.success } }[priority] || {}
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{priority}</span>
}

function MetricCard({ label, value, sub, icon, color }) {
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: (color || C.primary) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSecondary }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color || C.primary, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

// ---- Overview Tab ----
function OverviewTab({ project }) {
  const statusColor = { Done: C.success, 'In Progress': C.primary, 'To Do': C.textSecondary }
  return (
    <div>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Project Description</h4>
        <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{project.description}</p>
      </div>
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
        <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Features ({project.features.length})</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {['#', 'Feature Name', 'Description', 'Priority', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {project.features.map((f, i) => (
              <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : C.mainBg }}>
                <td style={{ padding: '10px 12px', color: C.textSecondary }}>{i + 1}</td>
                <td style={{ padding: '10px 12px', fontWeight: 500, color: C.textPrimary }}>{f.name}</td>
                <td style={{ padding: '10px 12px', color: C.textSecondary }}>{f.description}</td>
                <td style={{ padding: '10px 12px' }}><PriorityBadge priority={f.priority} /></td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: statusColor[f.status] || C.textSecondary }}>{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Estimation Tab ----
function EstimationTab({ project, onRunEstimation, onViewComparison }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Estimation Runs ({project.estimations.length})</h4>
        {project.estimations.length > 1 && (
          <button onClick={onViewComparison} style={{ padding: '6px 14px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            View Comparison
          </button>
        )}
      </div>
      {project.estimations.length === 0 ? (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, textAlign: 'center' }}>
          <p style={{ color: C.textSecondary, margin: 0 }}>No estimations yet. Click "Run Estimation" to start.</p>
        </div>
      ) : (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.primary + '0d', borderBottom: `2px solid ${C.border}` }}>
                {['Version', 'Technique', 'Date', 'Effort', 'Cost', 'Duration', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.estimations.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : C.mainBg }}>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: C.primary }}>{e.version}</td>
                  <td style={{ padding: '11px 14px', color: C.textPrimary }}>{e.technique}</td>
                  <td style={{ padding: '11px 14px', color: C.textSecondary }}>{e.date}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 500, color: C.textPrimary }}>{e.effort}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 500, color: C.textPrimary }}>{e.cost}</td>
                  <td style={{ padding: '11px 14px', color: C.textSecondary }}>{e.duration}</td>
                  <td style={{ padding: '11px 14px' }}><span style={{ padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---- Risks Tab ----
function RisksTab({ project, onManageRisks }) {
  const topRisks = [...project.risks].sort((a, b) => b.riskExposure - a.riskExposure).slice(0, 5)
  const priorityColor = { High: C.danger, Medium: C.warning, Low: C.success }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Top Risks by Exposure</h4>
        <button onClick={onManageRisks} style={{ padding: '6px 14px', background: C.danger + '15', color: C.danger, border: `1px solid ${C.danger}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          Manage All Risks
        </button>
      </div>
      {topRisks.length === 0 ? (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, textAlign: 'center' }}>
          <p style={{ color: C.textSecondary, margin: 0 }}>No risks logged yet.</p>
        </div>
      ) : (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.danger + '0d', borderBottom: `2px solid ${C.border}` }}>
                {['Risk Description', 'Category', 'Probability', 'Risk Exposure', 'Priority', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.danger, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topRisks.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : C.mainBg }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: C.textPrimary, maxWidth: 200 }}>{r.description}</td>
                  <td style={{ padding: '10px 14px', color: C.textSecondary }}>{r.category}</td>
                  <td style={{ padding: '10px 14px', color: C.textPrimary }}>{r.probability}%</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: priorityColor[r.priority] }}>${r.riskExposure.toLocaleString()}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: priorityColor[r.priority] + '20', color: priorityColor[r.priority] }}>{r.priority}</span></td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: r.status === 'Resolved' ? C.success : r.status === 'In Progress' ? C.warning : C.textSecondary }}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---- Team Tab ----
function TeamTab({ project }) {
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
      <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Team Members ({project.team.length})</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {project.team.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.mainBg }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {m.name[0]}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{m.name}</div>
              <div style={{ fontSize: 11, color: m.role === 'project_manager' ? C.primary : C.textSecondary, fontWeight: m.role === 'project_manager' ? 600 : 400 }}>
                {m.role === 'project_manager' ? 'Project Manager' : 'Team Member'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Activity Tab ----
function ActivityTab({ project, onAddComment }) {
  const [commentText, setCommentText] = useState('')

  function submitComment() {
    if (!commentText.trim()) return
    onAddComment({ author: 'You', text: commentText.trim() })
    setCommentText('')
  }

  const allItems = [
    ...project.comments.map(c => ({ ...c, itemType: 'comment' })),
    ...(project.activityLog || []).map(a => ({ ...a, itemType: 'activity' })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <div>
      {/* Comment input */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
        <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
          placeholder="Add a comment... Use @ to mention a team member"
          style={{ width: '100%', padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, resize: 'none', minHeight: 72, boxSizing: 'border-box', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={submitComment} disabled={!commentText.trim()}
            style={{ padding: '7px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: commentText.trim() ? 1 : 0.5 }}>
            Comment
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Activity Feed</span>
      </div>

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {allItems.map((item, i) => (
          <div key={item.id || i} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, display: 'flex', gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: item.itemType === 'comment' ? C.primary : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: item.itemType === 'comment' ? '#fff' : '#374151', flexShrink: 0 }}>
              {item.itemType === 'comment' ? (item.author || 'Y')[0] : '⚙'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{item.author || item.user}</span>
                {item.itemType === 'activity' && <span style={{ fontSize: 12, color: C.textSecondary }}>{item.action}</span>}
                <span style={{ fontSize: 11, color: C.textSecondary, marginLeft: 'auto' }}>{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              {item.itemType === 'comment' && <p style={{ margin: 0, fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>{item.text}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Tasks Tab ----
function TasksTab({ project, onAddTask, onMoveTask }) {
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ name: '', assignee: '', priority: 'Medium', dueDate: '', feature: '', description: '' })
  const columns = ['To Do', 'In Progress', 'Done']
  const colColors = { 'To Do': '#6b7280', 'In Progress': C.primary, Done: C.success }

  function submitTask() {
    if (!newTask.name.trim()) return
    onAddTask(newTask)
    setShowModal(false)
    setNewTask({ name: '', assignee: '', priority: 'Medium', dueDate: '', feature: '', description: '' })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={() => setShowModal(true)} style={{ padding: '7px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Task</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {columns.map(col => {
          const tasks = project.tasks.filter(t => t.status === col)
          return (
            <div key={col} style={{ background: C.mainBg, borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: colColors[col] }}>{col}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: colColors[col], borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tasks.map(task => (
                  <div key={task.id} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{task.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: task.priority === 'High' ? C.danger : task.priority === 'Medium' ? C.warning : C.success, background: (task.priority === 'High' ? C.danger : task.priority === 'Medium' ? C.warning : C.success) + '18', padding: '1px 6px', borderRadius: 3 }}>{task.priority}</span>
                    </div>
                    {task.feature && <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Feature: {task.feature}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.primary }}>{task.assignee[0]?.toUpperCase()}</span>
                      {task.dueDate && <span style={{ fontSize: 10, color: C.textSecondary }}>{task.dueDate}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {columns.filter(c => c !== col).map(nextCol => (
                        <button key={nextCol} onClick={() => onMoveTask(task.id, nextCol)}
                          style={{ fontSize: 10, padding: '2px 7px', border: `1px solid ${C.border}`, borderRadius: 4, background: '#fff', color: C.textSecondary, cursor: 'pointer' }}>
                          → {nextCol}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Add Task</h3>
            {[['Task Name', 'name', 'text', 'e.g. Build login page'], ['Assign To', 'assignee', 'text', 'Team member name'], ['Due Date', 'dueDate', 'date', ''], ['Feature', 'feature', 'text', 'Linked feature (optional)']].map(([label, key, type, ph]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{label}</label>
                <input type={type} placeholder={ph} value={newTask[key]} onChange={e => setNewTask(t => ({ ...t, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}
                style={{ width: '100%', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none' }}>
                {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: `1px solid ${C.border}`, borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={submitTask} style={{ padding: '8px 16px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Timeline Tab ----
function TimelineTab({ project }) {
  const today = new Date()
  const start = new Date(project.startDate)
  const end = new Date(project.deadline)
  const totalDays = Math.max((end - start) / 86400000, 1)
  const statusColors = { Done: C.success, 'In Progress': C.primary, 'To Do': '#C4C9D4', Overdue: C.danger }

  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Timeline / Gantt Chart</h4>
        <div style={{ display: 'flex', gap: 12 }}>
          {Object.entries(statusColors).map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 11, color: C.textSecondary }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 700 }}>
          <div style={{ display: 'flex', marginBottom: 8 }}>
            <div style={{ width: 160, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.textSecondary }}>
              <span>{project.startDate}</span>
              <span>Today</span>
              <span>{project.deadline}</span>
            </div>
          </div>
          {/* Today line indicator */}
          <div style={{ position: 'relative' }}>
            {project.features.map((f, i) => {
              const duration = totalDays / project.features.length
              const offsetFraction = (i * duration) / totalDays
              const widthFraction = duration / totalDays
              const isOverdue = f.status !== 'Done' && new Date() > end
              const color = isOverdue ? C.danger : statusColors[f.status] || '#C4C9D4'
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                  <div style={{ width: 148, fontSize: 12, color: C.textPrimary, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.name}>{f.name}</div>
                  <div style={{ flex: 1, height: 22, background: '#f3f4f6', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: `${offsetFraction * 100}%`, width: `${widthFraction * 100}%`, height: '100%', background: color, borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 6 }}>
                      <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.status}</span>
                    </div>
                    {/* Today marker */}
                    {today >= start && today <= end && (
                      <div style={{ position: 'absolute', left: `${((today - start) / (end - start)) * 100}%`, top: 0, bottom: 0, width: 2, background: C.danger, zIndex: 2 }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Main Component ----
export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addComment, addTask, updateTaskStatus } = useProjects()
  const project = getProject(id)
  const [tab, setTab] = useState('Overview')

  if (!project) {
    return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>
  }

  const tabs = ['Overview', 'Estimation', 'Risks', 'Team', 'Activity', 'Tasks', 'Timeline']
  const doneFeat = project.features.filter(f => f.status === 'Done').length
  const durationDays = Math.ceil((new Date(project.deadline) - new Date(project.startDate)) / 86400000)

  return (
    <div style={{ padding: 28 }}>
      {/* Back button */}
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
        ← Back to Projects
      </button>

      {/* Header */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>{project.name}</h1>
              <StatusBadge status={project.status} />
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: C.primary + '18', color: C.primary }}>{project.domain}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: C.textSecondary }}>
              <span>📅 {project.startDate} → {project.deadline}</span>
              <span>👥 {project.teamSize} members</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate(`/dashboard/projects/${id}/risks`)}
              style={{ padding: '8px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', color: C.textSecondary }}>
              + Add Risk
            </button>
            <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)}
              style={{ padding: '8px 14px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              Run Estimation
            </button>
            <button onClick={() => navigate(`/dashboard/projects/${id}/edit`)}
              style={{ padding: '8px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', color: C.textSecondary }}>
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        <MetricCard label="Total Features" value={project.features.length} sub={`${doneFeat} done`} icon="◈" />
        <MetricCard label="Estimation Runs" value={project.estimations.length} sub={project.estimations.length > 0 ? `Latest: ${project.estimations[project.estimations.length - 1].technique}` : 'None yet'} icon="▲" color="#0891b2" />
        <MetricCard label="Total Risks" value={project.risks.length} sub={`${project.risks.filter(r => r.priority === 'High').length} High priority`} icon="⚠" color={C.danger} />
        <MetricCard label="Duration" value={`${durationDays}d`} sub={`${project.startDate} – ${project.deadline}`} icon="📅" color={C.success} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${C.border}`, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? C.primary : C.textSecondary, borderBottom: tab === t ? `2px solid ${C.primary}` : '2px solid transparent', marginBottom: -2 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Overview' && <OverviewTab project={project} />}
      {tab === 'Estimation' && <EstimationTab project={project} onRunEstimation={() => navigate(`/dashboard/projects/${id}/estimate`)} onViewComparison={() => navigate(`/dashboard/projects/${id}/estimations`)} />}
      {tab === 'Risks' && <RisksTab project={project} onManageRisks={() => navigate(`/dashboard/projects/${id}/risks`)} />}
      {tab === 'Team' && <TeamTab project={project} />}
      {tab === 'Activity' && <ActivityTab project={project} onAddComment={comment => addComment(id, comment)} />}
      {tab === 'Tasks' && <TasksTab project={project} onAddTask={task => addTask(id, task)} onMoveTask={(taskId, status) => updateTaskStatus(id, taskId, status)} />}
      {tab === 'Timeline' && <TimelineTab project={project} />}
    </div>
  )
}
