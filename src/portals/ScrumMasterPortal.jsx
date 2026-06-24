import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const NAV = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
  { icon: '🗓️', label: 'Sprint Planning', path: '/dashboard/planning' },
  { icon: '📉', label: 'Burndown Chart', path: '/dashboard/burndown' },
  { icon: '🔄', label: 'Retrospective', path: '/dashboard/retro' },
  { icon: '🚧', label: 'Impediments', path: '/dashboard/impediments' },
]

const BURNDOWN = [
  { day: 'Day 1', ideal: 90, actual: 90 },
  { day: 'Day 2', ideal: 80, actual: 85 },
  { day: 'Day 3', ideal: 70, actual: 78 },
  { day: 'Day 4', ideal: 60, actual: 65 },
  { day: 'Day 5', ideal: 50, actual: 60 },
  { day: 'Day 6', ideal: 40, actual: 52 },
  { day: 'Day 7', ideal: 30, actual: 38 },
  { day: 'Day 8', ideal: 20, actual: 32 },
  { day: 'Day 9', ideal: 10, actual: 18 },
  { day: 'Day 10', ideal: 0, actual: 8 },
]

const IMPEDIMENTS = [
  { id: 1, title: 'Staging env down', owner: 'DevOps', severity: 'high', status: 'open', age: '2 days' },
  { id: 2, title: 'API keys expired', owner: 'Sara Ahmed', severity: 'high', status: 'resolved', age: '4 days' },
  { id: 3, title: 'Design assets missing', owner: 'Zara Malik', severity: 'medium', status: 'open', age: '1 day' },
  { id: 4, title: 'Unclear requirements on story #23', owner: 'PO', severity: 'low', status: 'open', age: '3 days' },
]

const RETRO_CATS = [
  { id: 'good', icon: '🌟', label: 'What went well?', color: '#10b981', bg: '#d1fae5', items: ['Good communication', 'All stand-ups on time', 'PR reviews were fast'] },
  { id: 'improve', icon: '🔧', label: 'What to improve?', color: '#f59e0b', bg: '#fef3c7', items: ['Estimate accuracy', 'Documentation needs update', 'Reduce context-switching'] },
  { id: 'action', icon: '🚀', label: 'Action items', color: '#6366f1', bg: '#eef2ff', items: ['Set up automated tests', 'Definition of Done review', 'Add buffer for unknowns'] },
]

export default function ScrumMasterPortal() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [newImpediment, setNewImpediment] = useState('')

  const openImpediments = IMPEDIMENTS.filter((i) => i.status === 'open').length
  const currentDay = BURNDOWN[BURNDOWN.length - 2]
  const behindBy = currentDay.actual - currentDay.ideal

  return (
    <div style={styles.layout}>
      <Sidebar navItems={NAV} />
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Scrum Master Portal</h1>
            <p style={styles.pageSub}>Sprint 4 · Day 9 of 10 · 8 pts remaining</p>
          </div>
          <div style={{ ...styles.heroBadge, background: behindBy > 0 ? '#fef2f2' : '#d1fae5', color: behindBy > 0 ? '#dc2626' : '#16a34a' }}>
            {behindBy > 0 ? `⚠️ ${behindBy} pts behind` : '✅ On track'}
          </div>
        </div>

        <div style={styles.tabs}>
          {[
            { id: 'dashboard', label: '📊 Overview' },
            { id: 'burndown', label: '📉 Burndown' },
            { id: 'retro', label: '🔄 Retrospective' },
            { id: 'impediments', label: '🚧 Impediments' },
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
                { label: 'Sprint Velocity', value: '82 pts', color: '#10b981', icon: '⚡' },
                { label: 'Open Impediments', value: openImpediments, color: '#dc2626', icon: '🚧' },
                { label: 'Stories Done', value: '7/9', color: '#6366f1', icon: '📖' },
                { label: 'Team Morale', value: '4.2/5', color: '#f59e0b', icon: '😊' },
              ].map((s) => (
                <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 26 }}>{s.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Ceremonies checklist */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitle}>Sprint 4 Ceremonies</h3>
              <div style={styles.ceremonyGrid}>
                {[
                  { icon: '🗓️', name: 'Sprint Planning', date: 'Jun 18', done: true },
                  { icon: '☀️', name: 'Daily Standups', date: 'Daily', done: true },
                  { icon: '🔍', name: 'Sprint Review', date: 'Jul 1', done: false },
                  { icon: '🔄', name: 'Retrospective', date: 'Jul 1', done: false },
                  { icon: '📋', name: 'Backlog Refinement', date: 'Jun 25', done: true },
                  { icon: '📊', name: 'Demo to Stakeholders', date: 'Jul 2', done: false },
                ].map((c) => (
                  <div key={c.name} style={{ ...styles.ceremonyCard, opacity: c.done ? 1 : 0.7, border: c.done ? '1.5px solid #10b981' : '1.5px solid #e5e7eb' }}>
                    <div style={{ fontSize: 24 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{c.date}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 18 }}>{c.done ? '✅' : '⏳'}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'burndown' && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Sprint 4 Burndown Chart</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Remaining story points per day — ideal vs actual</p>
            <div style={styles.burndownChart}>
              {BURNDOWN.map((d, i) => {
                const maxH = 180
                const maxVal = 90
                const idealH = Math.round((d.ideal / maxVal) * maxH)
                const actualH = Math.round((d.actual / maxVal) * maxH)
                const isLate = d.actual > d.ideal
                return (
                  <div key={d.day} style={styles.burnDownGroup}>
                    <div style={styles.burnDownBars}>
                      <div style={{ ...styles.burnBar, height: idealH, background: '#e5e7eb' }} title={`Ideal: ${d.ideal}`} />
                      <div style={{ ...styles.burnBar, height: actualH, background: isLate ? '#f87171' : '#10b981' }} title={`Actual: ${d.actual}`} />
                    </div>
                    <div style={styles.burnLabel}>{d.day.replace('Day ', 'D')}</div>
                  </div>
                )
              })}
            </div>
            <div style={styles.legend}>
              <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#e5e7eb' }} /> Ideal</span>
              <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#10b981' }} /> Actual (on track)</span>
              <span style={styles.legendItem}><span style={{ ...styles.dot, background: '#f87171' }} /> Actual (behind)</span>
            </div>
          </div>
        )}

        {activeTab === 'retro' && (
          <div style={styles.retroGrid}>
            {RETRO_CATS.map((cat) => (
              <div key={cat.id} style={{ ...styles.retroCol, background: cat.bg, border: `1.5px solid ${cat.color}33` }}>
                <div style={styles.retroHeader}>
                  <span style={{ fontSize: 22 }}>{cat.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.label}</span>
                </div>
                {cat.items.map((item, i) => (
                  <div key={i} style={styles.retroItem}>
                    <span style={{ ...styles.retroDot, background: cat.color }} />
                    <span style={{ fontSize: 13, color: '#374151' }}>{item}</span>
                  </div>
                ))}
                <button style={{ ...styles.addBtn, color: cat.color, border: `1.5px dashed ${cat.color}` }}>
                  + Add item
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'impediments' && (
          <div style={styles.card}>
            <div style={styles.impedHeader}>
              <h3 style={styles.sectionTitle}>Impediment Log</h3>
              <div style={styles.impRow}>
                <input style={styles.impInput} placeholder="Describe new impediment..." value={newImpediment} onChange={(e) => setNewImpediment(e.target.value)} />
                <button style={styles.addImpBtn} onClick={() => setNewImpediment('')}>+ Log</button>
              </div>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>{['Title', 'Owner', 'Severity', 'Age', 'Status'].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {IMPEDIMENTS.map((imp) => (
                  <tr key={imp.id} style={styles.tr}>
                    <td style={styles.td}>{imp.title}</td>
                    <td style={styles.td}>{imp.owner}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.sevBadge, color: imp.severity === 'high' ? '#dc2626' : imp.severity === 'medium' ? '#f59e0b' : '#10b981', background: imp.severity === 'high' ? '#fef2f2' : imp.severity === 'medium' ? '#fef3c7' : '#d1fae5' }}>
                        {imp.severity}
                      </span>
                    </td>
                    <td style={styles.td}>{imp.age}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, background: imp.status === 'resolved' ? '#d1fae5' : '#fef2f2', color: imp.status === 'resolved' ? '#16a34a' : '#dc2626' }}>
                        {imp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  heroBadge: { padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  tabs: { display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 28, width: 'fit-content' },
  tab: { padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, background: 'transparent', color: '#6b7280' },
  tabActive: { background: '#fff', color: '#10b981', fontWeight: 600, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', borderRadius: 14, padding: '20px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  statLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 500 },
  card: { background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 16 },
  ceremonyGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  ceremonyCard: { background: '#f9fafb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  burndownChart: { display: 'flex', gap: 12, alignItems: 'flex-end', justifyContent: 'center', padding: '16px 0', minHeight: 210 },
  burnDownGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  burnDownBars: { display: 'flex', gap: 4, alignItems: 'flex-end' },
  burnBar: { width: 28, borderRadius: '4px 4px 0 0', transition: 'height 0.4s' },
  burnLabel: { fontSize: 10, color: '#6b7280' },
  legend: { display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' },
  dot: { width: 12, height: 12, borderRadius: '50%', display: 'inline-block' },
  retroGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  retroCol: { borderRadius: 14, padding: 20 },
  retroHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
  retroItem: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  retroDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4 },
  addBtn: { width: '100%', padding: '8px', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 8 },
  impedHeader: { marginBottom: 16 },
  impRow: { display: 'flex', gap: 10 },
  impInput: { flex: 1, padding: '8px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' },
  addImpBtn: { padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', padding: '8px 12px', borderBottom: '2px solid #f3f4f6', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr: { borderBottom: '1px solid #f9fafb' },
  td: { padding: '12px 12px', fontSize: 13, color: '#374151' },
  sevBadge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' },
  statusBadge: { padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
}
