import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { useThemeColors } from '../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const ICONS = {
  folder: '\u{1F4C1}',
  play: '\u25B6',
  check: '\u2713',
  warning: '\u26A0',
  team: '\u{1F465}',
}

function StatusBadge({ status }) {
  const cfg = {
    Planning:  { bg: '#FEF3C7', color: '#92400E' },
    Active:    { bg: '#E9F1EC', color: '#3E6F4B' },
    Completed: { bg: '#E7F2EA', color: '#3F7A52' },
    'On Hold': { bg: '#F3F1EC', color: '#5F5A53' },
  }[status] || { bg: '#F3F1EC', color: '#5F5A53' }

  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
      {status}
    </span>
  )
}

function DomainBadge({ domain }) {
  const colors = { Web: '#003A6B', Mobile: '#1B5886', Desktop: '#3776A1', Embedded: '#5293BB', Other: '#6EB1D6' }
  const color = colors[domain] || colors.Other
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}14`, color, border: `1px solid ${color}24` }}>
      {domain}
    </span>
  )
}

function ProjectCard({ project, onClick }) {
  const C = useThemeColors()
  const highRisks = project.risks.filter(r => r.priority === 'High').length
  const daysLeft = Math.ceil((new Date(project.deadline) - new Date()) / 86400000)
  const progress = project.features.length > 0
    ? Math.round((project.features.filter(f => f.status === 'Done').length / project.features.length) * 100)
    : 0
  const progressColor = progress >= 100 ? '#22C55E' : progress >= 50 ? '#F59E0B' : C.primary
  const projectStats = [
    { label: 'Features', value: project.features.length, color: C.primary, bg: C.primary + '14', border: C.primary + '30' },
    { label: 'Estimations', value: project.estimations.length, color: C.primary, bg: C.primary + '10', border: C.primary + '25' },
    { label: 'Risks', value: project.risks.length, color: highRisks > 0 ? C.danger : C.primary, bg: highRisks > 0 ? C.danger + '12' : C.primary + '10', border: highRisks > 0 ? C.danger + '30' : C.primary + '25' },
  ]

  return (
    <div
      onClick={onClick}
      style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,58,107,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <DomainBadge domain={project.domain} />
        <StatusBadge status={project.status} />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>{project.name}</h3>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: C.textSecondary, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {project.description}
      </p>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: C.textSecondary }}>Progress</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.textPrimary }}>{progress}%</span>
        </div>
        <div style={{ height: 4, background: '#D7EBF7', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: progressColor, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {projectStats.map(stat => (
          <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.textSecondary }}>{ICONS.team} {project.teamSize} members</span>
        </div>
        <div style={{ fontSize: 11, color: project.status === 'Active' && daysLeft < 14 ? C.danger : C.textSecondary }}>
          {project.status === 'Completed' ? `${ICONS.check} Completed` : daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const C = useThemeColors()
  const { projects } = useProjects()
  const { profile } = useAuth()
  const isPM = ['pm', 'project_manager', 'admin'].includes(profile?.role)
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
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)

  const metrics = [
    { label: 'Total Projects', value: projects.length, icon: ICONS.folder, start: '#003A6B', end: '#1B5886', iconBg: 'rgba(255,255,255,0.16)', iconColor: '#F59E0B', text: '#FFFFFF', subtext: 'rgba(255,255,255,0.82)' },
    { label: 'Active Projects', value: totalActive, icon: ICONS.play, start: '#1B5886', end: '#3776A1', iconBg: 'rgba(255,255,255,0.18)', iconColor: '#F97316', text: '#FFFFFF', subtext: 'rgba(255,255,255,0.82)' },
    { label: 'Completed', value: totalCompleted, icon: ICONS.check, start: '#3776A1', end: '#5293BB', iconBg: 'rgba(255,255,255,0.20)', iconColor: '#22C55E', text: '#FFFFFF', subtext: 'rgba(255,255,255,0.84)' },
    { label: 'Open Risks', value: totalRisks, icon: ICONS.warning, start: '#5293BB', end: '#6EB1D6', iconBg: 'rgba(255,255,255,0.24)', iconColor: '#EF4444', text: '#FFFFFF', subtext: 'rgba(255,255,255,0.86)' },
    { label: 'Total Budget', value: totalBudget > 0 ? `$${totalBudget.toLocaleString()}` : '$0', icon: '💰', start: '#0D7C59', end: '#0F9870', iconBg: 'rgba(255,255,255,0.22)', iconColor: '#34D399', text: '#FFFFFF', subtext: 'rgba(255,255,255,0.84)' },
  ]

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>All Projects</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Manage and track all your software projects</p>
        </div>
        {isPM && (
          <button
            onClick={() => navigate('/dashboard/projects/new')}
            style={{ padding: '10px 18px', background: '#003A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 10px 20px rgba(0,58,107,0.18)' }}
          >
            + New Project
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: `linear-gradient(135deg, ${m.start}, ${m.end})`, border: 'none', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 22px rgba(0,58,107,0.12)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: m.iconBg, color: m.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)' }}>{m.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: m.text }}>{m.value}</div>
              <div style={{ fontSize: 12, color: m.subtext }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Planning', 'Active', 'Completed', 'On Hold'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${filter === f ? '#003A6B' : C.border}`, background: filter === f ? '#003A6B' : '#fff', color: filter === f ? '#fff' : C.textSecondary, fontSize: 13, cursor: 'pointer', fontWeight: filter === f ? 600 : 400 }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: C.textSecondary }}>Sort by:</span>
          {['Date', 'Name', 'Risk Level'].map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{ padding: '5px 12px', borderRadius: 8, border: `1px solid ${sort === s ? '#5293BB' : C.border}`, background: sort === s ? '#EAF4FB' : '#fff', color: sort === s ? '#1B5886' : C.textSecondary, fontSize: 12, cursor: 'pointer' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: C.textSecondary }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{ICONS.folder}</div>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No projects found</p>
          {isPM && (
            <button
              onClick={() => navigate('/dashboard/projects/new')}
              style={{ marginTop: 12, padding: '10px 20px', background: '#003A6B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,58,107,0.18)' }}
            >
              Create your first project
            </button>
          )}
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
