import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, supabaseAdmin } from '../../lib/supabase'
import { SAMPLE_PROJECTS, SAMPLE_NOTIFICATIONS } from '../data/sampleData'
import { useAuth } from '../../context/AuthContext'

// db is admin client so RLS never blocks data reads in this shared workspace
const db = supabaseAdmin

const ProjectContext = createContext(null)

function shapeProject(p, rel = {}) {
  const features    = rel.features     || p.features     || []
  const team        = rel.project_team || p.project_team || []
  const estimations = rel.estimations  || p.estimations  || []
  const risks       = rel.risks        || p.risks        || []
  const comments    = rel.comments     || p.comments     || []
  const tasks       = rel.tasks        || p.tasks        || []
  const activityLog = rel.activity_log || p.activity_log || []
  const epics       = rel.epics        || p.epics        || []
  const releases    = rel.releases     || p.releases     || []

  return {
    id: p.id, name: p.name, domain: p.domain,
    description: p.description, teamSize: p.team_size,
    teamRoles: p.team_roles || '',
    startDate: p.start_date, deadline: p.deadline, status: p.status,
    budget: parseFloat(p.budget) || 0,

    // features = user stories (enhanced with story fields)
    features: features.map(f => ({
      id: f.id, name: f.name, description: f.description,
      priority: f.priority, status: f.status,
      // story fields (new - default to safe values if columns not yet added)
      epicId:             f.epic_id             || null,
      storyFormat:        f.story_format        || '',
      acceptanceCriteria: f.acceptance_criteria || [],
      storyOwner:         f.story_owner         || '',
      storyPoints:        f.story_points        || 0,
      isReady:            f.is_ready            || false,
      releaseId:          f.release_id          || null,
      rank:               f.rank               || 0,
      riskIds:            f.risk_ids            || [],
      dorChecks:          f.dor_checks          || {},
    })),

    epics: epics.sort((a, b) => (a.rank || 0) - (b.rank || 0)).map(e => ({
      id: e.id, name: e.name, description: e.description || '',
      priority: e.priority || 'Medium', status: e.status || 'To Do',
      color: e.color || '#3B82F6', rank: e.rank || 0,
      releaseId: e.release_id || null,
    })),

    releases: releases.map(r => ({
      id: r.id, name: r.name, version: r.version || '1.0.0',
      goal: r.goal || '', releaseDate: r.release_date,
      status: r.status || 'Planned',
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
      // task fields (new)
      storyId:     t.story_id     || null,
      storyPoints: t.story_points || 0,
      dependsOn:   t.depends_on   || [],
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
  const [projects,      setProjects]      = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
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

    // Epics and releases — tables may not exist until migration is run; degrade gracefully
    const epicRes    = await db.from('epics').select('*').in('project_id', ids)
    const releaseRes = await db.from('releases').select('*').in('project_id', ids)
    const epicData    = epicRes.error    ? [] : (epicRes.data    || [])
    const releaseData = releaseRes.error ? [] : (releaseRes.data || [])

    const shaped = projectRows.map(p => shapeProject(p, {
      features:     (features     || []).filter(r => r.project_id === p.id),
      project_team: (team         || []).filter(r => r.project_id === p.id),
      estimations:  (estimations  || []).filter(r => r.project_id === p.id),
      risks:        (risks        || []).filter(r => r.project_id === p.id),
      comments:     (comments     || []).filter(r => r.project_id === p.id),
      tasks:        (tasks        || []).filter(r => r.project_id === p.id),
      activity_log: (activityLog  || []).filter(r => r.project_id === p.id),
      epics:        epicData.filter(r => r.project_id === p.id),
      releases:     releaseData.filter(r => r.project_id === p.id),
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

  // ── Projects ────────────────────────────────────────────────────────────────
  async function addProject(projectData) {
    if (!isPM) return null
    const id = 'p' + Date.now()
    await db.from('projects').insert({
      id, name: projectData.name, domain: projectData.domain,
      description: projectData.description, team_size: projectData.teamSize,
      team_roles: projectData.teamRoles || '',
      start_date: projectData.startDate, deadline: projectData.deadline,
      status: projectData.status || 'Planning',
      budget: parseFloat(projectData.budget) || 0,
    })
    if (projectData.features?.length) {
      await db.from('features').insert(
        projectData.features.map((f, i) => {
          const ac = f.acceptanceCriteria
          const acNorm = Array.isArray(ac)
            ? ac
            : (typeof ac === 'string' && ac.trim())
              ? ac.split('\n').map(s => s.trim()).filter(Boolean)
              : []
          return {
            id: `${id}_f${i + 1}`, project_id: id,
            name: f.name, description: f.description || '',
            priority: f.priority || 'Should Have', status: f.status || 'To Do',
            acceptance_criteria: acNorm,
          }
        })
      )
    }
    await createNotification('project', `New project "${projectData.name}" created`, id)
    await loadAll()
    return id
  }

  async function updateProject(projectId, updates) {
    if (!isPM) return
    const dbUpdates = {}
    if (updates.name !== undefined)        dbUpdates.name        = updates.name
    if (updates.domain !== undefined)      dbUpdates.domain      = updates.domain
    if (updates.description !== undefined) dbUpdates.description = updates.description
    if (updates.teamSize !== undefined)    dbUpdates.team_size   = updates.teamSize
    if (updates.teamRoles !== undefined)   dbUpdates.team_roles  = updates.teamRoles || ''
    if (updates.startDate !== undefined)   dbUpdates.start_date  = updates.startDate
    if (updates.deadline !== undefined)    dbUpdates.deadline    = updates.deadline
    if (updates.status !== undefined)      dbUpdates.status      = updates.status
    if (updates.budget !== undefined)      dbUpdates.budget      = parseFloat(updates.budget) || 0

    if (Object.keys(dbUpdates).length) {
      await db.from('projects').update(dbUpdates).eq('id', projectId)
    }

    // Notify if deadline or team size changed while estimations exist
    const existingProject = getProject(projectId)
    const constraintChanged =
      (updates.deadline  !== undefined && updates.deadline  !== existingProject?.deadline)  ||
      (updates.teamSize  !== undefined && updates.teamSize  !== existingProject?.teamSize)
    if (constraintChanged && existingProject?.estimations?.length > 0) {
      await createNotification('warning',
        `Constraints changed on "${existingProject.name}" — saved estimations may be outdated`, projectId)
    }

    if (updates.team) {
      await db.from('project_team').delete().eq('project_id', projectId)
      if (updates.team.length) {
        await db.from('project_team').insert(
          updates.team.map(t => ({ id: t.id, project_id: projectId, name: t.name, role: t.role, email: t.email }))
        )
      }
    }

    if (updates.features) {
      // Preserve existing story fields when PM edits project structure
      const existingFeatures = getProject(projectId)?.features || []
      const existingMap = Object.fromEntries(existingFeatures.map(f => [f.id, f]))

      // Log feature-level changes to activity log
      const activityRows = []
      const now = new Date().toISOString()
      const actor = profile?.name || profile?.email || 'PM'
      for (const newF of updates.features) {
        const oldF = existingMap[newF.id]
        if (!oldF) {
          activityRows.push({ id: 'al' + Date.now() + Math.random(), project_id: projectId, user_name: actor, action: `added feature "${newF.name}"`, timestamp: now })
        } else {
          if (oldF.priority !== newF.priority)
            activityRows.push({ id: 'al' + Date.now() + Math.random(), project_id: projectId, user_name: actor, action: `changed "${newF.name}" priority: ${oldF.priority} → ${newF.priority}`, timestamp: now })
          if (oldF.name !== newF.name)
            activityRows.push({ id: 'al' + Date.now() + Math.random(), project_id: projectId, user_name: actor, action: `renamed feature "${oldF.name}" to "${newF.name}"`, timestamp: now })
          if (oldF.status !== newF.status)
            activityRows.push({ id: 'al' + Date.now() + Math.random(), project_id: projectId, user_name: actor, action: `changed "${newF.name}" status: ${oldF.status} → ${newF.status}`, timestamp: now })
        }
      }
      for (const oldF of existingFeatures) {
        if (!updates.features.find(f => f.id === oldF.id))
          activityRows.push({ id: 'al' + Date.now() + Math.random(), project_id: projectId, user_name: actor, action: `removed feature "${oldF.name}"`, timestamp: now })
      }
      if (activityRows.length > 0) await db.from('activity_log').insert(activityRows)

      await db.from('features').delete().eq('project_id', projectId)
      if (updates.features.length) {
        await db.from('features').insert(
          updates.features.map((f, i) => {
            const ex = existingMap[f.id] || {}
            const acValue = f.acceptanceCriteria ?? ex.acceptanceCriteria
            const acNorm = Array.isArray(acValue)
              ? acValue
              : (typeof acValue === 'string' && acValue.trim())
                ? acValue.split('\n').map(s => s.trim()).filter(Boolean)
                : []
            return {
              id: f.id?.startsWith('nf') ? `${projectId}_f${i + 1}` : f.id,
              project_id: projectId, name: f.name,
              description: f.description || '', priority: f.priority, status: f.status,
              epic_id:             ex.epicId             || null,
              story_format:        ex.storyFormat        || '',
              acceptance_criteria: acNorm,
              story_owner:         ex.storyOwner         || '',
              story_points:        ex.storyPoints        || 0,
              is_ready:            ex.isReady            || false,
              release_id:          ex.releaseId          || null,
              rank:                ex.rank               || 0,
              risk_ids:            ex.riskIds            || [],
              dor_checks:          ex.dorChecks          || {},
            }
          })
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

  // ── Epics ───────────────────────────────────────────────────────────────────
  async function addEpic(projectId, epic) {
    const id = 'ep' + Date.now()
    await db.from('epics').insert({
      id, project_id: projectId,
      name: epic.name, description: epic.description || '',
      priority: epic.priority || 'Medium', status: epic.status || 'To Do',
      color: epic.color || '#3B82F6', rank: epic.rank || 0,
      release_id: epic.releaseId || null,
    })
    await loadAll()
  }

  async function updateEpic(epicId, updates) {
    const dbp = {}
    if (updates.name        !== undefined) dbp.name        = updates.name
    if (updates.description !== undefined) dbp.description = updates.description
    if (updates.priority    !== undefined) dbp.priority    = updates.priority
    if (updates.status      !== undefined) dbp.status      = updates.status
    if (updates.color       !== undefined) dbp.color       = updates.color
    if (updates.rank        !== undefined) dbp.rank        = updates.rank
    if (updates.releaseId   !== undefined) dbp.release_id  = updates.releaseId
    if (Object.keys(dbp).length) await db.from('epics').update(dbp).eq('id', epicId)
    await loadAll()
  }

  async function deleteEpic(epicId) {
    await db.from('epics').delete().eq('id', epicId)
    await loadAll()
  }

  // ── Releases ────────────────────────────────────────────────────────────────
  async function addRelease(projectId, release) {
    const id = 'rel' + Date.now()
    await db.from('releases').insert({
      id, project_id: projectId,
      name: release.name, version: release.version || '1.0.0',
      goal: release.goal || '', release_date: release.releaseDate || null,
      status: release.status || 'Planned',
    })
    await loadAll()
  }

  async function updateRelease(releaseId, updates) {
    const dbp = {}
    if (updates.name        !== undefined) dbp.name         = updates.name
    if (updates.version     !== undefined) dbp.version      = updates.version
    if (updates.goal        !== undefined) dbp.goal         = updates.goal
    if (updates.releaseDate !== undefined) dbp.release_date = updates.releaseDate
    if (updates.status      !== undefined) dbp.status       = updates.status
    if (Object.keys(dbp).length) await db.from('releases').update(dbp).eq('id', releaseId)
    await loadAll()
  }

  async function deleteRelease(releaseId) {
    await db.from('releases').delete().eq('id', releaseId)
    await loadAll()
  }

  // ── Stories (individual feature/story CRUD) ─────────────────────────────────
  async function addStory(projectId, story) {
    const id = 'st' + Date.now()
    await db.from('features').insert({
      id, project_id: projectId,
      name: story.name, description: story.description || '',
      priority: story.priority || 'Medium', status: story.status || 'To Do',
      epic_id:             story.epicId             || null,
      story_format:        story.storyFormat        || '',
      acceptance_criteria: story.acceptanceCriteria || [],
      story_owner:         story.storyOwner         || '',
      story_points:        story.storyPoints        || 0,
      is_ready:            story.isReady            || false,
      release_id:          story.releaseId          || null,
      rank:                story.rank               || 0,
      risk_ids:            story.riskIds            || [],
      dor_checks:          story.dorChecks          || {},
    })
    await loadAll()
    return id
  }

  async function updateStory(projectId, storyId, updates) {
    const dbp = {}
    if (updates.name               !== undefined) dbp.name                = updates.name
    if (updates.description        !== undefined) dbp.description         = updates.description
    if (updates.priority           !== undefined) dbp.priority            = updates.priority
    if (updates.status             !== undefined) dbp.status              = updates.status
    if (updates.epicId             !== undefined) dbp.epic_id             = updates.epicId
    if (updates.storyFormat        !== undefined) dbp.story_format        = updates.storyFormat
    if (updates.acceptanceCriteria !== undefined) dbp.acceptance_criteria = updates.acceptanceCriteria
    if (updates.storyOwner         !== undefined) dbp.story_owner         = updates.storyOwner
    if (updates.storyPoints        !== undefined) dbp.story_points        = updates.storyPoints
    if (updates.isReady            !== undefined) dbp.is_ready            = updates.isReady
    if (updates.releaseId          !== undefined) dbp.release_id          = updates.releaseId
    if (updates.rank               !== undefined) dbp.rank                = updates.rank
    if (updates.riskIds            !== undefined) dbp.risk_ids            = updates.riskIds
    if (updates.dorChecks          !== undefined) dbp.dor_checks          = updates.dorChecks
    if (Object.keys(dbp).length) await db.from('features').update(dbp).eq('id', storyId)
    await loadAll()
  }

  async function deleteStory(storyId) {
    await db.from('features').delete().eq('id', storyId)
    await loadAll()
  }

  // ── Estimations ─────────────────────────────────────────────────────────────
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

  // ── Risks ───────────────────────────────────────────────────────────────────
  async function addRisk(projectId, risk) {
    if (!isPM) return
    const riskExposure = Math.round((risk.probability / 100) * risk.costImpact)
    const priority = getRiskPriority(riskExposure)
    await db.from('risks').insert({
      id: 'r' + Date.now(), project_id: projectId,
      description: risk.description, category: risk.category,
      probability: risk.probability, impact: risk.impact,
      cost_impact: risk.costImpact, risk_exposure: riskExposure,
      priority, status: 'Open', mitigation: '', monitoring: '', management: '',
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
    const cost = updates.costImpact  ?? existing?.costImpact  ?? 0
    const riskExposure = Math.round((prob / 100) * cost)

    await db.from('risks').update({
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category    !== undefined && { category:    updates.category    }),
      ...(updates.probability !== undefined && { probability: updates.probability }),
      ...(updates.impact      !== undefined && { impact:      updates.impact      }),
      ...(updates.costImpact  !== undefined && { cost_impact: updates.costImpact  }),
      ...(updates.status      !== undefined && { status:      updates.status      }),
      ...(updates.mitigation  !== undefined && { mitigation:  updates.mitigation  }),
      ...(updates.monitoring  !== undefined && { monitoring:  updates.monitoring  }),
      ...(updates.management  !== undefined && { management:  updates.management  }),
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

  // ── Comments ────────────────────────────────────────────────────────────────
  async function addComment(projectId, comment) {
    await db.from('comments').insert({
      id: 'c' + Date.now(), project_id: projectId,
      author: comment.author, text: comment.text,
      timestamp: new Date().toISOString(), replies: [],
    })
    await loadAll()
  }

  // ── Tasks ───────────────────────────────────────────────────────────────────
  async function addTask(projectId, task) {
    await db.from('tasks').insert({
      id: 'task' + Date.now(), project_id: projectId,
      name: task.name, assignee: task.assignee || null,
      priority: task.priority || 'Medium',
      due_date: task.dueDate || null, status: task.status || 'To Do',
      feature: task.feature || null, description: task.description || null,
      story_id:     task.storyId     || null,
      story_points: task.storyPoints || 0,
      depends_on:   task.dependsOn   || [],
    })
    await loadAll()
  }

  async function updateTask(projectId, taskId, updates) {
    const dbp = {}
    if (updates.name        !== undefined) dbp.name         = updates.name
    if (updates.assignee    !== undefined) dbp.assignee     = updates.assignee
    if (updates.priority    !== undefined) dbp.priority     = updates.priority
    if (updates.dueDate     !== undefined) dbp.due_date     = updates.dueDate
    if (updates.status      !== undefined) dbp.status       = updates.status
    if (updates.feature     !== undefined) dbp.feature      = updates.feature
    if (updates.description !== undefined) dbp.description  = updates.description
    if (updates.storyId     !== undefined) dbp.story_id     = updates.storyId
    if (updates.storyPoints !== undefined) dbp.story_points = updates.storyPoints
    if (updates.dependsOn   !== undefined) dbp.depends_on   = updates.dependsOn
    if (Object.keys(dbp).length) await db.from('tasks').update(dbp).eq('id', taskId)
    await loadAll()
  }

  async function updateTaskStatus(projectId, taskId, status) {
    await db.from('tasks').update({ status }).eq('id', taskId)
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t) }
    ))
  }

  // ── Notifications ───────────────────────────────────────────────────────────
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
      // epic CRUD
      addEpic, updateEpic, deleteEpic,
      // release CRUD
      addRelease, updateRelease, deleteRelease,
      // story (individual feature) CRUD
      addStory, updateStory, deleteStory,
      addEstimation,
      addRisk, updateRisk, deleteRisk,
      addComment,
      addTask, updateTask, updateTaskStatus,
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
