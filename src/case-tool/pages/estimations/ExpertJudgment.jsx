import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../../context/ProjectContext'
import { useThemeColors } from '../../context/ThemeContext'


function calcExpected(b, m, w) {
  return Math.round(((parseFloat(b) || 0) + 4 * (parseFloat(m) || 0) + (parseFloat(w) || 0)) / 6 * 10) / 10
}

export default function ExpertJudgment() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addEstimation } = useProjects()
  const project = getProject(id)

  const [tasks, setTasks] = useState(
    project?.features.map((f, i) => ({ id: 'et' + i, name: f.name, best: '', likely: '', worst: '', expected: 0 })) || []
  )
  const [saved, setSaved] = useState(false)

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  function updateTask(idx, field, val) {
    setTasks(prev => {
      const updated = prev.map((t, i) => i === idx ? { ...t, [field]: val } : t)
      const t = updated[idx]
      updated[idx] = { ...t, expected: calcExpected(t.best, t.likely, t.worst) }
      return updated
    })
  }

  function addTask() {
    setTasks(prev => [...prev, { id: 'et' + Date.now(), name: '', best: '', likely: '', worst: '', expected: 0 }])
  }

  function removeTask(idx) {
    setTasks(prev => prev.filter((_, i) => i !== idx))
  }

  const totalExpected = tasks.reduce((s, t) => s + t.expected, 0)
  const totalBest = tasks.reduce((s, t) => s + (parseFloat(t.best) || 0), 0)
  const totalWorst = tasks.reduce((s, t) => s + (parseFloat(t.worst) || 0), 0)
  const sd = Math.round((totalWorst - totalBest) / 6 * 10) / 10
  const effortMonths = Math.round(totalExpected / 22 * 10) / 10
  const costUSD = Math.round(effortMonths * 5000)
  const durationMonths = Math.max(1, Math.round(effortMonths / 3 * 10) / 10)

  function handleSave() {
    addEstimation(id, {
      technique: 'Expert Judgment',
      date: new Date().toISOString().split('T')[0],
      effort: `${effortMonths} staff months`,
      cost: `$${costUSD.toLocaleString()}`,
      duration: `${durationMonths} months`,
      effortNum: effortMonths, costNum: costUSD, durationNum: durationMonths,
      status: 'Saved',
      data: { tasks, totalExpected, sd },
    })
    setSaved(true)
    setTimeout(() => navigate(`/dashboard/projects/${id}`), 1200)
  }

  const inp = { width: '100%', padding: '7px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>← Back to Technique Selector</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ fontSize: 28 }}>🧠</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>Expert Judgment Estimation (PERT)</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>{project.name} — Expected = (Best + 4×Likely + Worst) / 6</p>
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
              {['Task Name', 'Best Case', 'Most Likely', 'Worst Case', 'Expected (PERT)', ''].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Task Name' ? 'left' : 'center', fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : C.mainBg }}>
                <td style={{ padding: '8px 10px' }}>
                  <input style={{ ...inp, textAlign: 'left', width: '100%' }} placeholder="Task name" value={t.name} onChange={e => updateTask(i, 'name', e.target.value)} />
                </td>
                {['best', 'likely', 'worst'].map(field => (
                  <td key={field} style={{ padding: '8px 10px', width: 100 }}>
                    <input style={inp} type="number" min={0} placeholder="0" value={t[field]} onChange={e => updateTask(i, field, e.target.value)} />
                  </td>
                ))}
                <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: C.primary, fontSize: 14 }}>{t.expected}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                  <button onClick={() => removeTask(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: 0 }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{ background: C.cardBg, border: `2px solid ${C.primary}30`, borderRadius: 10, padding: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
          {[
            { label: 'Total Best Case', value: `${totalBest.toFixed(1)} days` },
            { label: 'Total Expected', value: `${totalExpected.toFixed(1)} days`, highlight: true },
            { label: 'Total Worst Case', value: `${totalWorst.toFixed(1)} days` },
            { label: 'Std. Deviation', value: `${sd} days` },
          ].map(m => (
            <div key={m.label} style={{ background: m.highlight ? C.primary + '0d' : C.mainBg, borderRadius: 8, padding: '12px 14px', border: m.highlight ? `1px solid ${C.primary}30` : 'none' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.highlight ? C.primary : C.textPrimary }}>{m.value}</div>
              <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
          {[
            { label: 'Effort', value: `${effortMonths} staff months` },
            { label: 'Cost', value: `$${costUSD.toLocaleString()}` },
            { label: 'Duration', value: `${durationMonths} months` },
          ].map(m => (
            <div key={m.label} style={{ background: C.success + '12', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.success }}>{m.value}</div>
              <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 3 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {saved ? (
            <div style={{ padding: '10px 20px', background: C.success + '12', border: `1px solid ${C.success}30`, borderRadius: 8, fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Estimation Saved!</div>
          ) : (
            <button onClick={handleSave} style={{ padding: '10px 24px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Estimation</button>
          )}
        </div>
      </div>
    </div>
  )
}
