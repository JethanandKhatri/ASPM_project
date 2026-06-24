import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const NAV = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '👥', label: 'My Team', path: '/dashboard/team' },
  { icon: '📈', label: 'Performance', path: '/dashboard/performance' },
  { icon: '🔁', label: 'Sprint Review', path: '/dashboard/review' },
  { icon: '🗓️', label: 'Leave Requests', path: '/dashboard/leave' },
]

const TEAM = [
  { name: 'Sara Ahmed', role: 'Frontend Dev', avatar: 'S', velocity: 24, tasks: 8, status: 'active' },
  { name: 'Bilal Khan', role: 'Backend Dev', avatar: 'B', velocity: 31, tasks: 11, status: 'active' },
  { name: 'Fatima Noor', role: 'QA Engineer', avatar: 'F', velocity: 18, tasks: 6, status: 'leave' },
  { name: 'Hassan Raza', role: 'Full Stack', avatar: 'H', velocity: 27, tasks: 9, status: 'active' },
  { name: 'Zara Malik', role: 'UI/UX Dev', avatar: 'Z', velocity: 20, tasks: 7, status: 'active' },
]

const SPRINTS = [
  { id: 'S3', name: 'Sprint 3', velocity: 82, planned: 90, completed: 82, bugs: 3 },
  { id: 'S2', name: 'Sprint 2', velocity: 75, planned: 80, completed: 75, bugs: 5 },
  { id: 'S1', name: 'Sprint 1', velocity: 60, planned: 70, completed: 60, bugs: 8 },
]

export default function LineManagerPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const activeCount = TEAM.filter((m) => m.status === 'active').length
  const totalVelocity = TEAM.reduce((a, m) => a + m.velocity, 0)
  const totalTasks = TEAM.reduce((a, m) => a + m.tasks, 0)

  return (
    <div style={styles.layout}>
      <Sidebar navItems={NAV} />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Line Manager Portal</h1>
            <p style={styles.pageSub}>Team Overview · Sprint 4 Active</p>
          </div>
          <div style={styles.heroBadge}>👥 5 Team Members</div>
        </div>

        <div style={styles.tabs}>
          {[
            { id: 'dashboard', label: '📊 Overview' },
            { id: 'team', label: '👥 Team' },
            { id: 'velocity', label: '📈 Velocity' },
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

        {activeTab === 'dashboard' && (
          <>
            <div style={styles.statsRow}>
              {[
                { label: 'Active Members', value: activeCount, color: '#0ea5e9', icon: '👥' },
                { label: 'On Leave', value: TEAM.length - activeCount, color: '#f59e0b', icon: '🌴' },
                { label: 'Team Velocity', value: totalVelocity, color: '#10b981', icon: '⚡' },
                { label: 'Open Tasks', value: totalTasks, color: '#6366f1', icon: '📋' },
              ].map((s) => (
                <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 26 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={styles.twoCol}>
              {/* Team list */}
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>Team Members</h3>
                {TEAM.map((m) => (
                  <div key={m.name} style={styles.memberRow}>
                    <div style={{ ...styles.avatar, background: m.status === 'leave' ? '#9ca3af' : '#0ea5e9' }}>{m.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.memberName}>{m.name}</div>
                      <div style={styles.memberRole}>{m.role}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0ea5e9' }}>{m.velocity} pts</div>
                      <span style={{ ...styles.statusBadge, background: m.status === 'active' ? '#d1fae5' : '#fef3c7', color: m.status === 'active' ? '#16a34a' : '#92400e' }}>
                        {m.status === 'active' ? 'Active' : 'On Leave'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sprint health */}
              <div style={styles.card}>
                <h3 style={styles.sectionTitle}>Sprint Health</h3>
                {SPRINTS.map((s) => {
                  const pct = Math.round((s.completed / s.planned) * 100)
                  return (
                    <div key={s.id} style={{ marginBottom: 20 }}>
                      <div style={styles.sprintRow}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{s.name}</span>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{s.completed}/{s.planned} pts · {s.bugs} bugs</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#dc2626' }}>{pct}%</span>
                      </div>
                      <div style={styles.progressBg}>
                        <div style={{ ...styles.progressFill, width: `${pct}%`, background: pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#dc2626' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'team' && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Team Roster</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Member', 'Role', 'Velocity', 'Tasks', 'Status', 'Action'].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAM.map((m) => (
                  <tr key={m.name} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ ...styles.avatarSm, background: '#0ea5e9' }}>{m.avatar}</div>
                        {m.name}
                      </div>
                    </td>
                    <td style={styles.td}>{m.role}</td>
                    <td style={{ ...styles.td, color: '#0ea5e9', fontWeight: 600 }}>{m.velocity} pts</td>
                    <td style={styles.td}>{m.tasks}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: m.status === 'active' ? '#d1fae5' : '#fef3c7', color: m.status === 'active' ? '#16a34a' : '#92400e' }}>
                        {m.status === 'active' ? 'Active' : 'On Leave'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'velocity' && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Team Velocity Trend</h3>
            <div style={styles.chartArea}>
              {SPRINTS.slice().reverse().map((s, i) => {
                const maxV = 100
                const h = Math.round((s.velocity / maxV) * 180)
                const hp = Math.round((s.planned / maxV) * 180)
                return (
                  <div key={s.id} style={styles.barGroup}>
                    <div style={styles.barPair}>
                      <div style={{ ...styles.bar, height: hp, background: '#e5e7eb' }} title={`Planned: ${s.planned}`} />
                      <div style={{ ...styles.bar, height: h, background: '#0ea5e9' }} title={`Velocity: ${s.velocity}`} />
                    </div>
                    <div style={styles.barLabel}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600 }}>{s.velocity}</div>
                  </div>
                )
              })}
            </div>
            <div style={styles.legend}>
              <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#e5e7eb' }} /> Planned</span>
              <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#0ea5e9' }} /> Achieved</span>
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
  heroBadge: { background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  tabs: { display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 28, width: 'fit-content' },
  tab: { padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: '#6b7280' },
  tabActive: { background: '#fff', color: '#0ea5e9', fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 14, padding: '20px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 500 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  card: { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 },
  memberRow: { display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #f3f4f6' },
  avatar: { width: 38, height: 38, borderRadius: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 },
  avatarSm: { width: 28, height: 28, borderRadius: 8, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 },
  memberName: { fontSize: 13, fontWeight: 600, color: '#111827' },
  memberRole: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  statusBadge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  sprintRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressBg: { background: '#e5e7eb', borderRadius: 99, height: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99, transition: 'width 0.5s' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', padding: '8px 12px', borderBottom: '2px solid #f3f4f6', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr: { borderBottom: '1px solid #f9fafb' },
  td: { padding: '12px 12px', fontSize: 13, color: '#374151' },
  actionBtn: { padding: '4px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#4b5563' },
  chartArea: { display: 'flex', gap: 36, alignItems: 'flex-end', padding: '20px 0', justifyContent: 'center', minHeight: 220 },
  barGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  barPair: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  bar: { width: 36, borderRadius: '6px 6px 0 0', transition: 'height 0.5s' },
  barLabel: { fontSize: 12, fontWeight: 600, color: '#374151' },
  legend: { display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' },
  dot: { width: 12, height: 12, borderRadius: '50%', display: 'inline-block' },
}
