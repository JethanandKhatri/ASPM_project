import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'


export default function HistoryList() {
  const C = useThemeColors()
  const { projects } = useProjects()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('All')
  const [domainFilter, setDomainFilter] = useState('All')

  const domains = ['All', ...new Set(projects.map(p => p.domain))]

  const filtered = projects.filter(p => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter
    const matchDomain = domainFilter === 'All' || p.domain === domainFilter
    return matchStatus && matchDomain
  })

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Project History</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Browse all past and current projects with estimation and risk summaries</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Active', 'Completed'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${statusFilter === f ? C.primary : C.border}`, background: statusFilter === f ? C.primary : '#fff', color: statusFilter === f ? '#fff' : C.textSecondary, fontSize: 12, cursor: 'pointer', fontWeight: statusFilter === f ? 600 : 400 }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {domains.map(d => (
            <button key={d} onClick={() => setDomainFilter(d)}
              style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${domainFilter === d ? '#7c3aed' : C.border}`, background: domainFilter === d ? '#7c3aed' : '#fff', color: domainFilter === d ? '#fff' : C.textSecondary, fontSize: 12, cursor: 'pointer' }}>
              {d}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: C.textSecondary, marginLeft: 'auto' }}>{filtered.length} project(s)</span>
      </div>

      {/* Table */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.primary + '0d', borderBottom: `2px solid ${C.border}` }}>
              {['Project Name', 'Domain', 'Status', 'Team Size', 'Start Date', 'Deadline', 'Estimation Runs', 'Risk Count'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>No projects match the current filters.</td></tr>
            ) : (
              filtered.map((p, i) => {
                const statusCfg = { Active: { bg: C.primary + '15', color: C.primary }, Completed: { bg: C.success + '15', color: C.success } }[p.status] || { bg: C.border, color: C.textSecondary }
                const highRisks = p.risks.filter(r => r.priority === 'High').length
                return (
                  <tr key={p.id} onClick={() => navigate(`/dashboard/history/${p.id}`)}
                    style={{ borderBottom: `1px solid ${C.border}`, cursor: 'pointer', background: i % 2 === 0 ? C.cardBg : C.mainBg }}
                    onMouseEnter={e => e.currentTarget.style.background = C.primary + '0D'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? C.cardBg : C.mainBg}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: C.primary }}>{p.name}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: C.primary + '18', color: C.primary }}>{p.domain}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusCfg.bg, color: statusCfg.color }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: C.textSecondary }}>{p.teamSize} members</td>
                    <td style={{ padding: '12px 14px', color: C.textSecondary }}>{p.startDate}</td>
                    <td style={{ padding: '12px 14px', color: C.textSecondary }}>{p.deadline}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: p.estimations.length > 0 ? C.primary : C.textSecondary }}>{p.estimations.length}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: highRisks > 0 ? C.danger : C.textSecondary }}>{p.risks.length}</span>
                      {highRisks > 0 && <span style={{ fontSize: 10, color: C.danger, marginLeft: 4 }}>({highRisks} High)</span>}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
