import { createContext, useContext, useState, useEffect } from 'react'
import { SAMPLE_PROJECTS, SAMPLE_NOTIFICATIONS } from '../data/sampleData'

const ProjectContext = createContext(null)

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState(() => loadFromStorage('aspm_projects', SAMPLE_PROJECTS))
  const [notifications, setNotifications] = useState(() => loadFromStorage('aspm_notifications', SAMPLE_NOTIFICATIONS))

  useEffect(() => { localStorage.setItem('aspm_projects', JSON.stringify(projects)) }, [projects])
  useEffect(() => { localStorage.setItem('aspm_notifications', JSON.stringify(notifications)) }, [notifications])

  function getProject(id) {
    return projects.find(p => p.id === id) || null
  }

  function addProject(projectData) {
    const newProject = {
      ...projectData,
      id: 'p' + Date.now(),
      estimations: [],
      risks: [],
      comments: [],
      activityLog: [],
      tasks: [],
    }
    setProjects(prev => [...prev, newProject])
    return newProject.id
  }

  function updateProject(id, updates) {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  function addEstimation(projectId, estimation) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const version = 'v' + (p.estimations.length + 1)
      const newEst = { ...estimation, id: 'e' + Date.now(), version }
      return { ...p, estimations: [...p.estimations, newEst] }
    }))
  }

  function addRisk(projectId, risk) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const newRisk = {
        ...risk,
        id: 'r' + Date.now(),
        riskExposure: Math.round((risk.probability / 100) * risk.costImpact),
        priority: getRiskPriority((risk.probability / 100) * risk.costImpact),
        status: 'Open',
        mitigation: '',
        monitoring: '',
        management: '',
      }
      const sorted = [...p.risks, newRisk].sort((a, b) => b.riskExposure - a.riskExposure)
      return { ...p, risks: sorted }
    }))
  }

  function updateRisk(projectId, riskId, updates) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const updated = p.risks.map(r => {
        if (r.id !== riskId) return r
        const merged = { ...r, ...updates }
        merged.riskExposure = Math.round((merged.probability / 100) * merged.costImpact)
        merged.priority = getRiskPriority(merged.riskExposure)
        return merged
      })
      return { ...p, risks: updated.sort((a, b) => b.riskExposure - a.riskExposure) }
    }))
  }

  function deleteRisk(projectId, riskId) {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, risks: p.risks.filter(r => r.id !== riskId) }
    ))
  }

  function addComment(projectId, comment) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const newComment = { ...comment, id: 'c' + Date.now(), timestamp: new Date().toISOString(), replies: [] }
      return { ...p, comments: [...p.comments, newComment] }
    }))
  }

  function addTask(projectId, task) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const newTask = { ...task, id: 'task' + Date.now(), status: 'To Do' }
      return { ...p, tasks: [...p.tasks, newTask] }
    }))
  }

  function updateTaskStatus(projectId, taskId, status) {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status } : t) }
    }))
  }

  function markNotificationRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <ProjectContext.Provider value={{
      projects, notifications, unreadCount,
      getProject, addProject, updateProject, deleteProject,
      addEstimation, addRisk, updateRisk, deleteRisk,
      addComment, addTask, updateTaskStatus,
      markNotificationRead, markAllRead,
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
