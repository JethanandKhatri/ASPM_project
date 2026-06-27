import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../../context/ProjectContext'
import { useThemeColors } from '../../context/ThemeContext'
const CATEGORIES = ['verySmall', 'small', 'medium', 'large', 'veryLarge']
const CAT_LABELS = { verySmall: 'Very Small', small: 'Small', medium: 'Medium', large: 'Large', veryLarge: 'Very Large' }
const CAT_DEFAULT = { verySmall: 100, small: 300, medium: 600, large: 1200, veryLarge: 2400 }

export default function FuzzyLogic() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addEstimation } = useProjects()
  const project = getProject(id)

  const [locPerCat, setLocPerCat] = useState({ ...CAT_DEFAULT })
  const [classifications, setClassifications] = useState(() => {
    const init = {}
    project?.features.forEach(f => { init[f.id] = 'medium' })
    return init
  })
  const [saved, setSaved] = useState(false)

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  const totalLOC = project.features.reduce((sum, f) => sum + (parseInt(locPerCat[classifications[f.id]]) || 0), 0)
  const catCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = project.features.filter(f => classifications[f.id] === cat).length
    return acc
  }, {})

  const effortMonths = Math.round(totalLOC / 1000 * 2.4)
  const costUSD = effortMonths * 5000
  const durationMonths = Math.max(1, Math.round(effortMonths / 3))

  function handleSave() {
    addEstimation(id, {
      technique: 'Fuzzy Logic',
      date: new Date().toISOString().split('T')[0],
      effort: `${effortMonths} staff months`,
      cost: `$${costUSD.toLocaleString()}`,
      duration: `${durationMonths} months`,
      effortNum: effortMonths, costNum: costUSD, durationNum: durationMonths,
      status: 'Saved',
      data: { locPerCategory: locPerCat, featureClassifications: classifications, totalLOC },
    })
    setSaved(true)
    setTimeout(() => navigate(`/dashboard/projects/${id}`), 1200)
  }

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>← Back to Technique Selector</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ fontSize: 28 }}>🔮</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>Fuzzy Logic Estimation</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>{project.name}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Left: setup + features */}
        <div>
          {/* LOC per category */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Average LOC per Size Category</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {CATEGORIES.map(cat => (
                <div key={cat} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, marginBottom: 6 }}>{CAT_LABELS[cat]}</div>
                  <input type="number" min={0} value={locPerCat[cat]}
                    onChange={e => setLocPerCat(p => ({ ...p, [cat]: e.target.value }))}
                    style={{ width: '100%', padding: '7px 8px', border: `1.5px solid ${C.border}`, borderRadius: 6, fontSize: 13, textAlign: 'center', boxSizing: 'border-box', outline: 'none' }} />
                  <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 3 }}>LOC</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature classification table */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Classify Features</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Feature', 'Priority', 'Size Category', 'Estimated LOC'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {project.features.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.cardBg : C.mainBg }}>
                    <td style={{ padding: '10px', fontWeight: 500, color: C.textPrimary }}>{f.name}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: f.priority === 'High' ? C.danger + '15' : f.priority === 'Medium' ? C.warning + '15' : C.success + '15', color: f.priority === 'High' ? C.danger : f.priority === 'Medium' ? C.warning : C.success }}>{f.priority}</span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <select value={classifications[f.id] || 'medium'} onChange={e => setClassifications(c => ({ ...c, [f.id]: e.target.value }))}
                        style={{ padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: 'none' }}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{CAT_LABELS[cat]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600, color: C.primary }}>{(locPerCat[classifications[f.id]] || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: live results panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.cardBg, border: `2px solid ${C.primary}30`, borderRadius: 10, padding: 18 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Live Estimates</h3>
            {[
              { label: 'Total LOC', value: totalLOC.toLocaleString(), unit: 'lines' },
              { label: 'Estimated Effort', value: effortMonths, unit: 'staff months' },
              { label: 'Estimated Cost', value: `$${costUSD.toLocaleString()}`, unit: '' },
              { label: 'Duration', value: durationMonths, unit: 'months' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.textSecondary }}>{m.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{m.value} <span style={{ fontSize: 11, fontWeight: 400, color: C.textSecondary }}>{m.unit}</span></span>
              </div>
            ))}
          </div>

          {/* Category distribution */}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Feature Distribution</h3>
            {CATEGORIES.map(cat => {
              const count = catCounts[cat]
              const pct = project.features.length > 0 ? (count / project.features.length) * 100 : 0
              return (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: C.textSecondary }}>{CAT_LABELS[cat]}</span>
                    <span style={{ fontWeight: 600, color: C.textPrimary }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: C.primary, borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>

          {saved ? (
            <div style={{ padding: 14, background: C.success + '12', border: `1px solid ${C.success}30`, borderRadius: 8, textAlign: 'center', fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Estimation Saved!</div>
          ) : (
            <button onClick={handleSave} style={{ padding: '12px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Save Estimation
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
