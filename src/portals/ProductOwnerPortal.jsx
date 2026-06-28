import { useState, useMemo } from 'react'
import { useProjects } from '../case-tool/context/ProjectContext'
import { useThemeColors } from '../case-tool/context/ThemeContext'
import { useScrum } from '../case-tool/context/ScrumContext'

// ── Utilities ─────────────────────────────────────────────────────────────────
function uid()         { return Math.random().toString(36).slice(2, 9) }
function initials(n='') { return (n||'').split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase()||'?' }
function pColor(p, C)  { return p==='High'?C.danger:p==='Medium'?C.warning:C.success }

// ── Constants ─────────────────────────────────────────────────────────────────
const EPIC_COLORS = ['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#EF4444','#06B6D4','#F97316']
const FIB_PTS     = [0,1,2,3,5,8,13,21]
const PRIORITIES  = ['High','Medium','Low']
const STATUSES    = ['To Do','In Progress','Done','On Hold']
const RELEASE_STATUSES = ['Planned','In Progress','Released','Cancelled']

const DOR_CHECKS = [
  { id:'hasFormat',   label:'Story follows "As a... I want... So that..." format' },
  { id:'hasAC',       label:'Acceptance criteria are written and testable'         },
  { id:'hasEstimate', label:'Story points estimated by team'                       },
  { id:'hasDeps',     label:'Dependencies identified'                              },
  { id:'hasEpic',     label:'Assigned to an epic'                                  },
  { id:'noBlockers',  label:'No known technical blockers'                          },
]

// ── Shared atoms ──────────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return <span style={{ padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600, background:bg, color, textTransform:'capitalize', whiteSpace:'nowrap', display:'inline-block' }}>{label}</span>
}
function Card({ children, style, C }) {
  return <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:10, padding:20, ...style }}>{children}</div>
}
function SecTitle({ children, action, C }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
      <h3 style={{ margin:0, fontSize:14, fontWeight:600, color:C.textPrimary }}>{children}</h3>
      {action}
    </div>
  )
}
function Modal({ title, onClose, children, width=560, C }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:C.cardBg, borderRadius:14, width, maxWidth:'95vw', maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 60px rgba(0,0,0,.35)', border:`1px solid ${C.border}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 22px', borderBottom:`1px solid ${C.border}`, position:'sticky', top:0, background:C.cardBg, zIndex:1 }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:C.textPrimary }}>{title}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:C.textSecondary, padding:'0 4px', lineHeight:1, fontFamily:'inherit' }}>×</button>
        </div>
        <div style={{ padding:22 }}>{children}</div>
      </div>
    </div>
  )
}
function DorBadge({ story, epics, C }) {
  const auto = {
    hasFormat:   story.storyFormat?.includes('I want') || false,
    hasAC:       (story.acceptanceCriteria?.length||0) > 0,
    hasEstimate: (story.storyPoints||0) > 0,
    hasDeps:     true,
    hasEpic:     !!story.epicId,
    noBlockers:  story.dorChecks?.noBlockers || false,
  }
  const checks = { ...auto, ...story.dorChecks }
  const done   = DOR_CHECKS.filter(d => checks[d.id]).length
  const all    = DOR_CHECKS.length
  const ready  = done === all || story.isReady
  return (
    <span style={{ padding:'2px 9px', borderRadius:4, fontSize:11, fontWeight:700, background:ready?C.success+'18':done>=4?C.warning+'18':C.danger+'10', color:ready?C.success:done>=4?C.warning:C.danger }}>
      DoR {done}/{all}
    </span>
  )
}
function SpBadge({ pts, C }) {
  if (!pts) return <span style={{ fontSize:11, color:C.textSecondary, background:C.border, borderRadius:10, padding:'1px 7px' }}>? SP</span>
  return <span style={{ fontSize:11, fontWeight:700, color:C.primary, background:C.primary+'15', borderRadius:10, padding:'2px 8px' }}>{pts} SP</span>
}
function EpicTag({ epicId, epics, C, small=false }) {
  const ep = epics.find(e=>e.id===epicId)
  if (!ep) return null
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:small?10:11, fontWeight:600, color:'#fff', background:ep.color+'cc', borderRadius:4, padding:small?'1px 6px':'2px 9px', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={ep.name}>
      {ep.name}
    </span>
  )
}
function Inp({ label, value, onChange, type='text', placeholder, required, C, style }) {
  const s = { width:'100%', padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit', boxSizing:'border-box', ...style }
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>{label}{required&&<span style={{ color:C.danger }}> *</span>}</label>}
      <input type={type} style={s} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} />
    </div>
  )
}
function Sel({ label, value, onChange, opts, C }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:'100%', padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }}>
        {opts.map(o => typeof o==='string' ? <option key={o} value={o}>{o}</option> : <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}

// ── Story Form Modal ──────────────────────────────────────────────────────────
function StoryFormModal({ story, projectId, projects, allEpics, allReleases, allRisks, onSave, onClose, C }) {
  const isNew = !story?.id
  const [form, setForm] = useState({
    name:               story?.name               || '',
    description:        story?.description        || '',
    priority:           story?.priority           || 'Medium',
    status:             story?.status             || 'To Do',
    storyPoints:        story?.storyPoints        || 0,
    storyOwner:         story?.storyOwner         || '',
    epicId:             story?.epicId             || '',
    releaseId:          story?.releaseId          || '',
    riskIds:            story?.riskIds            || [],
    isReady:            story?.isReady            || false,
    // story format parts
    asRole:             '',
    iWant:              '',
    soThat:             '',
    acceptanceCriteria: story?.acceptanceCriteria  || [],
    dorChecks:          story?.dorChecks           || {},
  })
  const [newAC, setNewAC] = useState('')
  const [err,   setErr]   = useState('')

  // Parse existing storyFormat back into parts
  useMemo(() => {
    const sf = story?.storyFormat || ''
    const m  = sf.match(/As a (.+?) I want (.+?) so that (.+)/i)
    if (m) setForm(f => ({ ...f, asRole: m[1], iWant: m[2], soThat: m[3] }))
  }, [])

  const pid = projectId || story?.projectId
  const projEpics    = allEpics.filter(e   => e.projectId === pid || !pid)
  const projReleases = allReleases.filter(r => r.projectId === pid || !pid)
  const projRisks    = allRisks.filter(r   => r.projectId === pid || !pid)

  function computeDoR(f) {
    const sf = `As a ${f.asRole} I want ${f.iWant} so that ${f.soThat}`
    return {
      hasFormat:   f.asRole.trim() !== '' && f.iWant.trim() !== '' && f.soThat.trim() !== '',
      hasAC:       f.acceptanceCriteria.length > 0,
      hasEstimate: f.storyPoints > 0,
      hasDeps:     true,
      hasEpic:     f.epicId !== '',
      noBlockers:  f.dorChecks.noBlockers || false,
    }
  }

  function addAC() {
    if (!newAC.trim()) return
    setForm(f => ({ ...f, acceptanceCriteria: [...f.acceptanceCriteria, { id: uid(), text: newAC.trim(), checked: false }] }))
    setNewAC('')
  }
  function removeAC(id) { setForm(f => ({ ...f, acceptanceCriteria: f.acceptanceCriteria.filter(a => a.id !== id) })) }
  function toggleRisk(rid) {
    setForm(f => ({ ...f, riskIds: f.riskIds.includes(rid) ? f.riskIds.filter(r=>r!==rid) : [...f.riskIds, rid] }))
  }
  function toggleDorCheck(key) { setForm(f => ({ ...f, dorChecks: { ...f.dorChecks, [key]: !f.dorChecks[key] } })) }

  async function save() {
    if (!form.name.trim()) { setErr('Story name is required.'); return }
    const sf = form.asRole.trim() && form.iWant.trim() ? `As a ${form.asRole} I want ${form.iWant} so that ${form.soThat}` : ''
    const dor = computeDoR(form)
    const merged = { ...form.dorChecks, ...dor }
    const ready  = DOR_CHECKS.every(d => merged[d.id])
    const payload = {
      name: form.name.trim(), description: form.description,
      priority: form.priority, status: form.status,
      storyPoints: form.storyPoints, storyOwner: form.storyOwner,
      epicId: form.epicId || null, releaseId: form.releaseId || null,
      riskIds: form.riskIds, isReady: ready,
      storyFormat: sf,
      acceptanceCriteria: form.acceptanceCriteria,
      dorChecks: merged,
    }
    await onSave(payload)
    onClose()
  }

  const dor = computeDoR(form)
  const dorMerged = { ...form.dorChecks, ...dor }
  const doneCnt = DOR_CHECKS.filter(d => dorMerged[d.id]).length
  const inp = { width:'100%', padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit', boxSizing:'border-box' }
  const ta  = { ...inp, resize:'vertical', minHeight:60 }

  return (
    <Modal title={isNew ? 'Create User Story' : 'Edit Story'} onClose={onClose} width={680} C={C}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Left column */}
        <div>
          <Inp label="Story Name" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} required placeholder="Short story name" C={C} />
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Description</label>
            <textarea style={ta} placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          </div>
          {/* Story format */}
          <div style={{ marginBottom:12, background:C.primary+'08', borderRadius:9, padding:'12px 14px', border:`1px solid ${C.primary}20` }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.primary, letterSpacing:.6, textTransform:'uppercase', marginBottom:8 }}>Story Format</div>
            {[
              { lbl:'As a', ph:'user / admin / developer', k:'asRole' },
              { lbl:'I want',  ph:'e.g. view my dashboard', k:'iWant'  },
              { lbl:'So that', ph:'e.g. I can track progress', k:'soThat' },
            ].map(f => (
              <div key={f.k} style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:7 }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.primary, minWidth:60 }}>{f.lbl}</span>
                <input style={{ ...inp, flex:1 }} placeholder={f.ph} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} />
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <Sel label="Priority" value={form.priority} onChange={v=>setForm(f=>({...f,priority:v}))} opts={PRIORITIES} C={C} />
            <Sel label="Status"   value={form.status}   onChange={v=>setForm(f=>({...f,status:v}))}   opts={STATUSES}   C={C} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Story Points</label>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {FIB_PTS.map(p => (
                  <button key={p} onClick={()=>setForm(f=>({...f,storyPoints:p}))} style={{ width:36, height:36, borderRadius:6, border:`1.5px solid ${form.storyPoints===p?C.primary:C.border}`, background:form.storyPoints===p?C.primary:C.cardBg, color:form.storyPoints===p?'#fff':C.textSecondary, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{p||'?'}</button>
                ))}
              </div>
            </div>
            <Inp label="Story Owner" value={form.storyOwner} onChange={v=>setForm(f=>({...f,storyOwner:v}))} placeholder="Name" C={C} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Epic</label>
              <select value={form.epicId} onChange={e=>setForm(f=>({...f,epicId:e.target.value}))} style={inp}>
                <option value="">— no epic —</option>
                {projEpics.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Release</label>
              <select value={form.releaseId} onChange={e=>setForm(f=>({...f,releaseId:e.target.value}))} style={inp}>
                <option value="">— no release —</option>
                {projReleases.map(r => <option key={r.id} value={r.id}>{r.name} {r.version}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Acceptance Criteria */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:7 }}>Acceptance Criteria</div>
            {form.acceptanceCriteria.map(ac => (
              <div key={ac.id} style={{ display:'flex', alignItems:'flex-start', gap:7, marginBottom:6 }}>
                <span style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${C.success}`, background:C.success+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                  <span style={{ fontSize:9, color:C.success }}>✓</span>
                </span>
                <span style={{ fontSize:13, color:C.textPrimary, flex:1, lineHeight:1.4 }}>{ac.text}</span>
                <button onClick={()=>removeAC(ac.id)} style={{ background:'none', border:'none', color:C.textSecondary, cursor:'pointer', fontSize:16, padding:0, lineHeight:1, fontFamily:'inherit' }}>×</button>
              </div>
            ))}
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <input style={{ ...inp, flex:1 }} placeholder="Add acceptance criterion…" value={newAC} onChange={e=>setNewAC(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addAC()} />
              <button onClick={addAC} style={{ padding:'9px 14px', background:C.success, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>+</button>
            </div>
          </div>

          {/* Definition of Ready */}
          <div style={{ background:doneCnt===6?C.success+'08':C.mainBg, border:`1px solid ${doneCnt===6?C.success+'40':C.border}`, borderRadius:9, padding:'12px 14px', marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.textPrimary }}>Definition of Ready</div>
              <span style={{ fontSize:11, fontWeight:700, color:doneCnt===6?C.success:doneCnt>=4?C.warning:C.danger }}>{doneCnt}/6 satisfied</span>
            </div>
            {DOR_CHECKS.map(d => {
              const auto = dor[d.id]
              const manual = form.dorChecks[d.id]
              const checked = auto || manual
              return (
                <div key={d.id} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6, cursor: auto?'default':'pointer' }} onClick={() => !auto && toggleDorCheck(d.id)}>
                  <div style={{ width:16, height:16, borderRadius:3, border:`1.5px solid ${checked?C.success:C.border}`, background:checked?C.success:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    {checked && <span style={{ fontSize:9, color:'#fff' }}>✓</span>}
                  </div>
                  <span style={{ fontSize:12, color:checked?C.textPrimary:C.textSecondary, lineHeight:1.4 }}>
                    {d.label} {auto && <span style={{ fontSize:10, color:C.success }}>(auto)</span>}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Linked Risks */}
          {projRisks.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:7 }}>Linked Risks</div>
              <div style={{ maxHeight:120, overflowY:'auto', display:'flex', flexDirection:'column', gap:5 }}>
                {projRisks.map(r => (
                  <div key={r.id} onClick={()=>toggleRisk(r.id)} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'6px 8px', borderRadius:6, border:`1px solid ${form.riskIds.includes(r.id)?C.danger+'50':C.border}`, background:form.riskIds.includes(r.id)?C.danger+'08':C.cardBg, cursor:'pointer' }}>
                    <div style={{ width:14, height:14, borderRadius:3, border:`1.5px solid ${form.riskIds.includes(r.id)?C.danger:C.border}`, background:form.riskIds.includes(r.id)?C.danger:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      {form.riskIds.includes(r.id) && <span style={{ fontSize:8, color:'#fff' }}>✓</span>}
                    </div>
                    <span style={{ fontSize:12, color:C.textPrimary, lineHeight:1.4 }}>{r.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {err && <p style={{ margin:'8px 0', color:C.danger, fontSize:12 }}>{err}</p>}
      <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:18, borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
        <button onClick={onClose} style={{ padding:'8px 18px', background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, cursor:'pointer', color:C.textSecondary, fontFamily:'inherit' }}>Cancel</button>
        <button onClick={save} style={{ padding:'8px 20px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          {isNew ? 'Create Story' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  )
}

// ── BACKLOG TAB ───────────────────────────────────────────────────────────────
function BacklogTab({ projects, allStories, allEpics, allReleases, allRisks }) {
  const C = useThemeColors()
  const { addStory, updateStory, deleteStory } = useProjects()
  const { sprints } = useScrum()
  const [selProject, setSelProject] = useState('all')
  const [sortBy,     setSortBy]     = useState('rank')
  const [showModal,  setShowModal]  = useState(false)
  const [editStory,  setEditStory]  = useState(null)

  const assignedToSprint = useMemo(() => {
    const map = {}
    sprints.forEach(sp => (sp.taskIds||[]).forEach(tid => { map[tid] = sp.name }))
    return map
  }, [sprints])

  const filtered = useMemo(() => {
    let stories = allStories
    if (selProject !== 'all') stories = stories.filter(s => s.projectId === selProject)
    if (sortBy === 'rank')     return [...stories].sort((a,b) => (a.rank||0) - (b.rank||0))
    if (sortBy === 'priority') return [...stories].sort((a,b) => ['High','Medium','Low'].indexOf(a.priority) - ['High','Medium','Low'].indexOf(b.priority))
    if (sortBy === 'points')   return [...stories].sort((a,b) => (b.storyPoints||0) - (a.storyPoints||0))
    return stories
  }, [allStories, selProject, sortBy])

  function moveRank(story, dir) {
    const list = filtered.filter(s => s.projectId === story.projectId).sort((a,b)=>(a.rank||0)-(b.rank||0))
    const idx  = list.findIndex(s => s.id === story.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= list.length) return
    const swap = list[swapIdx]
    updateStory(story.projectId, story.id,   { rank: swap.rank  || swapIdx })
    updateStory(swap.projectId,  swap.id,    { rank: story.rank || idx     })
  }

  function openEdit(s) { setEditStory(s); setShowModal(true) }
  function openNew()   { setEditStory(null); setShowModal(true) }

  async function handleSave(payload) {
    if (editStory) {
      await updateStory(editStory.projectId, editStory.id, payload)
    } else {
      const pid = selProject !== 'all' ? selProject : projects[0]?.id
      if (pid) await addStory(pid, payload)
    }
  }

  const inp = { padding:'7px 10px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }

  return (
    <>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:18, flexWrap:'wrap' }}>
        {[
          { l:'Project', v:selProject, set:setSelProject, opts:[{v:'all',l:'All projects'},...projects.map(p=>({v:p.id,l:p.name}))] },
          { l:'Sort',    v:sortBy,     set:setSortBy,     opts:[{v:'rank',l:'Priority Rank'},{v:'priority',l:'Priority'},{v:'points',l:'Story Points'}] },
        ].map(f => (
          <div key={f.l} style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:C.textSecondary }}>{f.l}:</span>
            <select value={f.v} onChange={e=>f.set(e.target.value)} style={inp}>
              {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
        ))}
        <span style={{ fontSize:12, color:C.textSecondary, marginLeft:'auto' }}>{filtered.length} stories</span>
        <button onClick={openNew} style={{ padding:'7px 16px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>+ New Story</button>
      </div>

      <div style={{ background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden' }}>
        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'50px 1fr 90px 70px 80px 80px 100px 80px', gap:8, padding:'10px 14px', borderBottom:`2px solid ${C.border}`, background:C.mainBg }}>
          {['Rank','Story','Epic','Points','Priority','DoR','Sprint','Actions'].map(h => (
            <div key={h} style={{ fontSize:11, fontWeight:700, color:C.textSecondary, textTransform:'uppercase', letterSpacing:.5 }}>{h}</div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ padding:'40px', textAlign:'center', color:C.textSecondary, fontSize:13 }}>
            No stories yet. Click "+ New Story" to create the first one.
          </div>
        )}
        {filtered.map((s, idx) => {
          const ep     = allEpics.find(e => e.id === s.epicId)
          const pc     = pColor(s.priority, C)
          const sprint = assignedToSprint[s.id]
          const projStories = filtered.filter(x => x.projectId === s.projectId).sort((a,b)=>(a.rank||0)-(b.rank||0))
          const posInProj   = projStories.findIndex(x => x.id === s.id)
          const isFirst = posInProj === 0
          const isLast  = posInProj === projStories.length - 1
          return (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'50px 1fr 90px 70px 80px 80px 100px 80px', gap:8, padding:'10px 14px', borderBottom:`1px solid ${C.border}`, alignItems:'center', background:idx%2===0?C.cardBg:C.mainBg }}>
              {/* Rank controls */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                <button onClick={()=>moveRank(s,-1)} disabled={isFirst} style={{ background:'none', border:'none', cursor:isFirst?'default':'pointer', color:isFirst?C.border:C.textSecondary, fontSize:14, padding:'1px 4px', fontFamily:'inherit' }}>▲</button>
                <span style={{ fontSize:11, fontWeight:600, color:C.textSecondary }}>{posInProj+1}</span>
                <button onClick={()=>moveRank(s,+1)} disabled={isLast}  style={{ background:'none', border:'none', cursor:isLast?'default':'pointer',  color:isLast?C.border:C.textSecondary, fontSize:14, padding:'1px 4px', fontFamily:'inherit' }}>▼</button>
              </div>
              {/* Story name */}
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                {s.storyFormat && <div style={{ fontSize:11, color:C.textSecondary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.storyFormat}</div>}
                <div style={{ fontSize:11, color:C.textSecondary }}>{s.projectName}</div>
              </div>
              {/* Epic */}
              {ep ? <EpicTag epicId={s.epicId} epics={allEpics} C={C} /> : <span style={{ fontSize:11, color:C.border }}>—</span>}
              {/* Points */}
              <SpBadge pts={s.storyPoints} C={C} />
              {/* Priority */}
              <Badge label={s.priority} color={pc} bg={pc+'18'} />
              {/* DoR */}
              <DorBadge story={s} epics={allEpics} C={C} />
              {/* Sprint */}
              {sprint ? <span style={{ fontSize:11, color:C.primary, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sprint}</span> : <span style={{ fontSize:11, color:C.border }}>Backlog</span>}
              {/* Actions */}
              <div style={{ display:'flex', gap:5 }}>
                <button onClick={()=>openEdit(s)} style={{ padding:'4px 10px', background:C.primary+'15', color:C.primary, border:`1px solid ${C.primary}30`, borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Edit</button>
                <button onClick={()=>deleteStory(s.id)} style={{ padding:'4px 8px', background:C.danger+'10', color:C.danger, border:`1px solid ${C.danger}25`, borderRadius:5, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <StoryFormModal
          story={editStory} projectId={selProject!=='all'?selProject:null}
          projects={projects} allEpics={allEpics} allReleases={allReleases} allRisks={allRisks}
          onSave={handleSave} onClose={()=>setShowModal(false)} C={C}
        />
      )}
    </>
  )
}

// ── EPICS TAB ─────────────────────────────────────────────────────────────────
function EpicsTab({ projects, allStories, allEpics }) {
  const C = useThemeColors()
  const { addEpic, updateEpic, deleteEpic } = useProjects()
  const [selProject, setSelProject] = useState(projects[0]?.id || '')
  const [showForm,   setShowForm]   = useState(false)
  const [editEpic,   setEditEpic]   = useState(null)
  const [form,       setForm]       = useState({ name:'', description:'', priority:'Medium', status:'To Do', color:EPIC_COLORS[0], releaseId:'' })

  const projEpics   = allEpics.filter(e => e.projectId === selProject).sort((a,b) => (a.rank||0)-(b.rank||0))
  const projStories = allStories.filter(s => s.projectId === selProject)

  function openNew()   { setForm({ name:'', description:'', priority:'Medium', status:'To Do', color:EPIC_COLORS[0], releaseId:'' }); setEditEpic(null); setShowForm(true) }
  function openEdit(e) { setForm({ name:e.name, description:e.description, priority:e.priority, status:e.status, color:e.color, releaseId:e.releaseId||'' }); setEditEpic(e); setShowForm(true) }

  async function saveEpic() {
    if (!form.name.trim()) return
    if (editEpic) { await updateEpic(editEpic.id, { ...form }); }
    else           { await addEpic(selProject, { ...form }) }
    setShowForm(false)
  }

  const inp = { width:'100%', padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit', boxSizing:'border-box' }

  return (
    <>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:18 }}>
        <select value={selProject} onChange={e=>setSelProject(e.target.value)} style={{ padding:'7px 10px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span style={{ fontSize:12, color:C.textSecondary }}>{projEpics.length} epics</span>
        <button onClick={openNew} style={{ padding:'7px 16px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginLeft:'auto' }}>+ New Epic</button>
      </div>

      {projEpics.length === 0 && (
        <Card C={C} style={{ textAlign:'center', padding:'40px 20px' }}>
          <p style={{ margin:'0 0 4px', fontSize:15, fontWeight:600, color:C.textPrimary }}>No epics yet</p>
          <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>Create epics to group your user stories into larger themes.</p>
        </Card>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
        {projEpics.map(ep => {
          const stories  = projStories.filter(s => s.epicId === ep.id)
          const done     = stories.filter(s => s.status === 'Done').length
          const totalSP  = stories.reduce((a,s) => a+(s.storyPoints||0), 0)
          const doneSP   = stories.filter(s=>s.status==='Done').reduce((a,s)=>a+(s.storyPoints||0),0)
          const pct      = stories.length > 0 ? Math.round(done/stories.length*100) : 0
          const pc       = pColor(ep.priority, C)
          return (
            <Card key={ep.id} C={C}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:14, height:14, borderRadius:3, background:ep.color, flexShrink:0 }} />
                  <span style={{ fontSize:14, fontWeight:700, color:C.textPrimary }}>{ep.name}</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>openEdit(ep)} style={{ padding:'3px 9px', background:C.primary+'15', color:C.primary, border:`1px solid ${C.primary}30`, borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Edit</button>
                  <button onClick={()=>deleteEpic(ep.id)} style={{ padding:'3px 8px', background:C.danger+'10', color:C.danger, border:`1px solid ${C.danger}25`, borderRadius:5, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
                </div>
              </div>
              {ep.description && <p style={{ margin:'0 0 8px', fontSize:12, color:C.textSecondary, lineHeight:1.5 }}>{ep.description}</p>}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                <Badge label={ep.priority} color={pc} bg={pc+'18'} />
                <Badge label={ep.status} color={ep.status==='Done'?C.success:ep.status==='In Progress'?C.primary:C.textSecondary} bg={ep.status==='Done'?C.success+'15':ep.status==='In Progress'?C.primary+'15':C.border} />
                <span style={{ fontSize:11, color:C.textSecondary }}>{totalSP} SP total</span>
              </div>
              <div style={{ height:5, background:C.border, borderRadius:3, marginBottom:8 }}>
                <div style={{ height:'100%', width:`${pct}%`, background:ep.color, borderRadius:3, transition:'width .4s' }} />
              </div>
              <div style={{ fontSize:11, color:C.textSecondary, marginBottom:10 }}>
                {done}/{stories.length} stories done · {doneSP}/{totalSP} SP
              </div>
              {stories.length > 0 && (
                <div style={{ background:C.mainBg, borderRadius:7, padding:'8px 10px' }}>
                  {stories.slice(0,4).map(s => (
                    <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0', borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:12, color:C.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{s.name}</span>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        <SpBadge pts={s.storyPoints} C={C} />
                        <DorBadge story={s} epics={allEpics} C={C} />
                      </div>
                    </div>
                  ))}
                  {stories.length > 4 && <div style={{ fontSize:11, color:C.textSecondary, paddingTop:5 }}>+{stories.length-4} more</div>}
                </div>
              )}
              {stories.length === 0 && (
                <p style={{ margin:0, fontSize:12, color:C.textSecondary }}>No stories assigned to this epic yet.</p>
              )}
            </Card>
          )
        })}
      </div>

      {showForm && (
        <Modal title={editEpic ? 'Edit Epic' : 'Create Epic'} onClose={()=>setShowForm(false)} width={480} C={C}>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Epic Name <span style={{ color:C.danger }}>*</span></label>
            <input style={inp} placeholder="e.g. Authentication & Security" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Description</label>
            <textarea style={{ ...inp, resize:'vertical', minHeight:60 }} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Priority</label>
              <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={inp}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inp}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:7 }}>Color</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {EPIC_COLORS.map(c => (
                <button key={c} onClick={()=>setForm(f=>({...f,color:c}))} style={{ width:30, height:30, borderRadius:6, background:c, border:form.color===c?`3px solid ${C.textPrimary}`:'2px solid transparent', cursor:'pointer' }} />
              ))}
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <button onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, cursor:'pointer', color:C.textSecondary, fontFamily:'inherit' }}>Cancel</button>
            <button onClick={saveEpic} style={{ padding:'8px 18px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{editEpic?'Save':'Create'}</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── RELEASES TAB ──────────────────────────────────────────────────────────────
function ReleasesTab({ projects, allStories, allEpics, allReleases }) {
  const C = useThemeColors()
  const { addRelease, updateRelease, deleteRelease, updateStory } = useProjects()
  const { sprints } = useScrum()
  const [selProject, setSelProject] = useState(projects[0]?.id || '')
  const [showForm,   setShowForm]   = useState(false)
  const [editRel,    setEditRel]    = useState(null)
  const [form,       setForm]       = useState({ name:'', version:'1.0.0', goal:'', releaseDate:'', status:'Planned' })
  const [selRel,     setSelRel]     = useState(null)

  const projReleases = allReleases.filter(r => r.projectId === selProject)
  const projStories  = allStories.filter(s => s.projectId === selProject)

  function openNew()   { setForm({ name:'', version:'1.0.0', goal:'', releaseDate:'', status:'Planned' }); setEditRel(null); setShowForm(true) }
  function openEdit(r) { setForm({ name:r.name, version:r.version, goal:r.goal, releaseDate:r.releaseDate||'', status:r.status }); setEditRel(r); setShowForm(true) }

  async function saveRel() {
    if (!form.name.trim()) return
    if (editRel) await updateRelease(editRel.id, { ...form })
    else         await addRelease(selProject, { ...form })
    setShowForm(false)
  }

  const inp = { width:'100%', padding:'9px 12px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:13, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit', boxSizing:'border-box' }
  const stC = { Planned:{ color:C.textSecondary, bg:C.border }, 'In Progress':{ color:C.primary, bg:C.primary+'15' }, Released:{ color:C.success, bg:C.success+'15' }, Cancelled:{ color:C.danger, bg:C.danger+'15' } }

  return (
    <>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:18 }}>
        <select value={selProject} onChange={e=>setSelProject(e.target.value)} style={{ padding:'7px 10px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={openNew} style={{ padding:'7px 16px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginLeft:'auto' }}>+ New Release</button>
      </div>

      {projReleases.length === 0 && (
        <Card C={C} style={{ textAlign:'center', padding:'40px' }}>
          <p style={{ margin:'0 0 4px', fontSize:15, fontWeight:600, color:C.textPrimary }}>No releases yet</p>
          <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>Releases group sprints and stories into shippable versions.</p>
        </Card>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:14 }}>
        {projReleases.map(rel => {
          const stories   = projStories.filter(s => s.releaseId === rel.id)
          const done      = stories.filter(s => s.status === 'Done').length
          const totalSP   = stories.reduce((a,s)=>a+(s.storyPoints||0),0)
          const doneSP    = stories.filter(s=>s.status==='Done').reduce((a,s)=>a+(s.storyPoints||0),0)
          const pct       = stories.length > 0 ? Math.round(done/stories.length*100) : 0
          const sc        = stC[rel.status] || stC.Planned
          const relSprints = sprints.filter(sp => sp.releaseId === rel.id)
          return (
            <Card key={rel.id} C={C}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.textPrimary }}>{rel.name}</div>
                  <div style={{ fontSize:11, color:C.textSecondary }}>{rel.version}{rel.releaseDate?` · ${rel.releaseDate}`:''}</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={()=>openEdit(rel)} style={{ padding:'3px 9px', background:C.primary+'15', color:C.primary, border:`1px solid ${C.primary}30`, borderRadius:5, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Edit</button>
                  <button onClick={()=>deleteRelease(rel.id)} style={{ padding:'3px 8px', background:C.danger+'10', color:C.danger, border:`1px solid ${C.danger}25`, borderRadius:5, fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
                </div>
              </div>
              {rel.goal && <p style={{ margin:'0 0 10px', fontSize:12, color:C.primary, fontWeight:500 }}>Goal: {rel.goal}</p>}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                <Badge label={rel.status} color={sc.color} bg={sc.bg} />
                <span style={{ fontSize:11, color:C.textSecondary }}>{stories.length} stories · {totalSP} SP</span>
                {relSprints.length > 0 && <span style={{ fontSize:11, color:C.primary }}>{relSprints.length} sprint{relSprints.length!==1?'s':''}</span>}
              </div>
              {/* Burnup */}
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.textSecondary, marginBottom:3 }}>
                  <span>Story Completion</span>
                  <span style={{ fontWeight:600, color:pct===100?C.success:C.textPrimary }}>{pct}%</span>
                </div>
                <div style={{ height:6, background:C.border, borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:pct===100?C.success:C.primary, borderRadius:3, transition:'width .4s' }} />
                </div>
                <div style={{ fontSize:11, color:C.textSecondary, marginTop:3 }}>{doneSP}/{totalSP} story points</div>
              </div>
              {/* Story list */}
              {stories.length > 0 && (
                <div style={{ background:C.mainBg, borderRadius:7, padding:'8px 10px' }}>
                  {stories.slice(0,3).map(s => (
                    <div key={s.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'3px 0', borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ fontSize:12, color:C.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{s.name}</span>
                      <Badge label={s.status} color={s.status==='Done'?C.success:s.status==='In Progress'?C.primary:C.textSecondary} bg={s.status==='Done'?C.success+'15':s.status==='In Progress'?C.primary+'15':C.border} />
                    </div>
                  ))}
                  {stories.length > 3 && <div style={{ fontSize:11, color:C.textSecondary, paddingTop:4 }}>+{stories.length-3} more stories</div>}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {showForm && (
        <Modal title={editRel ? 'Edit Release' : 'Create Release'} onClose={()=>setShowForm(false)} width={480} C={C}>
          {[{l:'Release Name',k:'name',t:'text',ph:'e.g. Beta Launch'},{l:'Version',k:'version',t:'text',ph:'1.0.0'},{l:'Release Date',k:'releaseDate',t:'date',ph:''},{l:'Goal',k:'goal',t:'text',ph:'What does this release achieve?'}].map(f=>(
            <div key={f.k} style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>{f.l}</label>
              <input type={f.t} style={inp} placeholder={f.ph} value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} />
            </div>
          ))}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textPrimary, marginBottom:5 }}>Status</label>
            <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={inp}>{RELEASE_STATUSES.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <button onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, cursor:'pointer', color:C.textSecondary, fontFamily:'inherit' }}>Cancel</button>
            <button onClick={saveRel} style={{ padding:'8px 18px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{editRel?'Save':'Create'}</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── TRACEABILITY TAB ──────────────────────────────────────────────────────────
function TraceabilityTab({ projects, allStories, allEpics, allReleases, allRisks }) {
  const C = useThemeColors()
  const { sprints } = useScrum()
  const [selProject, setSelProject] = useState('all')
  const [expanded,   setExpanded]   = useState({})

  const assignedToSprint = useMemo(() => {
    const map = {}
    sprints.forEach(sp => (sp.taskIds||[]).forEach(tid => { map[tid] = sp }))
    return map
  }, [sprints])

  const filteredProjects = selProject === 'all' ? projects : projects.filter(p => p.id === selProject)

  function toggle(key) { setExpanded(p => ({ ...p, [key]: !p[key] })) }

  const stC = (s) => s==='Done'?{color:C.success,bg:C.success+'15'}:s==='In Progress'?{color:C.primary,bg:C.primary+'15'}:{color:C.textSecondary,bg:C.border}

  return (
    <>
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:18 }}>
        <select value={selProject} onChange={e=>setSelProject(e.target.value)} style={{ padding:'7px 10px', border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:12, outline:'none', background:C.cardBg, color:C.textPrimary, fontFamily:'inherit' }}>
          <option value="all">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <span style={{ fontSize:12, color:C.textSecondary }}>{filteredProjects.flatMap(p=>p.features||[]).length} stories · {filteredProjects.flatMap(p=>p.tasks||[]).length} tasks</span>
      </div>

      {filteredProjects.map(proj => {
        const projEpics   = allEpics.filter(e => e.projectId === proj.id)
        const projStories = allStories.filter(s => s.projectId === proj.id)
        const noEpic      = projStories.filter(s => !s.epicId)
        const epicGroups  = projEpics.map(ep => ({ epic: ep, stories: projStories.filter(s => s.epicId === ep.id) }))
        const groups      = [...epicGroups.filter(g=>g.stories.length>0), ...(noEpic.length > 0 ? [{ epic: null, stories: noEpic }] : [])]

        return (
          <Card key={proj.id} C={C} style={{ marginBottom:14 }}>
            <div onClick={()=>toggle(`proj_${proj.id}`)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', marginBottom:expanded[`proj_${proj.id}`]?14:0 }}>
              <span style={{ fontSize:15, fontWeight:700, color:C.textPrimary }}>◈ {proj.name}</span>
              <span style={{ fontSize:11, color:C.textSecondary }}>{projStories.length} stories · {(proj.tasks||[]).length} tasks</span>
              <span style={{ marginLeft:'auto', fontSize:12, color:C.textSecondary }}>{expanded[`proj_${proj.id}`]?'▲':'▼'}</span>
            </div>

            {expanded[`proj_${proj.id}`] && groups.map(({ epic, stories }) => (
              <div key={epic?.id||'none'} style={{ marginBottom:12 }}>
                {/* Epic row */}
                <div onClick={()=>toggle(`ep_${epic?.id||'none'}_${proj.id}`)} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:C.mainBg, borderRadius:7, cursor:'pointer', marginBottom:4 }}>
                  {epic ? (
                    <>
                      <div style={{ width:10, height:10, borderRadius:2, background:epic.color, flexShrink:0 }} />
                      <span style={{ fontSize:13, fontWeight:700, color:C.textPrimary }}>{epic.name}</span>
                      <Badge label={epic.status} color={stC(epic.status).color} bg={stC(epic.status).bg} />
                    </>
                  ) : (
                    <span style={{ fontSize:13, fontWeight:600, color:C.textSecondary }}>— No epic</span>
                  )}
                  <span style={{ fontSize:11, color:C.textSecondary, marginLeft:'auto' }}>{stories.length} stories · {expanded[`ep_${epic?.id||'none'}_${proj.id}`]?'▲':'▼'}</span>
                </div>

                {expanded[`ep_${epic?.id||'none'}_${proj.id}`] && stories.map(story => {
                  const storyTasks  = (proj.tasks||[]).filter(t => t.storyId === story.id || t.feature === story.name)
                  const linkedRisks = allRisks.filter(r => (story.riskIds||[]).includes(r.id))
                  const sprintInfo  = assignedToSprint[story.id]
                  const release     = allReleases.find(r => r.id === story.releaseId)
                  const sc          = stC(story.status)
                  return (
                    <div key={story.id} style={{ marginLeft:20, marginBottom:8, border:`1px solid ${C.border}`, borderRadius:8, overflow:'hidden' }}>
                      <div onClick={()=>toggle(`st_${story.id}`)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:C.cardBg, cursor:'pointer' }}>
                        <span style={{ fontSize:18, color:C.textSecondary }}>◻</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{story.name}</div>
                          {story.storyFormat && <div style={{ fontSize:11, color:C.textSecondary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{story.storyFormat}</div>}
                        </div>
                        <SpBadge pts={story.storyPoints} C={C} />
                        <Badge label={story.status} color={sc.color} bg={sc.bg} />
                        <DorBadge story={story} epics={allEpics} C={C} />
                        {sprintInfo && <span style={{ fontSize:11, color:C.primary, fontWeight:600, whiteSpace:'nowrap' }}>{sprintInfo.name}</span>}
                        {release && <span style={{ fontSize:11, color:C.success, fontWeight:600 }}>{release.name}</span>}
                        <span style={{ fontSize:11, color:C.textSecondary }}>{expanded[`st_${story.id}`]?'▲':'▼'}</span>
                      </div>

                      {expanded[`st_${story.id}`] && (
                        <div style={{ padding:'10px 14px', background:C.mainBg, borderTop:`1px solid ${C.border}` }}>
                          {/* Acceptance Criteria */}
                          {(story.acceptanceCriteria||[]).length > 0 && (
                            <div style={{ marginBottom:8 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:C.textSecondary, letterSpacing:.5, textTransform:'uppercase', marginBottom:5 }}>Acceptance Criteria</div>
                              {story.acceptanceCriteria.map(ac => (
                                <div key={ac.id} style={{ display:'flex', alignItems:'flex-start', gap:6, fontSize:12, color:C.textPrimary, padding:'2px 0' }}>
                                  <span style={{ color:C.success }}>✓</span>{ac.text}
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Tasks */}
                          {storyTasks.length > 0 && (
                            <div style={{ marginBottom:8 }}>
                              <div style={{ fontSize:11, fontWeight:700, color:C.textSecondary, letterSpacing:.5, textTransform:'uppercase', marginBottom:5 }}>Tasks ({storyTasks.length})</div>
                              {storyTasks.map(t => {
                                const tc = stC(t.status)
                                return (
                                  <div key={t.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 8px', background:C.cardBg, borderRadius:5, marginBottom:4 }}>
                                    <span style={{ fontSize:12, color:C.textPrimary, flex:1 }}>{t.name}</span>
                                    {t.assignee && <span style={{ fontSize:11, color:C.textSecondary }}>{t.assignee}</span>}
                                    <Badge label={t.status} color={tc.color} bg={tc.bg} />
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          {/* Linked risks */}
                          {linkedRisks.length > 0 && (
                            <div>
                              <div style={{ fontSize:11, fontWeight:700, color:C.textSecondary, letterSpacing:.5, textTransform:'uppercase', marginBottom:5 }}>Linked Risks</div>
                              {linkedRisks.map(r => (
                                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 8px', background:C.danger+'08', borderRadius:5, marginBottom:4, borderLeft:`3px solid ${C.danger}` }}>
                                  <span style={{ fontSize:12, color:C.textPrimary, flex:1 }}>{r.description}</span>
                                  <Badge label={r.priority} color={pColor(r.priority,C)} bg={pColor(r.priority,C)+'18'} />
                                  <Badge label={r.status} color={r.status==='Open'?C.danger:C.warning} bg={r.status==='Open'?C.danger+'12':C.warning+'15'} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </Card>
        )
      })}
    </>
  )
}

// ── PERT / DEPENDENCIES TAB ──────────────────────────────────────────────────
function DependenciesTab({ projects, allStories }) {
  const C = useThemeColors()
  const { updateTask, chainTaskDependencies } = useProjects()
  const [selProjectId, setSelProjectId] = useState(projects[0]?.id || '')
  const [selStoryId,   setSelStoryId]   = useState('')
  const [editTask,     setEditTask]     = useState(null)
  const [depInput,     setDepInput]     = useState([])
  const palette = {
    shell: '#F4F9FD',
    panel: '#FFFFFF',
    edge: '#5A88B2',
    todo: { color: '#6B88A6', bg: '#D9E7F3', stroke: '#8BA9C6' },
    progress: { color: '#1B5886', bg: '#D8EAF8', stroke: '#4C84B0' },
    done: { color: '#5F8F15', bg: '#E7F4CD', stroke: '#93B859' },
    warn: '#D99118',
  }

  const project   = projects.find(p => p.id === selProjectId)
  const allTasks  = project ? project.tasks || [] : []
  const story     = project?.features?.find(f => f.id === selStoryId)
  const storyTasks = selStoryId ? allTasks.filter(t => t.storyId === selStoryId || t.feature === story?.name) : allTasks

  function openDepEdit(task) {
    setEditTask(task)
    setDepInput(task.dependsOn || [])
  }
  async function saveDeps() {
    if (!editTask) return
    await updateTask(selProjectId, editTask.id, { dependsOn: depInput })
    setEditTask(null)
  }
  function toggleDep(taskId) {
    setDepInput(prev => prev.includes(taskId) ? prev.filter(d => d !== taskId) : [...prev, taskId])
  }

  async function chainVisibleTasks() {
    if (storyTasks.length < 2) return
    const ok = window.confirm(
      'This will chain the visible tasks in order and replace their current dependencies. Continue?'
    )
    if (!ok) return
    await chainTaskDependencies(storyTasks.map(t => t.id))
  }

  // ── PERT layout using topological sort ────────────────────────────────────
  function buildPertLayout(tasks) {
    if (!tasks.length) return { nodes:[], edges:[], width:0, height:0, startNode:null, endNode:null }

    const NODE_W = 160, NODE_H = 56, PAD_X = 200, PAD_Y = 80
    const idSet  = new Set(tasks.map(t => t.id))

    // Compute in-degree and adjacency
    const inDeg  = Object.fromEntries(tasks.map(t => [t.id, 0]))
    const adj    = Object.fromEntries(tasks.map(t => [t.id, []]))
    tasks.forEach(t => {
      (t.dependsOn || []).forEach(dep => {
        if (idSet.has(dep)) {
          adj[dep].push(t.id)
          inDeg[t.id] = (inDeg[t.id] || 0) + 1
        }
      })
    })

    // BFS to assign levels (critical path columns)
    const level  = Object.fromEntries(tasks.map(t => [t.id, 0]))
    const queue  = tasks.filter(t => inDeg[t.id] === 0).map(t => t.id)
    const visited = new Set()
    let qi = 0
    while (qi < queue.length) {
      const cur = queue[qi++]
      if (visited.has(cur)) continue
      visited.add(cur)
      adj[cur].forEach(nxt => {
        level[nxt] = Math.max(level[nxt], level[cur] + 1)
        queue.push(nxt)
      })
    }

    // Group by level
    const byLevel = {}
    tasks.forEach(t => {
      const l = level[t.id] || 0
      if (!byLevel[l]) byLevel[l] = []
      byLevel[l].push(t)
    })
    const maxLevel = Math.max(...Object.keys(byLevel).map(Number))
    const sourceIds = tasks.filter(t => inDeg[t.id] === 0).map(t => t.id)
    const sinkIds = tasks
      .filter(t => !tasks.some(other => (other.dependsOn || []).includes(t.id)))
      .map(t => t.id)

    // Position nodes
    const pos = {}
    Object.entries(byLevel).forEach(([lv, ts]) => {
      ts.forEach((t, i) => {
        pos[t.id] = {
          x: Number(lv) * PAD_X + 20,
          y: i * PAD_Y + 20,
        }
      })
    })

    const nodes = tasks.map(t => ({
      ...t,
      x: pos[t.id]?.x || 0,
      y: pos[t.id]?.y || 0,
      w: NODE_W, h: NODE_H,
    }))

    // Build edges
    const edges = []
    tasks.forEach(t => {
      (t.dependsOn || []).forEach(dep => {
        if (!idSet.has(dep)) return
        const from = pos[dep]
        const to   = pos[t.id]
        if (from && to) {
          edges.push({
            x1: from.x + NODE_W, y1: from.y + NODE_H/2,
            x2: to.x,            y2: to.y + NODE_H/2,
            fromId: dep, toId: t.id,
          })
        }
      })
    })

    const maxX = Math.max(...nodes.map(n => n.x + NODE_W), 200)
    const maxY = Math.max(...nodes.map(n => n.y + NODE_H), 120)
    const startNode = {
      x: Math.max(24, Math.min(...nodes.map(n => n.x)) - 115),
      y: Math.max(40, (maxY / 2) - 34),
      r: 34,
      label: 'START',
    }
    const endNode = {
      x: maxX + 110,
      y: Math.max(40, (maxY / 2) - 34),
      r: 34,
      label: 'END',
    }

    sourceIds.forEach((taskId) => {
      const to = pos[taskId]
      if (!to) return
      edges.unshift({
        x1: startNode.x + startNode.r,
        y1: startNode.y + startNode.r,
        x2: to.x,
        y2: to.y + NODE_H / 2,
        fromId: 'START',
        toId: taskId,
        synthetic: true,
      })
    })

    sinkIds.forEach((taskId) => {
      const from = pos[taskId]
      if (!from) return
      edges.push({
        x1: from.x + NODE_W,
        y1: from.y + NODE_H / 2,
        x2: endNode.x,
        y2: endNode.y + endNode.r,
        fromId: taskId,
        toId: 'END',
        synthetic: true,
      })
    })

    return { nodes, edges, width: endNode.x + endNode.r + 40, height: Math.max(maxY + 40, endNode.y + endNode.r * 2 + 20), startNode, endNode }
  }

  const { nodes, edges, width, height, startNode, endNode } = buildPertLayout(storyTasks)

  const stC = (st) => ({
    'Done':        palette.done,
    'In Progress': palette.progress,
    'To Do':       palette.todo,
  }[st] || palette.todo)

  return (
    <>
      {/* Filters */}
      <div style={{ display:'flex', gap:14, marginBottom:20, flexWrap:'wrap', alignItems:'end' }}>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textSecondary, marginBottom:4 }}>Project</label>
          <select value={selProjectId} onChange={e=>{setSelProjectId(e.target.value);setSelStoryId('')}}
            style={{ padding:'10px 14px', border:`1px solid #C9DDED`, borderRadius:12, fontSize:13, background:'#FFFFFF', color:C.textPrimary, fontFamily:'inherit', minWidth:220, boxShadow:'0 8px 18px rgba(8,43,74,0.05)' }}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:C.textSecondary, marginBottom:4 }}>Story (filter)</label>
          <select value={selStoryId} onChange={e=>setSelStoryId(e.target.value)}
            style={{ padding:'10px 14px', border:`1px solid #C9DDED`, borderRadius:12, fontSize:13, background:'#FFFFFF', color:C.textPrimary, fontFamily:'inherit', minWidth:280, boxShadow:'0 8px 18px rgba(8,43,74,0.05)' }}>
            <option value="">All tasks</option>
            {(project?.features||[]).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(130px, 180px))', gap:12, marginBottom:20 }}>
        {[
          { l:'Tasks', v:storyTasks.length, c:C.primary },
          { l:'With Dependencies', v:storyTasks.filter(t=>(t.dependsOn||[]).length>0).length, c:palette.warn },
          { l:'No Dependencies', v:storyTasks.filter(t=>(t.dependsOn||[]).length===0).length, c:C.success },
        ].map(m => (
          <div key={m.l} style={{ padding:'14px 16px', background:'#FFFFFF', border:`1px solid #D7E7F3`, borderRadius:14, textAlign:'center', boxShadow:'0 10px 22px rgba(8,43,74,0.05)' }}>
            <div style={{ fontSize:28, fontWeight:800, color:m.c, lineHeight:1 }}>{m.v}</div>
            <div style={{ fontSize:12, color:C.textSecondary, marginTop:4, fontWeight:600 }}>{m.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'360px minmax(0, 1fr)', gap:20, alignItems:'start', width:'100%' }}>
        {/* Task dependency list */}
        <Card C={C} style={{ borderRadius:18, border:'1px solid #D8E6F2', boxShadow:'0 16px 30px rgba(8,43,74,0.06)' }}>
          <SecTitle
            C={C}
            action={
              <button
                onClick={chainVisibleTasks}
                disabled={storyTasks.length < 2}
                style={{
                  padding:'7px 12px',
                  background: storyTasks.length < 2 ? C.border : C.primary,
                  color:'#fff',
                  border:'none',
                  borderRadius:8,
                  fontSize:11,
                  fontWeight:700,
                  cursor: storyTasks.length < 2 ? 'not-allowed' : 'pointer',
                  fontFamily:'inherit',
                  opacity: storyTasks.length < 2 ? 0.65 : 1,
                }}
              >
                Chain in order
              </button>
            }
          >
            Task Dependencies
          </SecTitle>
          {storyTasks.length === 0
            ? <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>No tasks found. {!selStoryId && 'Select a story to filter.'}</p>
            : storyTasks.map(t => {
                const deps = (t.dependsOn||[]).map(d => allTasks.find(tk=>tk.id===d)?.name||d)
                const sc   = stC(t.status)
                return (
                  <div key={t.id} style={{ padding:'14px 0', borderBottom:`1px solid #E4EEF6` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:deps.length?4:0 }}>
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:14, fontWeight:700, color:C.textPrimary, lineHeight:1.4 }}>{t.name}</span>
                        <Badge label={t.status} color={sc.color} bg={sc.bg} />
                      </div>
                      <button onClick={() => openDepEdit(t)}
                        style={{ padding:'5px 12px', background:'#E8F2FB', color:C.primary, border:`1px solid #C7DBEE`, borderRadius:10, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
                        Edit
                      </button>
                    </div>
                    {t.assignee && <div style={{ fontSize:11, color:C.textSecondary, marginTop:5, fontWeight:600 }}>Owner: {t.assignee}</div>}
                    {deps.length > 0 && (
                      <div style={{ fontSize:11, color:C.textSecondary, marginTop:8, lineHeight:1.5 }}>
                        Depends on: {deps.map((d,i) => <span key={i} style={{ background:'#FFF1D8', color:palette.warn, padding:'3px 8px', borderRadius:999, marginRight:6, marginTop:4, fontWeight:700, display:'inline-block' }}>{d}</span>)}
                      </div>
                    )}
                  </div>
                )
              })
          }
        </Card>

        {/* PERT Diagram SVG */}
        <Card C={C} style={{ overflowX:'auto', width:'100%', minHeight:430, borderRadius:18, border:'1px solid #D8E6F2', boxShadow:'0 18px 32px rgba(8,43,74,0.06)', background:'linear-gradient(180deg, #FFFFFF 0%, #F7FBFE 100%)' }}>
          <SecTitle C={C}>PERT Network Diagram</SecTitle>
          {storyTasks.length === 0
            ? <p style={{ margin:0, fontSize:13, color:C.textSecondary }}>No tasks to display.</p>
            : edges.length === 0 && nodes.length > 0
            ? <>
                <p style={{ margin:'0 0 14px', fontSize:12, color:C.textSecondary }}>No dependencies set.</p>
                <svg width={Math.max(width, 980)} height={Math.max(height, 360)} style={{ display:'block', minWidth:'100%' }}>
                  {startNode && (
                    <g>
                      <circle cx={startNode.x + startNode.r} cy={startNode.y + startNode.r} r={startNode.r} fill="#6C9F1E" />
                      <text x={startNode.x + startNode.r} y={startNode.y + startNode.r + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF">
                        {startNode.label}
                      </text>
                    </g>
                  )}
                  {endNode && (
                    <g>
                      <circle cx={endNode.x + endNode.r} cy={endNode.y + endNode.r} r={endNode.r} fill="#6C9F1E" />
                      <text x={endNode.x + endNode.r} y={endNode.y + endNode.r + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF">
                        {endNode.label}
                      </text>
                    </g>
                  )}
                  {nodes.map(n => {
                    const sc2 = stC(n.status)
                    return (
                      <g key={n.id}>
                        <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={12} fill={sc2.bg} stroke={sc2.color} strokeWidth={1.8}/>
                        <foreignObject x={n.x+6} y={n.y+6} width={n.w-12} height={n.h-12}>
                          <div style={{ fontSize:10, fontWeight:600, color:sc2.color, wordBreak:'break-word', lineHeight:1.3 }}>{n.name}</div>
                        </foreignObject>
                      </g>
                    )
                  })}
                </svg>
              </>
            : <svg width={Math.max(width, 1280)} height={Math.max(height, 420)} style={{ display:'block', minWidth:'100%' }}>
                <defs>
                  <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill={palette.edge}/>
                  </marker>
                </defs>
                {startNode && (
                  <g>
                    <circle cx={startNode.x + startNode.r} cy={startNode.y + startNode.r} r={startNode.r} fill="#6C9F1E" />
                    <text x={startNode.x + startNode.r} y={startNode.y + startNode.r + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF">
                      {startNode.label}
                    </text>
                  </g>
                )}
                {endNode && (
                  <g>
                    <circle cx={endNode.x + endNode.r} cy={endNode.y + endNode.r} r={endNode.r} fill="#6C9F1E" />
                    <text x={endNode.x + endNode.r} y={endNode.y + endNode.r + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF">
                      {endNode.label}
                    </text>
                  </g>
                )}
                {/* Edges */}
                {edges.map((e,i) => {
                  const mx = (e.x1 + e.x2) / 2
                  return (
                    <path key={i}
                      d={`M${e.x1},${e.y1} C${mx},${e.y1} ${mx},${e.y2} ${e.x2},${e.y2}`}
                      fill="none" stroke={palette.edge} strokeWidth={2.2} markerEnd="url(#arrow)" opacity={0.88}/>
                  )
                })}
                {/* Nodes */}
                {nodes.map(n => {
                  const sc2 = stC(n.status)
                  const hasDep = (n.dependsOn||[]).length > 0
                  return (
                    <g key={n.id}>
                      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={14} fill={sc2.bg} stroke={sc2.color} strokeWidth={hasDep?2.4:1.8}/>
                      <foreignObject x={n.x+8} y={n.y+6} width={n.w-16} height={n.h-12}>
                        <div style={{ fontSize:10, fontWeight:700, color:sc2.color, wordBreak:'break-word', lineHeight:1.35, overflow:'hidden' }}>
                          {n.name}
                          {n.assignee && <div style={{ fontWeight:600, color:sc2.color, opacity:.75, fontSize:8, marginTop:3 }}>{n.assignee}</div>}
                        </div>
                      </foreignObject>
                    </g>
                  )
                })}
              </svg>
          }
          <div style={{ display:'flex', gap:16, marginTop:14, flexWrap:'wrap' }}>
            {[
              { color:palette.todo.color, bg:palette.todo.bg,         label:'To Do'       },
              { color:palette.progress.color, bg:palette.progress.bg, label:'In Progress' },
              { color:palette.done.color, bg:palette.done.bg,         label:'Done'        },
            ].map(l => (
              <span key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.textSecondary }}>
                <span style={{ width:20, height:10, borderRadius:3, background:l.bg, border:`1.5px solid ${l.color}`, display:'inline-block' }}/>
                {l.label}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Edit dependency modal */}
      {editTask && (
        <Modal title={`Set Dependencies — ${editTask.name}`} onClose={() => setEditTask(null)} C={C} width={480}>
          <p style={{ margin:'0 0 14px', fontSize:13, color:C.textSecondary }}>Tasks that must complete before this one starts.</p>
          {allTasks.filter(t => t.id !== editTask.id).length === 0
            ? <p style={{ color:C.textSecondary, fontSize:13 }}>No other tasks in this project.</p>
            : allTasks.filter(t => t.id !== editTask.id).map(t => {
                const checked = depInput.includes(t.id)
                const sc2 = stC(t.status)
                return (
                  <label key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${C.border}`, cursor:'pointer' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleDep(t.id)} style={{ width:14, height:14, accentColor:C.primary, cursor:'pointer' }}/>
                    <span style={{ flex:1, fontSize:13, color:C.textPrimary }}>{t.name}</span>
                    <Badge label={t.status} color={sc2.color} bg={sc2.bg}/>
                  </label>
                )
              })
          }
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20 }}>
            <button onClick={() => setEditTask(null)} style={{ padding:'8px 18px', background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:8, fontSize:13, cursor:'pointer', color:C.textSecondary, fontFamily:'inherit' }}>Cancel</button>
            <button onClick={saveDeps} style={{ padding:'8px 18px', background:C.primary, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Save Dependencies</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function ProductOwnerPortal() {
  const C = useThemeColors()
  const { projects, loading } = useProjects()
  const { sprints } = useScrum()
  const [tab, setTab] = useState('backlog')

  const allStories  = useMemo(() => projects.flatMap(p => (p.features||[]).map(s => ({ ...s, projectId:p.id, projectName:p.name }))), [projects])
  const allEpics    = useMemo(() => projects.flatMap(p => (p.epics||[]).map(e => ({ ...e, projectId:p.id, projectName:p.name }))), [projects])
  const allReleases = useMemo(() => projects.flatMap(p => (p.releases||[]).map(r => ({ ...r, projectId:p.id, projectName:p.name }))), [projects])
  const allRisks    = useMemo(() => projects.flatMap(p => (p.risks||[]).map(r => ({ ...r, projectId:p.id, projectName:p.name }))), [projects])
  const activeSprint = sprints.find(s => s.status === 'active')

  const totalSP     = allStories.reduce((a,s) => a+(s.storyPoints||0), 0)
  const readyStories = allStories.filter(s => s.isReady).length
  const doneSP       = allStories.filter(s=>s.status==='Done').reduce((a,s)=>a+(s.storyPoints||0),0)
  const riskCount    = allRisks.filter(r => r.status === 'Open').length

  const TABS = [
    { id:'backlog',       label:'Product Backlog',    icon:'☰' },
    { id:'epics',         label:'Epics',              icon:'◈' },
    { id:'releases',      label:'Releases',           icon:'▶' },
    { id:'traceability',  label:'Traceability',       icon:'◎' },
    { id:'dependencies',  label:'PERT / Deps',        icon:'◬' },
  ]

  if (loading) return (
    <div style={{ padding:28, background:C.mainBg, minHeight:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:C.textSecondary, fontSize:14, margin:0 }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ padding:28, background:C.mainBg, minHeight:'100%' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700, color:C.textPrimary }}>Product Owner Portal</h1>
          <p style={{ margin:'4px 0 0', fontSize:13, color:C.textSecondary }}>
            {projects.length} project{projects.length!==1?'s':''} · {allStories.length} stories · {allEpics.length} epics
            {activeSprint ? ` · Active sprint: ${activeSprint.name}` : ''}
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {[
            { l:'Total SP',      v:totalSP,            c:C.primary  },
            { l:'Done SP',       v:doneSP,             c:C.success  },
            { l:'Ready Stories', v:readyStories,       c:C.success  },
            { l:'Open Risks',    v:riskCount,          c:riskCount>0?C.danger:C.success },
          ].map(m => (
            <div key={m.l} style={{ textAlign:'center', padding:'8px 14px', background:C.cardBg, border:`1px solid ${C.border}`, borderRadius:9 }}>
              <div style={{ fontSize:18, fontWeight:700, color:m.c, lineHeight:1.1 }}>{m.v}</div>
              <div style={{ fontSize:11, color:C.textSecondary, marginTop:2 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display:'flex', gap:2, borderBottom:`2px solid ${C.border}`, marginBottom:22 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:'10px 16px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:tab===t.id?700:400, fontFamily:'inherit', color:tab===t.id?C.primary:C.textSecondary, borderBottom:tab===t.id?`2px solid ${C.primary}`:'2px solid transparent', marginBottom:-2, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab==='backlog'       && <BacklogTab      projects={projects} allStories={allStories} allEpics={allEpics} allReleases={allReleases} allRisks={allRisks} />}
      {tab==='epics'         && <EpicsTab        projects={projects} allStories={allStories} allEpics={allEpics} />}
      {tab==='releases'      && <ReleasesTab     projects={projects} allStories={allStories} allEpics={allEpics} allReleases={allReleases} />}
      {tab==='traceability'  && <TraceabilityTab projects={projects} allStories={allStories} allEpics={allEpics} allReleases={allReleases} allRisks={allRisks} />}
      {tab==='dependencies'  && <DependenciesTab projects={projects} allStories={allStories} />}
    </div>
  )
}
