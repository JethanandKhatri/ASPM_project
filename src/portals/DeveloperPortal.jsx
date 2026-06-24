import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const NAV = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '📋', label: 'My Tasks', path: '/dashboard/tasks' },
  { icon: '🗂️', label: 'Sprint Board', path: '/dashboard/sprint' },
  { icon: '📖', label: 'User Stories', path: '/dashboard/stories' },
  { icon: '☀️', label: 'Daily Standup', path: '/dashboard/standup' },
]

const TASKS = [
  { id: 1, title: 'Implement user auth API', status: 'in_progress', priority: 'high', points: 5, sprint: 'Sprint 4' },
  { id: 2, title: 'Fix pagination bug on dashboard', status: 'todo', priority: 'medium', points: 2, sprint: 'Sprint 4' },
  { id: 3, title: 'Write unit tests for service layer', status: 'todo', priority: 'low', points: 3, sprint: 'Sprint 4' },
  { id: 4, title: 'Code review: PR #142', status: 'done', priority: 'high', points: 1, sprint: 'Sprint 4' },
  { id: 5, title: 'Update API documentation', status: 'done', priority: 'low', points: 2, sprint: 'Sprint 3' },
]

const BOARD_COLS = [
  { id: 'todo', label: 'To Do', color: '#6b7280', bg: '#f9fafb' },
  { id: 'in_progress', label: 'In Progress', color: '#6366f1', bg: '#eef2ff' },
  { id: 'review', label: 'In Review', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'done', label: 'Done', color: '#10b981', bg: '#d1fae5' },
]

const PRIORITY_COLOR = { high: '#dc2626', medium: '#f59e0b', low: '#10b981' }

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [standupText, setStandupText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const done = TASKS.filter((t) => t.status === 'done').length
  const inProgress = TASKS.filter((t) => t.status === 'in_progress').length
  const total = TASKS.length

  return (
    <div style={styles.layout}>
      <Sidebar navItems={NAV} />
      <main style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Developer Portal</h1>
            <p style={styles.pageSub}>Sprint 4 · June 18 – July 1, 2026</p>
          </div>
          <div style={styles.sprintBadge}>🔥 Active Sprint</div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { id: 'dashboard', label: '📊 Overview' },
            { id: 'board', label: '🗂️ Sprint Board' },
            { id: 'standup', label: '☀️ Standup' },
          ].map((t) => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (
          <>
            <div style={styles.statsRow}>
              {[
                { label: 'Total Tasks', value: total, color: '#6366f1', icon: '📋' },
                { label: 'In Progress', value: inProgress, color: '#f59e0b', icon: '⚙️' },
                { label: 'Completed', value: done, color: '#10b981', icon: '✅' },
                { label: 'Story Points', value: TASKS.reduce((a, t) => a + t.points, 0), color: '#0ea5e9', icon: '⭐' },
              ].map((s) => (
                <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 26 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={styles.progressCard}>
              <div style={styles.progressHeader}>
                <span style={styles.sectionTitle}>Sprint Progress</span>
                <span style={{ color: '#6366f1', fontWeight: 600 }}>{Math.round((done / total) * 100)}%</span>
              </div>
              <div style={styles.progressBg}>
                <div style={{ ...styles.progressFill, width: `${(done / total) * 100}%` }} />
              </div>
              <p style={styles.progressSub}>{done} of {total} tasks completed · {total - done} remaining</p>
            </div>

            {/* Task list */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>My Tasks</h3>
              <div style={styles.taskList}>
                {TASKS.map((task) => (
                  <div key={task.id} style={styles.taskRow}>
                    <div style={{ ...styles.taskStatus, background: task.status === 'done' ? '#d1fae5' : '#eef2ff' }}>
                      {task.status === 'done' ? '✅' : task.status === 'in_progress' ? '⚙️' : '📌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...styles.taskTitle, textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#9ca3af' : '#111827' }}>
                        {task.title}
                      </div>
                      <div style={styles.taskMeta}>{task.sprint} · {task.points} pts</div>
                    </div>
                    <span style={{ ...styles.priorityBadge, color: PRIORITY_COLOR[task.priority], background: PRIORITY_COLOR[task.priority] + '18' }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sprint Board tab */}
        {activeTab === 'board' && (
          <div style={styles.boardWrap}>
            {BOARD_COLS.map((col) => {
              const colTasks = TASKS.filter((t) => t.status === col.id)
              return (
                <div key={col.id} style={{ ...styles.boardCol, background: col.bg }}>
                  <div style={styles.colHeader}>
                    <span style={{ ...styles.colTitle, color: col.color }}>{col.label}</span>
                    <span style={{ ...styles.colCount, background: col.color }}>{colTasks.length}</span>
                  </div>
                  {colTasks.map((task) => (
                    <div key={task.id} style={styles.boardCard}>
                      <p style={styles.boardCardTitle}>{task.title}</p>
                      <div style={styles.boardCardMeta}>
                        <span style={{ ...styles.priorityBadge, color: PRIORITY_COLOR[task.priority], background: PRIORITY_COLOR[task.priority] + '18' }}>
                          {task.priority}
                        </span>
                        <span style={styles.pointsBadge}>⭐ {task.points}</span>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && <div style={styles.emptyCol}>No tasks here</div>}
                </div>
              )
            })}
          </div>
        )}

        {/* Standup tab */}
        {activeTab === 'standup' && (
          <div style={styles.standupWrap}>
            <div style={styles.standupCard}>
              <h3 style={styles.sectionTitle}>Daily Standup — {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
              {!submitted ? (
                <>
                  {[
                    { q: '✅ What did you do yesterday?', key: 'yesterday' },
                    { q: '🎯 What will you do today?', key: 'today' },
                    { q: '🚧 Any blockers or impediments?', key: 'blockers' },
                  ].map((q) => (
                    <div key={q.key} style={{ marginBottom: 18 }}>
                      <label style={styles.label}>{q.q}</label>
                      <textarea
                        style={styles.textarea}
                        rows={3}
                        placeholder="Type your update..."
                        onChange={(e) => setStandupText((prev) => prev + e.target.value)}
                      />
                    </div>
                  ))}
                  <button style={styles.submitBtn} onClick={() => setSubmitted(true)}>
                    Submit Standup ✓
                  </button>
                </>
              ) : (
                <div style={styles.successBox}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>Standup Submitted!</h4>
                  <p style={{ color: '#4b5563', fontSize: 14 }}>Your daily update has been recorded. Great work keeping the team informed!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" },
  main: { flex: 1, padding: '32px 36px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle: { fontSize: 26, fontWeight: 800, color: '#1e1b4b', marginBottom: 4 },
  pageSub: { fontSize: 13, color: '#6b7280' },
  sprintBadge: { background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  tabs: { display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 28, width: 'fit-content' },
  tab: { padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: '#6b7280' },
  tabActive: { background: '#fff', color: '#4338ca', fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 14, padding: '20px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 500 },
  progressCard: { background: '#fff', borderRadius: 14, padding: 24, marginBottom: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  progressBg: { background: '#e5e7eb', borderRadius: 99, height: 10, overflow: 'hidden' },
  progressFill: { background: 'linear-gradient(90deg,#4338ca,#6366f1)', height: '100%', borderRadius: 99, transition: 'width 0.5s' },
  progressSub: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  section: { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 },
  taskList: { display: 'flex', flexDirection: 'column', gap: 10 },
  taskRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' },
  taskStatus: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  taskTitle: { fontSize: 14, fontWeight: 500 },
  taskMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  priorityBadge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' },
  boardWrap: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  boardCol: { borderRadius: 14, padding: 16, minHeight: 400 },
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  colTitle: { fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  colCount: { width: 20, height: 20, borderRadius: 6, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 },
  boardCard: { background: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'grab' },
  boardCardTitle: { fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 10 },
  boardCardMeta: { display: 'flex', gap: 8, alignItems: 'center' },
  pointsBadge: { fontSize: 11, color: '#6b7280', fontWeight: 500 },
  emptyCol: { textAlign: 'center', color: '#9ca3af', fontSize: 13, paddingTop: 24 },
  standupWrap: { display: 'flex', justifyContent: 'center' },
  standupCard: { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 640, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 },
  textarea: { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none', color: '#111827' },
  submitBtn: { padding: '12px 24px', background: 'linear-gradient(135deg,#4338ca,#6366f1)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  successBox: { textAlign: 'center', padding: '32px 0' },
}
