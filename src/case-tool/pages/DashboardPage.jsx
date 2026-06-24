import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'

const C = {
  primary: '#3B5998', mainBg: '#F4F6FB', cardBg: '#FFFFFF', border: '#E0E4ED',
  textPrimary: '#1A1A2E', textSecondary: '#6B7280',
  danger: '#E24B4A', warning: '#EF9F27', success: '#639922',
}

function StatusBadge({ status }) {
  const cfg = {
    Active: { bg: '#dbeafe', color: '#1d4ed8' },
    Completed: { bg: '#dcfce7', color: '#15803d' },
    'On Hold': { bg: '#fef9c3', color: '#92400e' },
  }[status] || { bg: '#f3f4f6', color: '#374151' }
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      {status}
    </span>
  )
}

function DomainBadge({ domain }) {
  const colors = { Web: '#3B5998', Mobile: '#7c3aed', Desktop: '#0891b2', Embedded: '#b45309', Other: '#4b5563' }
  const color = colors[domain] || colors.Other
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: color + '18', color, border: `1px solid ${color}30` }}>
      {domain}
    </span>
  )
}

function ProjectCard({ project, onClick }) {
  const highRisks = project.risks.filter(r => r.priority === 'High').length
  const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / 86400000)
  const progress = project.features.length > 0
    ? Math.round((project.features.filter(f => f.status === 'Done').length / project.features.length) * 100)
    : 0

  return (
    <div onClick={onClick} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,89,152,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <DomainBadge domain={project.domain} />
        <StatusBadge status={project.status} />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>{project.name}</h3>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: C.textSecondary, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: C.textSecondary }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>{progress}%</span>
        </div>
        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.primary, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Features', value: project.features.length, icon: '◈' },
          { label: 'Estimations', value: project.estimations.length, icon: '▲' },
          { label: 'Risks', value: project.risks.length, icon: highRisks > 0 ? '⚠' : '●', color: highRisks > 0 ? C.danger : C.textSecondary },
        ].map(stat => (
          <div key={stat.label} style={{ background: C.mainBg, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: stat.color || C.primary }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.textSecondary }}>👥 {project.teamSize} members</span>
        </div>
        <div style={{ fontSize: 11, color: project.status === 'Active' && daysLeft < 14 ? C.danger : C.textSecondary }}>
          {project.status === 'Completed' ? '✓ Completed' : daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { projects } = useProjects()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Date')

  const filtered = projects
    .filter(p => filter === 'All' || p.status === filter)
    .sort((a, b) => {
      if (sort === 'Name') return a.name.localeCompare(b.name)
      if (sort === 'Risk Level') return b.risks.filter(r => r.priority === 'High').length - a.risks.filter(r => r.priority === 'High').length
      return new Date(b.startDate) - new Date(a.startDate)
    })

  const totalActive = projects.filter(p => p.status === 'Active').length
  const totalCompleted = projects.filter(p => p.status === 'Completed').length
  const totalRisks = projects.reduce((s, p) => s + p.risks.filter(r => r.status !== 'Resolved').length, 0)

  return (
    <div style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>All Projects</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Manage and track all your software projects</p>
        </div>
        <button onClick={() => navigate('/dashboard/projects/new')}
          style={{ padding: '10px 18px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          + New Project
        </button>
      </div>

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Projects', value: projects.length, icon: '📁', color: C.primary },
          { label: 'Active Projects', value: totalActive, icon: '▶', color: '#0891b2' },
          { label: 'Completed', value: totalCompleted, icon: '✓', color: C.success },
          { label: 'Open Risks', value: totalRisks, icon: '⚠', color: C.danger },
        ].map(m => (
          <div key={m.label} style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary }}>{m.value}</div>
              <div style={{ fontSize: 12, color: C.textSecondary }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Active', 'Completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${filter === f ? C.primary : C.border}`, background: filter === f ? C.primary : '#fff', color: filter === f ? '#fff' : C.textSecondary, fontSize: 13, cursor: 'pointer', fontWeight: filter === f ? 600 : 400 }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: C.textSecondary }}>Sort by:</span>
          {['Date', 'Name', 'Risk Level'].map(s => (
            <button key={s} onClick={() => setSort(s)}
              style={{ padding: '5px 12px', borderRadius: 6, border: `1px solid ${sort === s ? C.primary : C.border}`, background: sort === s ? '#eff3fb' : '#fff', color: sort === s ? C.primary : C.textSecondary, fontSize: 12, cursor: 'pointer' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textSecondary }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No projects found</p>
          <button onClick={() => navigate('/dashboard/projects/new')}
            style={{ marginTop: 12, padding: '10px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
            Create your first project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} onClick={() => navigate(`/dashboard/projects/${p.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}
