import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../../context/ProjectContext'
import { useThemeColors } from '../../context/ThemeContext'


export default function Decomposition() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addEstimation } = useProjects()
  const project = getProject(id)

  const [tasks, setTasks] = useState(
    project?.features.map((f, i) => ({ id: 'dt' + i, name: f.name, best: '', worst: '' })) || []
  )
  const [saved, setSaved] = useState(false)

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  function updateTask(idx, field, val) {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t))
  }

  function addTask() {
    setTasks(prev => [...prev, { id: 'dt' + Date.now(), name: '', best: '', worst: '' }])
  }

  function removeTask(idx) {
    if (tasks.length <= 1) return
    setTasks(prev => prev.filter((_, i) => i !== idx))
  }

  const validTasks = tasks.filter(t => t.best && t.worst)
  const n = validTasks.length
  const sumBest = validTasks.reduce((s, t) => s + (parseFloat(t.best) || 0), 0)
  const sumWorst = validTasks.reduce((s, t) => s + (parseFloat(t.worst) || 0), 0)
  const isComplex = n > 10

  let sd = 0
  if (n > 0) {
    if (!isComplex) {
      sd = Math.round((sumWorst - sumBest) / 6 * 10) / 10
    } else {
      const sumSqSD = validTasks.reduce((s, t) => {
        const taskSD = ((parseFloat(t.worst) - parseFloat(t.best)) / 6)
        return s + taskSD * taskSD
      }, 0)
      sd = Math.round(Math.sqrt(sumSqSD) * 10) / 10
    }
  }

  const midpoint = Math.round((sumBest + sumWorst) / 2)
  const conf50Low = Math.round(midpoint - sd / 2)
  const conf50High = Math.round(midpoint + sd / 2)
  const effortMonths = Math.round(midpoint / 22 * 10) / 10
  const costUSD = Math.round(effortMonths * 5000)

  function handleSave() {
    addEstimation(id, {
      technique: 'Decomposition + SD',
      date: new Date().toISOString().split('T')[0],
      effort: `${effortMonths} staff months`,
      cost: `$${costUSD.toLocaleString()}`,
      duration: `${Math.max(1, Math.round(effortMonths / 3 * 10) / 10)} months`,
      effortNum: effortMonths, costNum: costUSD, durationNum: Math.max(1, Math.round(effortMonths / 3 * 10) / 10),
      status: 'Saved',
      data: { tasks, sumBest, sumWorst, sd, confidence50Low: conf50Low, confidence50High: conf50High },
    })
    setSaved(true)
    setTimeout(() => navigate(`/dashboard/projects/${id}`), 1200)
  }

  const inp = { padding: '7px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box', textAlign: 'center', width: '100%' }

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>← Back to Technique Selector</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ fontSize: 28 }}>📐</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>Decomposition + Standard Deviation</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>{project.name}</p>
        </div>
      </div>

      {/* Formula info */}
      <div style={{ background: C.warning + '12', border: `1px solid ${C.warning}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: C.warning, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16 }}>ℹ</span>
        <div>
          <strong>Formula in use: </strong>
          {n <= 10
            ? `Simple SD (≤10 tasks): SD = (Sum Worst − Sum Best) / 6. Currently ${n} task(s).`
            : `Complex SD (>10 tasks): SD = √(Σ individual SD²). Currently ${n} task(s) — using complex formula.`}
        </div>
      </div>

      <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Task Estimates (days)</h3>
          <button onClick={addTask} style={{ padding: '6px 14px', background: C.primary + '15', color: C.primary, border: `1px solid ${C.primary}30`, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Task</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${C.border}` }}>
              {['Task Name', 'Best Case (days)', 'Worst Case (days)', 'Individual SD', ''].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Task Name' ? 'left' : 'center', fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, i) => {
              const indSD = t.best && t.worst ? Math.round((parseFloat(t.worst) - parseFloat(t.best)) / 6 * 10) / 10 : '-'
              return (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                  <td style={{ padding: '8px 10px' }}>
                    <input style={{ ...inp, textAlign: 'left' }} placeholder="Task name" value={t.name} onChange={e => updateTask(i, 'name', e.target.value)} />
                  </td>
                  <td style={{ padding: '8px 10px', width: 130 }}>
                    <input style={inp} type="number" min={0} placeholder="0" value={t.best} onChange={e => updateTask(i, 'best', e.target.value)} />
                  </td>
                  <td style={{ padding: '8px 10px', width: 130 }}>
                    <input style={inp} type="number" min={0} placeholder="0" value={t.worst} onChange={e => updateTask(i, 'worst', e.target.value)} />
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, color: C.warning }}>{indSD}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <button onClick={() => removeTask(i)} style={{ background: 'none', border: 'none', color: tasks.length <= 1 ? C.border : C.danger, cursor: 'pointer', fontSize: 16, padding: 0 }}>✕</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Results */}
      <div style={{ background: C.cardBg, border: `2px solid ${C.primary}30`, borderRadius: 10, padding: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Results</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
          {[
            { label: 'Sum Best Case', value: `${sumBest.toFixed(0)} days` },
            { label: 'Sum Worst Case', value: `${sumWorst.toFixed(0)} days` },
            { label: 'Std. Deviation', value: `${sd} days`, highlight: true },
            { label: '50% Conf. Range', value: `${conf50Low}–${conf50High} days` },
          ].map(m => (
            <div key={m.label} style={{ background: m.highlight ? C.warning + '15' : C.mainBg, borderRadius: 8, padding: '12px 14px', border: m.highlight ? `1px solid ${C.warning}40` : 'none' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: m.highlight ? C.warning : C.textPrimary }}>{m.value}</div>
              <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
          {[
            { label: 'Effort', value: `${effortMonths} staff months` },
            { label: 'Cost', value: `$${costUSD.toLocaleString()}` },
            { label: 'Duration', value: `${Math.max(1, Math.round(effortMonths / 3 * 10) / 10)} months` },
          ].map(m => (
            <div key={m.label} style={{ background: C.success + '12', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.success }}>{m.value}</div>
              <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {saved ? (
            <div style={{ padding: '10px 20px', background: C.success + '12', border: `1px solid ${C.success}30`, borderRadius: 8, fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Saved!</div>
          ) : (
            <button onClick={handleSave} style={{ padding: '10px 24px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Estimation</button>
          )}
        </div>
      </div>
    </div>
  )
}
