import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const NAV = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '📁', label: 'Project Portfolio', path: '/dashboard/portfolio' },
  { icon: '📊', label: 'Analytics', path: '/dashboard/analytics' },
  { icon: '💰', label: 'Budget', path: '/dashboard/budget' },
  { icon: '🎯', label: 'Milestones', path: '/dashboard/milestones' },
  { icon: '👤', label: 'User Management', path: '/dashboard/users' },
]

const PROJECTS = [
  { id: 1, name: 'E-Commerce Platform', status: 'active', progress: 68, team: 5, deadline: 'Aug 15', budget: 85, health: 'good' },
  { id: 2, name: 'Mobile Banking App', status: 'active', progress: 42, team: 7, deadline: 'Sep 30', budget: 60, health: 'at_risk' },
  { id: 3, name: 'HR Management System', status: 'planning', progress: 12, team: 4, deadline: 'Oct 15', budget: 20, health: 'good' },
  { id: 4, name: 'Analytics Dashboard', status: 'completed', progress: 100, team: 3, deadline: 'Jun 1', budget: 100, health: 'good' },
]

const MILESTONES = [
  { title: 'MVP Release', project: 'E-Commerce', date: 'Jul 15', status: 'upcoming' },
  { title: 'Security Audit', project: 'Mobile Banking', date: 'Jun 28', status: 'overdue' },
  { title: 'Beta Launch', project: 'HR Management', date: 'Aug 20', status: 'upcoming' },
  { title: 'Final Delivery', project: 'Analytics', date: 'Jun 1', status: 'done' },
  { title: 'Stakeholder Demo', project: 'E-Commerce', date: 'Jul 5', status: 'upcoming' },
]

const HEALTH_COLOR = { good: '#10b981', at_risk: '#f59e0b', critical: '#dc2626' }
const HEALTH_BG = { good: '#d1fae5', at_risk: '#fef3c7', critical: '#fef2f2' }

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const activeProjects = PROJECTS.filter((p) => p.status === 'active').length
  const completedProjects = PROJECTS.filter((p) => p.status === 'completed').length
  const totalBudgetUsed = Math.round(PROJECTS.reduce((a, p) => a + p.budget, 0) / PROJECTS.length)
  const atRisk = PROJECTS.filter((p) => p.health === 'at_risk').length

  return (
    <div style={styles.layout}>
      <Sidebar navItems={NAV} />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Project Manager Portal</h1>
            <p style={styles.pageSub}>Portfolio Overview · Q3 2026</p>
          </div>
          <button style={styles.newProjectBtn}>+ New Project</button>
        </div>

        <div style={styles.tabs}>
          {[
            { id: 'dashboard', label: '📊 Overview' },
            { id: 'portfolio', label: '📁 Portfolio' },
            { id: 'milestones', label: '🎯 Milestones' },
            { id: 'budget', label: '💰 Budget' },
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
                { label: 'Active Projects', value: activeProjects, color: '#6366f1', icon: '📁' },
                { label: 'Completed', value: completedProjects, color: '#10b981', icon: '✅' },
                { label: 'At Risk', value: atRisk, color: '#f59e0b', icon: '⚠️' },
                { label: 'Avg Budget Used', value: `${totalBudgetUsed}%`, color: '#0ea5e9', icon: '💰' },
              ].map((s) => (
                <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 26 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Project cards */}
            <div style={styles.projectGrid}>
              {PROJECTS.map((p) => (
                <div key={p.id} style={styles.projectCard}>
                  <div style={styles.projectTop}>
                    <div>
                      <div style={styles.projectName}>{p.name}</div>
                      <div style={styles.projectMeta}>👥 {p.team} members · 📅 {p.deadline}</div>
                    </div>
                    <span style={{ ...styles.healthBadge, color: HEALTH_COLOR[p.health], background: HEALTH_BG[p.health] }}>
                      {p.health === 'good' ? '✅ Good' : p.health === 'at_risk' ? '⚠️ At Risk' : '🔴 Critical'}
                    </span>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div style={styles.progressHeader}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Progress</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>{p.progress}%</span>
                    </div>
                    <div style={styles.progressBg}>
                      <div style={{ ...styles.progressFill, width: `${p.progress}%` }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={styles.progressHeader}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>Budget Used</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: p.budget > 80 ? '#f59e0b' : '#10b981' }}>{p.budget}%</span>
                    </div>
                    <div style={styles.progressBg}>
                      <div style={{ ...styles.progressFill, width: `${p.budget}%`, background: p.budget > 80 ? '#f59e0b' : '#10b981' }} />
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    <button style={styles.viewBtn}>View Details</button>
                    <button style={styles.editBtn}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'portfolio' && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>All Projects</h3>
            <table style={styles.table}>
              <thead>
                <tr>{['Project', 'Status', 'Progress', 'Team', 'Deadline', 'Budget', 'Health'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {PROJECTS.map((p) => (
                  <tr key={p.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 600 }}>{p.name}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: p.status === 'active' ? '#eef2ff' : p.status === 'completed' ? '#d1fae5' : '#f3f4f6', color: p.status === 'active' ? '#4338ca' : p.status === 'completed' ? '#16a34a' : '#6b7280' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ ...styles.progressBg, width: 80, margin: 0 }}>
                          <div style={{ ...styles.progressFill, width: `${p.progress}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1' }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>{p.team} members</td>
                    <td style={styles.td}>{p.deadline}</td>
                    <td style={{ ...styles.td, color: p.budget > 80 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{p.budget}%</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.healthBadge, color: HEALTH_COLOR[p.health], background: HEALTH_BG[p.health] }}>
                        {p.health === 'good' ? '✅ Good' : '⚠️ At Risk'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Project Milestones</h3>
            <div style={styles.milestoneList}>
              {MILESTONES.map((m, i) => (
                <div key={i} style={styles.milestoneRow}>
                  <div style={{ ...styles.milestoneDot, background: m.status === 'done' ? '#10b981' : m.status === 'overdue' ? '#dc2626' : '#6366f1' }} />
                  <div style={styles.milestoneConnector} />
                  <div style={styles.milestoneContent}>
                    <div style={styles.milestoneTitle}>{m.title}</div>
                    <div style={styles.milestoneMeta}>{m.project} · {m.date}</div>
                  </div>
                  <span style={{ ...styles.milestoneBadge, color: m.status === 'done' ? '#16a34a' : m.status === 'overdue' ? '#dc2626' : '#4338ca', background: m.status === 'done' ? '#d1fae5' : m.status === 'overdue' ? '#fef2f2' : '#eef2ff' }}>
                    {m.status === 'done' ? '✅ Done' : m.status === 'overdue' ? '🔴 Overdue' : '⏳ Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Budget Overview</h3>
            {PROJECTS.map((p) => (
              <div key={p.id} style={{ marginBottom: 24 }}>
                <div style={styles.budgetHeader}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{p.name}</span>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>PKR {(p.budget * 150000).toLocaleString()} / PKR 15,000,000</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: p.budget > 80 ? '#f59e0b' : '#10b981' }}>{p.budget}%</span>
                </div>
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${p.budget}%`, background: p.budget > 80 ? '#f59e0b' : '#10b981' }} />
                </div>
              </div>
            ))}
            <div style={styles.budgetSummary}>
              <div style={styles.summaryItem}><span>Total Allocated</span><strong>PKR 60,000,000</strong></div>
              <div style={styles.summaryItem}><span>Total Spent</span><strong style={{ color: '#f59e0b' }}>PKR {Math.round(PROJECTS.reduce((a, p) => a + p.budget * 150000, 0)).toLocaleString()}</strong></div>
              <div style={styles.summaryItem}><span>Remaining</span><strong style={{ color: '#10b981' }}>PKR {(60000000 - Math.round(PROJECTS.reduce((a, p) => a + p.budget * 150000, 0))).toLocaleString()}</strong></div>
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
  newProjectBtn: { padding: '10px 20px', background: 'linear-gradient(135deg,#4338ca,#6366f1)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  tabs: { display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 28, width: 'fit-content' },
  tab: { padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: '#6b7280' },
  tabActive: { background: '#fff', color: '#f59e0b', fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 14, padding: '20px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 500 },
  projectGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  projectCard: { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  projectTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  projectName: { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 },
  projectMeta: { fontSize: 12, color: '#6b7280' },
  healthBadge: { padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  progressBg: { background: '#e5e7eb', borderRadius: 99, height: 8, overflow: 'hidden' },
  progressFill: { background: 'linear-gradient(90deg,#4338ca,#6366f1)', height: '100%', borderRadius: 99 },
  viewBtn: { flex: 1, padding: '8px', background: '#eef2ff', color: '#4338ca', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  editBtn: { padding: '8px 16px', background: '#fff', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  card: { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', padding: '8px 12px', borderBottom: '2px solid #f3f4f6', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr: { borderBottom: '1px solid #f9fafb' },
  td: { padding: '12px 12px', fontSize: 13, color: '#374151' },
  statusBadge: { padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' },
  milestoneList: { display: 'flex', flexDirection: 'column', gap: 16 },
  milestoneRow: { display: 'flex', alignItems: 'center', gap: 14, position: 'relative' },
  milestoneDot: { width: 14, height: 14, borderRadius: '50%', flexShrink: 0 },
  milestoneConnector: { position: 'absolute', left: 6, top: 20, width: 2, height: 32, background: '#e5e7eb' },
  milestoneContent: { flex: 1 },
  milestoneTitle: { fontSize: 14, fontWeight: 600, color: '#111827' },
  milestoneMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  milestoneBadge: { padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
  budgetHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  budgetSummary: { background: '#f9fafb', borderRadius: 12, padding: 18, marginTop: 8, display: 'flex', justifyContent: 'space-between' },
  summaryItem: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#6b7280' },
}
