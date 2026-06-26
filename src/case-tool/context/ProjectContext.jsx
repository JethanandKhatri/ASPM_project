import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseAdmin } from '../../lib/supabase'
import { SAMPLE_PROJECTS, SAMPLE_NOTIFICATIONS } from '../data/sampleData'
import { useAuth } from '../../context/AuthContext'

// db is admin client so RLS never blocks data reads in this shared workspace
const db = supabaseAdmin

const ProjectContext = createContext(null)

function shapeProject(p, rel = {}) {
  const features     = rel.features     || p.features     || []
  const team         = rel.project_team || p.project_team || []
  const estimations  = rel.estimations  || p.estimations  || []
  const risks        = rel.risks        || p.risks        || []
  const comments     = rel.comments     || p.comments     || []
  const tasks        = rel.tasks        || p.tasks        || []
  const activityLog  = rel.activity_log || p.activity_log || []

  return {
    id: p.id, name: p.name, domain: p.domain,
    description: p.description, teamSize: p.team_size,
    startDate: p.start_date, deadline: p.deadline, status: p.status,
    budget: parseFloat(p.budget) || 0,
    features: features.map(f => ({
      id: f.id, name: f.name, description: f.description,
      priority: f.priority, status: f.status,
    })),
    team: team.map(t => ({
      id: t.id, name: t.name, role: t.role, email: t.email,
    })),
    estimations: estimations.map(e => ({
      id: e.id, version: e.version, technique: e.technique,
      date: e.date, effort: e.effort, cost: e.cost,
      duration: e.duration, status: e.status,
      effortNum: e.effort_num, costNum: e.cost_num, durationNum: e.duration_num,
      data: e.data,
    })),
    risks: [...risks]
      .sort((a, b) => b.risk_exposure - a.risk_exposure)
      .map(r => ({
        id: r.id, description: r.description, category: r.category,
        probability: r.probability, impact: r.impact, costImpact: r.cost_impact,
        riskExposure: r.risk_exposure, priority: r.priority, status: r.status,
        mitigation: r.mitigation, monitoring: r.monitoring, management: r.management,
      })),
    comments: comments.map(c => ({
      id: c.id, author: c.author, text: c.text,
      timestamp: c.timestamp, replies: c.replies || [],
    })),
    tasks: tasks.map(t => ({
      id: t.id, name: t.name, assignee: t.assignee,
      priority: t.priority, dueDate: t.due_date, status: t.status,
      feature: t.feature, description: t.description,
    })),
    activityLog: activityLog.map(a => ({
      id: a.id, user: a.user_name, action: a.action, timestamp: a.timestamp,
    })),
  }
}

async function seedSampleData() {
  for (const p of SAMPLE_PROJECTS) {
    const { error } = await db.from('projects').insert({
      id: p.id, name: p.name, domain: p.domain, description: p.description,
      team_size: p.teamSize, start_date: p.startDate, deadline: p.deadline, status: p.status,
    })
    if (error) continue

    if (p.features?.length) {
      await db.from('features').insert(
        p.features.map(f => ({
          id: `${p.id}_${f.id}`, project_id: p.id,
          name: f.name, description: f.description, priority: f.priority, status: f.status,
        }))
      )
    }
    if (p.team?.length) {
      await db.from('project_team').insert(
        p.team.map(t => ({
          id: `${p.id}_${t.id}`, project_id: p.id,
          name: t.name, role: t.role, email: t.email,
        }))
      )
    }
    if (p.estimations?.length) {
      await db.from('estimations').insert(
        p.estimations.map(e => ({
          id: `${p.id}_${e.id}`, project_id: p.id,
          version: e.version, technique: e.technique, date: e.date,
          effort: e.effort, cost: e.cost, duration: e.duration, status: e.status,
          effort_num: e.effortNum, cost_num: e.costNum, duration_num: e.durationNum,
          data: e.data,
        }))
      )
    }
    if (p.risks?.length) {
      await db.from('risks').insert(
        p.risks.map(r => ({
          id: `${p.id}_${r.id}`, project_id: p.id,
          description: r.description, category: r.category,
          probability: r.probability, impact: r.impact, cost_impact: r.costImpact,
          risk_exposure: r.riskExposure, priority: r.priority, status: r.status,
          mitigation: r.mitigation || '', monitoring: r.monitoring || '', management: r.management || '',
        }))
      )
    }
    if (p.comments?.length) {
      await db.from('comments').insert(
        p.comments.map(c => ({
          id: `${p.id}_${c.id}`, project_id: p.id,
          author: c.author, text: c.text, timestamp: c.timestamp, replies: c.replies || [],
        }))
      )
    }
    if (p.tasks?.length) {
      await db.from('tasks').insert(
        p.tasks.map(t => ({
          id: `${p.id}_${t.id}`, project_id: p.id,
          name: t.name, assignee: t.assignee, priority: t.priority,
          due_date: t.dueDate, status: t.status, feature: t.feature, description: t.description,
        }))
      )
    }
    if (p.activityLog?.length) {
      await db.from('activity_log').insert(
        p.activityLog.map(a => ({
          id: `${p.id}_${a.id}`, project_id: p.id,
          user_name: a.user, action: a.action, timestamp: a.timestamp,
        }))
      )
    }
  }

  await db.from('notifications').insert(
    SAMPLE_NOTIFICATIONS.map(n => ({
      id: n.id, type: n.type, message: n.message,
      project_id: n.projectId, read: n.read, timestamp: n.timestamp,
    }))
  )
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const isPM = ['pm', 'project_manager', 'admin'].includes(profile?.role)

  const loadAll = useCallback(async () => {
    const { data: projectRows, error } = await db
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) { console.error('projects error:', error); setLoading(false); return }

    console.log('[DB] projects:', projectRows?.length, projectRows?.map(p => p.id))

    if (!projectRows || projectRows.length === 0) {
      await seedSampleData()
      return loadAll()
    }

    const ids = projectRows.map(p => p.id)

    const results = await Promise.all([
      db.from('features').select('*').in('project_id', ids),
      db.from('project_team').select('*').in('project_id', ids),
      db.from('estimations').select('*').in('project_id', ids),
      db.from('risks').select('*').in('project_id', ids),
      db.from('comments').select('*').in('project_id', ids),
      db.from('tasks').select('*').in('project_id', ids),
      db.from('activity_log').select('*').in('project_id', ids),
      db.from('notifications').select('*').order('timestamp', { ascending: false }),
    ])

    const names = ['features','project_team','estimations','risks','comments','tasks','activity_log','notifications']
    results.forEach(({ data, error: e }, i) => {
      if (e) console.error(`[DB] ${names[i]} error:`, e.message)
      else console.log(`[DB] ${names[i]}:`, data?.length)
    })

    const [
      { data: features }, { data: team }, { data: estimations }, { data: risks },
      { data: comments }, { data: tasks }, { data: activityLog }, { data: notifs },
    ] = results

    const shaped = projectRows.map(p => shapeProject(p, {
      features:     (features     || []).filter(r => r.project_id === p.id),
      project_team: (team         || []).filter(r => r.project_id === p.id),
      estimations:  (estimations  || []).filter(r => r.project_id === p.id),
      risks:        (risks        || []).filter(r => r.project_id === p.id),
      comments:     (comments     || []).filter(r => r.project_id === p.id),
      tasks:        (tasks        || []).filter(r => r.project_id === p.id),
      activity_log: (activityLog  || []).filter(r => r.project_id === p.id),
    }))

    setProjects(shaped)
    setNotifications((notifs || []).map(n => ({
      id: n.id, type: n.type, message: n.message,
      projectId: n.project_id, read: n.read, timestamp: n.timestamp,
    })))
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function createNotification(type, message, projectId = null) {
    const notifId = 'n' + Date.now()
    const timestamp = new Date().toISOString()
    const notif = { id: notifId, type, message, projectId, read: false, timestamp }
    setNotifications(prev => [notif, ...prev])
    await db.from('notifications').insert({ id: notifId, type, message, project_id: projectId, read: false, timestamp })
  }

  function getProject(id) {
    return projects.find(p => p.id === id) || null
  }

  async function addProject(projectData) {
    if (!isPM) return null
    const id = 'p' + Date.now()
    await db.from('projects').insert({
      id, name: projectData.name, domain: projectData.domain,
      description: projectData.description, team_size: projectData.teamSize,
      start_date: projectData.startDate, deadline: projectData.deadline,
      status: projectData.status || 'Active',
      budget: parseFloat(projectData.budget) || 0,
    })
    if (projectData.features?.length) {
      await db.from('features').insert(
        projectData.features.map((f, i) => ({
          id: `${id}_f${i + 1}`, project_id: id,
          name: f.name, description: f.description || '',
          priority: f.priority || 'Medium', status: f.status || 'To Do',
        }))
      )
    }
    await createNotification('project', `New project "${projectData.name}" created`, id)
    await loadAll()
    return id
  }

  async function updateProject(projectId, updates) {
    if (!isPM) return
    const dbUpdates = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.domain !== undefined) dbUpdates.domain = updates.domain
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.teamSize !== undefined) dbUpdates.team_size = updates.teamSize
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.budget !== undefined) dbUpdates.budget = parseFloat(updates.budget) || 0

    if (Object.keys(dbUpdates).length) {
      await db.from('projects').update(dbUpdates).eq('id', projectId)
    }

    if (updates.features) {
      await db.from('features').delete().eq('project_id', projectId)
      if (updates.features.length) {
        await db.from('features').insert(
          updates.features.map((f, i) => ({
            id: f.id?.startsWith('nf') ? `${projectId}_f${i + 1}` : f.id,
            project_id: projectId, name: f.name,
            description: f.description || '', priority: f.priority, status: f.status,
          }))
        )
      }
    }
    await loadAll()
  }

  async function deleteProject(projectId) {
    if (!isPM) return
    await db.from('projects').delete().eq('id', projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))
  }

  async function addEstimation(projectId, estimation) {
    if (!isPM) return
    const project = getProject(projectId)
    const version = 'v' + ((project?.estimations?.length || 0) + 1)
    await db.from('estimations').insert({
      id: 'e' + Date.now(), project_id: projectId, version,
      technique: estimation.technique, date: estimation.date,
      effort: estimation.effort, cost: estimation.cost, duration: estimation.duration,
      status: estimation.status || 'Saved',
      effort_num: estimation.effortNum, cost_num: estimation.costNum, duration_num: estimation.durationNum,
      data: estimation.data,
    })
    await loadAll()
  }

  async function addRisk(projectId, risk) {
    if (!isPM) return
    const riskExposure = Math.round((risk.probability / 100) * risk.costImpact)
    const priority = getRiskPriority(riskExposure)
    await db.from('risks').insert({
      id: 'r' + Date.now(), project_id: projectId,
      description: risk.description, category: risk.category,
      probability: risk.probability, impact: risk.impact,
      cost_impact: risk.costImpact, risk_exposure: riskExposure,
      priority,
      status: 'Open', mitigation: '', monitoring: '', management: '',
    })
    if (priority === 'High') {
      const p = getProject(projectId)
      await createNotification('risk', `High priority risk added to "${p?.name || 'project'}"`, projectId)
    }
    await loadAll()
  }

  async function updateRisk(projectId, riskId, updates) {
    if (!isPM) return
    const existing = getProject(projectId)?.risks?.find(r => r.id === riskId)
    const prob = updates.probability ?? existing?.probability ?? 0
    const cost = updates.costImpact ?? existing?.costImpact ?? 0
    const riskExposure = Math.round((prob / 100) * cost)

    await db.from('risks').update({
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.probability !== undefined && { probability: updates.probability }),
      ...(updates.impact !== undefined && { impact: updates.impact }),
      ...(updates.costImpact !== undefined && { cost_impact: updates.costImpact }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.mitigation !== undefined && { mitigation: updates.mitigation }),
      ...(updates.monitoring !== undefined && { monitoring: updates.monitoring }),
      ...(updates.management !== undefined && { management: updates.management }),
      risk_exposure: riskExposure,
      priority: getRiskPriority(riskExposure),
    }).eq('id', riskId)
    await loadAll()
  }

  async function deleteRisk(projectId, riskId) {
    if (!isPM) return
    await db.from('risks').delete().eq('id', riskId)
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, risks: p.risks.filter(r => r.id !== riskId) }
    ))
  }

  async function addComment(projectId, comment) {
    await db.from('comments').insert({
      id: 'c' + Date.now(), project_id: projectId,
      author: comment.author, text: comment.text,
      timestamp: new Date().toISOString(), replies: [],
    })
    await loadAll()
  }

  async function addTask(projectId, task) {
    await db.from('tasks').insert({
      id: 'task' + Date.now(), project_id: projectId,
      name: task.name, assignee: task.assignee, priority: task.priority,
      due_date: task.dueDate, status: 'To Do',
      feature: task.feature, description: task.description,
    })
    await loadAll()
  }

  async function updateTaskStatus(projectId, taskId, status) {
    await db.from('tasks').update({ status }).eq('id', taskId)
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t) }
    ))
  }

  async function markNotificationRead(id) {
    await db.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await db.from('notifications').update({ read: true }).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  function getActuals(projectId) {
    try {
      const stored = localStorage.getItem(`aspm_actuals_${projectId}`)
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  }

  function saveActuals(projectId, data) {
    localStorage.setItem(`aspm_actuals_${projectId}`, JSON.stringify(data))
  }

  return (
    <ProjectContext.Provider value={{
      projects, notifications, unreadCount, loading,
      getProject, addProject, updateProject, deleteProject,
      addEstimation, addRisk, updateRisk, deleteRisk,
      addComment, addTask, updateTaskStatus,
      markNotificationRead, markAllRead,
      getActuals, saveActuals,
      createNotification,
      userRole: profile?.role,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

function getRiskPriority(exposure) {
  if (exposure >= 10000) return 'High'
  if (exposure >= 3000) return 'Medium'
  return 'Low'
}

export const useProjects = () => useContext(ProjectContext)
