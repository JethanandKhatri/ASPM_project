import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabaseAdmin } from '../../lib/supabase'

const db = supabaseAdmin
const ScrumContext = createContext(null)

function uid() { return Math.random().toString(36).slice(2, 9) }
function todayStr() { return new Date().toISOString().split('T')[0] }
function lsGet(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb } catch { return fb } }

const DEFAULT_DOD = [
  { id: 'd1', text: 'Code reviewed by at least 1 peer',  cat: 'Quality',       enabled: true  },
  { id: 'd2', text: 'Unit tests written and passing',     cat: 'Testing',       enabled: true  },
  { id: 'd3', text: 'No critical bugs in staging',        cat: 'Quality',       enabled: true  },
  { id: 'd4', text: 'Feature deployed to staging',        cat: 'Deployment',    enabled: true  },
  { id: 'd5', text: 'Documentation updated',              cat: 'Documentation', enabled: false },
  { id: 'd6', text: 'Product Owner sign-off received',    cat: 'Quality',       enabled: true  },
]

function shapeSprint(s) {
  return {
    id: s.id, name: s.name, goal: s.goal || '',
    startDate: s.start_date, endDate: s.end_date,
    status: s.status || 'planned',
    taskIds: s.task_ids || [],
    capacity: s.capacity || [],
    completedTaskCount: s.completed_task_count || 0,
    completedAt: s.completed_at || null,
  }
}

function shapeNote(s) {
  return { id: s.id, date: s.date, memberName: s.member_name, did: s.did, will: s.will, blockers: s.blockers }
}

function shapeDodItem(d) {
  return { id: d.id, text: d.text, cat: d.cat, enabled: d.enabled }
}

export function ScrumProvider({ children }) {
  const [sprints, setSprints]           = useState([])
  const [standupNotes, setStandupNotes] = useState([])
  const [dodItems, setDodItems]         = useState([])
  const [dodChecks, setDodChecks]       = useState({})
  const [scrumLoading, setScrumLoading] = useState(true)
  const [useLS, setUseLS]               = useState(false)  // localStorage fallback mode

  const loadAll = useCallback(async () => {
    const [sprintRes, standupRes, dodRes, checksRes] = await Promise.all([
      db.from('sprints').select('*').order('created_at', { ascending: true }),
      db.from('standup_notes').select('*').order('date', { ascending: false }),
      db.from('dod_items').select('*').order('sort_order', { ascending: true }),
      db.from('dod_checks').select('*'),
    ])

    // If tables don't exist, fall back to localStorage (DB migration not yet run)
    if (sprintRes.error?.code === '42P01' || sprintRes.error?.message?.includes('does not exist')) {
      console.warn('[ScrumContext] Tables not found — using localStorage fallback. Run the SQL migration to enable persistence.')
      setUseLS(true)
      const lsDod = lsGet('aspm_dod', DEFAULT_DOD)
      setSprints(lsGet('aspm_sprints', []))
      setStandupNotes(lsGet('aspm_standup', []))
      setDodItems(lsDod.map(d => ({ id: d.id, text: d.text, cat: d.cat, enabled: d.on !== undefined ? d.on : (d.enabled ?? true) })))
      setDodChecks(lsGet('aspm_dod_checks', {}))
      setScrumLoading(false)
      return
    }

    if (sprintRes.error) { console.error('[ScrumContext] sprints error:', sprintRes.error); setScrumLoading(false); return }

    const shapedSprints = (sprintRes.data || []).map(shapeSprint)
    const shapedNotes   = (standupRes.data || []).map(shapeNote)

    // Shape DoD items; if empty, seed defaults (migrating from localStorage if present)
    let shapedDod = (dodRes.data || []).map(shapeDodItem)
    if (shapedDod.length === 0) {
      const lsDod = lsGet('aspm_dod', DEFAULT_DOD)
      const rows  = lsDod.map((d, i) => ({
        id: d.id, text: d.text, cat: d.cat || 'Quality',
        enabled: d.on !== undefined ? d.on : (d.enabled ?? true),
        sort_order: i,
      }))
      const { error } = await db.from('dod_items').insert(rows)
      if (!error) { shapedDod = rows.map(r => ({ id: r.id, text: r.text, cat: r.cat, enabled: r.enabled })); localStorage.removeItem('aspm_dod') }
    }

    // Shape DoD checks into nested { [featureId]: { [itemId]: bool } }
    const shapedChecks = {}
    for (const c of (checksRes.data || [])) {
      if (!shapedChecks[c.feature_id]) shapedChecks[c.feature_id] = {}
      shapedChecks[c.feature_id][c.item_id] = c.checked
    }

    // Migrate sprints from localStorage if DB is empty
    if (shapedSprints.length === 0) {
      const lsSprints = lsGet('aspm_sprints', [])
      if (lsSprints.length > 0) {
        const rows = lsSprints.map(s => ({
          id: s.id, name: s.name, goal: s.goal || '',
          start_date: s.startDate || null, end_date: s.endDate || null,
          status: s.status || 'planned',
          task_ids: s.taskIds || [],
          capacity: s.capacity || [],
          completed_task_count: s.completedTaskCount || 0,
          completed_at: s.completedAt || null,
        }))
        const { error } = await db.from('sprints').insert(rows)
        if (!error) { localStorage.removeItem('aspm_sprints'); return loadAll() }
      }
    }

    // Migrate standup notes from localStorage if DB is empty
    if (shapedNotes.length === 0) {
      const lsNotes = lsGet('aspm_standup', [])
      if (lsNotes.length > 0) {
        const rows = lsNotes.map(n => ({
          id: n.id, date: n.date, member_name: n.memberName || n.member_name || '',
          did: n.did || '', will: n.will || '', blockers: n.blockers || '',
        }))
        const { error } = await db.from('standup_notes').insert(rows)
        if (!error) { localStorage.removeItem('aspm_standup'); return loadAll() }
      }
    }

    // Migrate dod_checks from localStorage if DB is empty
    if ((checksRes.data || []).length === 0) {
      const lsChecks = lsGet('aspm_dod_checks', {})
      const rows = []
      for (const [featureId, items] of Object.entries(lsChecks)) {
        for (const [itemId, checked] of Object.entries(items)) {
          rows.push({ feature_id: featureId, item_id: itemId, checked: Boolean(checked) })
        }
      }
      if (rows.length > 0) {
        const { error } = await db.from('dod_checks').insert(rows)
        if (!error) { localStorage.removeItem('aspm_dod_checks'); return loadAll() }
      }
    }

    setSprints(shapedSprints)
    setStandupNotes(shapedNotes)
    setDodItems(shapedDod)
    setDodChecks(shapedChecks)
    setScrumLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Sprint operations ──────────────────────────────────────────────────────

  async function addSprint(data) {
    const id  = 'sp' + uid()
    const mem = { id, name: data.name, goal: data.goal || '', startDate: data.startDate, endDate: data.endDate, status: 'planned', taskIds: [], capacity: [], completedTaskCount: 0, completedAt: null }
    setSprints(prev => [...prev, mem])
    if (!useLS) {
      await db.from('sprints').insert({ id, name: data.name, goal: data.goal || '', start_date: data.startDate || null, end_date: data.endDate || null, status: 'planned', task_ids: [], capacity: [], completed_task_count: 0 })
    } else {
      const next = [...sprints, mem]; localStorage.setItem('aspm_sprints', JSON.stringify(next))
    }
  }

  async function updateSprint(id, patches) {
    setSprints(prev => prev.map(s => s.id === id ? { ...s, ...patches } : s))
    if (!useLS) {
      const dbp = {}
      if (patches.status !== undefined)             dbp.status = patches.status
      if (patches.taskIds !== undefined)            dbp.task_ids = patches.taskIds
      if (patches.capacity !== undefined)           dbp.capacity = patches.capacity
      if (patches.completedTaskCount !== undefined) dbp.completed_task_count = patches.completedTaskCount
      if (patches.completedAt !== undefined)        dbp.completed_at = patches.completedAt
      if (Object.keys(dbp).length) await db.from('sprints').update(dbp).eq('id', id)
      if (patches.status === 'active' || patches.status === 'completed') {
        const sprint = sprints.find(s => s.id === id)
        const msg = patches.status === 'active'
          ? `Sprint "${sprint?.name}" has started`
          : `Sprint "${sprint?.name}" completed — ${patches.completedTaskCount ?? 0} tasks done`
        db.from('notifications').insert({ id: 'n' + Date.now(), type: 'sprint', message: msg, project_id: null, read: false, timestamp: new Date().toISOString() })
      }
    } else {
      const next = sprints.map(s => s.id === id ? { ...s, ...patches } : s); localStorage.setItem('aspm_sprints', JSON.stringify(next))
    }
  }

  async function deleteSprint(id) {
    setSprints(prev => prev.filter(s => s.id !== id))
    if (!useLS) await db.from('sprints').delete().eq('id', id)
    else { const next = sprints.filter(s => s.id !== id); localStorage.setItem('aspm_sprints', JSON.stringify(next)) }
  }

  // ── Standup operations ─────────────────────────────────────────────────────

  async function addStandupNote(data) {
    const id   = data.id || ('sn' + uid())
    const note = { id, date: data.date, memberName: data.memberName, did: data.did || '', will: data.will || '', blockers: data.blockers || '' }
    setStandupNotes(prev => [...prev, note])
    if (!useLS) {
      await db.from('standup_notes').insert({ id, date: data.date, member_name: data.memberName, did: data.did || '', will: data.will || '', blockers: data.blockers || '' })
    } else {
      const next = [...standupNotes, note]; localStorage.setItem('aspm_standup', JSON.stringify(next))
    }
  }

  async function deleteStandupNote(id) {
    setStandupNotes(prev => prev.filter(n => n.id !== id))
    if (!useLS) await db.from('standup_notes').delete().eq('id', id)
    else { const next = standupNotes.filter(n => n.id !== id); localStorage.setItem('aspm_standup', JSON.stringify(next)) }
  }

  // ── DoD operations ─────────────────────────────────────────────────────────

  async function addDodItem(data) {
    const id   = 'di' + uid()
    const item = { id, text: data.text, cat: data.cat || 'Quality', enabled: true }
    setDodItems(prev => [...prev, item])
    if (!useLS) {
      await db.from('dod_items').insert({ id, text: data.text, cat: data.cat || 'Quality', enabled: true, sort_order: dodItems.length })
    } else {
      const next = [...dodItems, item]; localStorage.setItem('aspm_dod', JSON.stringify(next.map(d => ({ ...d, on: d.enabled }))))
    }
  }

  async function toggleDodItem(id) {
    const item = dodItems.find(d => d.id === id)
    if (!item) return
    const enabled = !item.enabled
    setDodItems(prev => prev.map(d => d.id === id ? { ...d, enabled } : d))
    if (!useLS) await db.from('dod_items').update({ enabled }).eq('id', id)
    else {
      const next = dodItems.map(d => d.id === id ? { ...d, enabled } : d)
      localStorage.setItem('aspm_dod', JSON.stringify(next.map(d => ({ ...d, on: d.enabled }))))
    }
  }

  async function deleteDodItem(id) {
    setDodItems(prev => prev.filter(d => d.id !== id))
    if (!useLS) await db.from('dod_items').delete().eq('id', id)
    else {
      const next = dodItems.filter(d => d.id !== id)
      localStorage.setItem('aspm_dod', JSON.stringify(next.map(d => ({ ...d, on: d.enabled }))))
    }
  }

  async function setDodCheck(featureId, itemId, checked) {
    setDodChecks(prev => ({ ...prev, [featureId]: { ...(prev[featureId] || {}), [itemId]: checked } }))
    if (!useLS) {
      await db.from('dod_checks').upsert({ feature_id: featureId, item_id: itemId, checked })
    } else {
      const next = { ...dodChecks, [featureId]: { ...(dodChecks[featureId] || {}), [itemId]: checked } }
      localStorage.setItem('aspm_dod_checks', JSON.stringify(next))
    }
  }

  return (
    <ScrumContext.Provider value={{
      sprints, standupNotes, dodItems, dodChecks, scrumLoading,
      addSprint, updateSprint, deleteSprint,
      addStandupNote, deleteStandupNote,
      addDodItem, toggleDodItem, deleteDodItem, setDodCheck,
    }}>
      {children}
    </ScrumContext.Provider>
  )
}

export const useScrum = () => useContext(ScrumContext)
