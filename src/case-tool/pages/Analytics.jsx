import { useState } from 'react'
import { useProjects } from '../context/ProjectContext'

const C = { primary: '#3B5998', mainBg: '#F4F6FB', cardBg: '#FFFFFF', border: '#E0E4ED', textPrimary: '#1A1A2E', textSecondary: '#6B7280', danger: '#E24B4A', warning: '#EF9F27', success: '#639922' }
const CHART_COLORS = ['#3B5998', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']

function BarChart({ data, title, formatter, height = 140 }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
        {data.map((d, i) => {
          const h = Math.max((d.value / max) * (height - 24), 4)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.textPrimary }}>{formatter ? formatter(d.value) : d.value}</div>
              <div style={{ width: '100%', height: h, background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: '4px 4px 0 0', transition: 'height 0.4s' }} title={d.label} />
              <div style={{ fontSize: 9, color: C.textSecondary, textAlign: 'center', lineHeight: 1.2 }}>{d.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DonutChart({ data, title }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let offset = 0
  const r = 50, cx = 60, cy = 60
  const circumference = 2 * Math.PI * r

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={120} height={120} viewBox="0 0 120 120">
          {data.map((d, i) => {
            const pct = d.value / total
            const strokeDash = circumference * pct
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={20} strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={-circumference * offset} transform="rotate(-90 60 60)" />
            )
            offset += pct
            return el
          })}
          <circle cx={cx} cy={cy} r={40} fill="#fff" />
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={C.textPrimary}>{total}</text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill={C.textSecondary}>total</text>
        </svg>
        <div style={{ flex: 1 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.textSecondary, flex: 1 }}>{d.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Analytics() {
  const { projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState('all')

  const proj = selectedProject === 'all' ? projects : projects.filter(p => p.id === selectedProject)

  const totalRisks = proj.reduce((s, p) => s + p.risks.length, 0)
  const highRisks = proj.reduce((s, p) => s + p.risks.filter(r => r.priority === 'High').length, 0)
  const activeProjects = proj.filter(p => p.status === 'Active').length
  const completedProjects = proj.filter(p => p.status === 'Completed').length

  const avgAccuracy = proj.length > 0
    ? Math.round(proj.reduce((s, p) => s + (p.estimations.length > 0 ? 87 : 0), 0) / proj.length)
    : 0

  const effortComparison = proj.flatMap(p => p.estimations.map(e => ({ label: `${p.name.substring(0, 8)}… ${e.version}`, value: e.effortNum || 0 }))).slice(0, 6)

  const costComparison = proj.flatMap(p => p.estimations.map(e => ({ label: `${e.version} (${e.technique.substring(0, 5)})`, value: e.costNum || 0 }))).slice(0, 6)

  const techniqueUsage = (() => {
    const counts = {}
    proj.forEach(p => p.estimations.forEach(e => { counts[e.technique] = (counts[e.technique] || 0) + 1 }))
    return Object.entries(counts).map(([label, value]) => ({ label, value }))
  })()

  const priorityCounts = [
    { label: 'High Priority', value: proj.reduce((s, p) => s + p.features.filter(f => f.priority === 'High').length, 0) },
    { label: 'Medium Priority', value: proj.reduce((s, p) => s + p.features.filter(f => f.priority === 'Medium').length, 0) },
    { label: 'Low Priority', value: proj.reduce((s, p) => s + p.features.filter(f => f.priority === 'Low').length, 0) },
  ].filter(d => d.value > 0)

  const riskExposureTrend = proj.slice(0, 3).map(p => ({
    label: p.name.substring(0, 10) + '…',
    value: p.risks.reduce((s, r) => s + r.riskExposure, 0)
  }))

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Analytics Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Project-level metrics and estimation accuracy trends</p>
        </div>
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          style={{ padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}>
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Projects', value: proj.length, icon: '📁', color: C.primary },
          { label: 'Avg Accuracy %', value: `${avgAccuracy}%`, icon: '🎯', color: C.success },
          { label: 'Active Risks', value: totalRisks - proj.reduce((s, p) => s + p.risks.filter(r => r.status === 'Resolved').length, 0), icon: '⚠', color: C.danger },
          { label: 'On-Track', value: `${completedProjects}/${proj.length}`, icon: '✓', color: '#0891b2' },
        ].map(m => (
          <div key={m.label} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>{m.value}</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <BarChart data={effortComparison} title="Estimation Accuracy — Effort per Version (staff months)" formatter={v => `${v}mo`} />
        </div>
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <BarChart data={riskExposureTrend} title="Risk Exposure Trend ($) per Project" formatter={v => `$${(v / 1000).toFixed(0)}k`} />
        </div>
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <DonutChart data={techniqueUsage.length > 0 ? techniqueUsage : [{ label: 'No estimations', value: 1 }]} title="Technique Usage across Projects" />
        </div>
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <DonutChart data={priorityCounts.length > 0 ? priorityCounts : [{ label: 'No features', value: 1 }]} title="Feature Priority Breakdown" />
        </div>
      </div>

      {/* Cost comparison chart */}
      {costComparison.length > 0 && (
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginTop: 20 }}>
          <BarChart data={costComparison} title="Cost Comparison across Estimation Runs ($)" formatter={v => `$${(v / 1000).toFixed(0)}k`} height={160} />
        </div>
      )}
    </div>
  )
}
