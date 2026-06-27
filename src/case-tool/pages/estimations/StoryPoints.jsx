import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjects } from '../../context/ProjectContext'
import { useThemeColors } from '../../context/ThemeContext'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const SP_VALUES = { XS: 1, S: 2, M: 5, L: 8, XL: 13 }

export default function StoryPoints() {
  const C = useThemeColors()
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addEstimation } = useProjects()
  const project = getProject(id)

  const [velocity, setVelocity] = useState('')
  const [totalSP, setTotalSP] = useState('')
  const [iterLen, setIterLen] = useState('2')
  const [features, setFeatures] = useState(
    project?.features.map((f, i) => ({ id: 'sf' + i, name: f.name, size: 'M', businessValue: '5', recommendation: 'Include' })) || []
  )
  const [sorted, setSorted] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!project) return <div style={{ padding: 32, textAlign: 'center', color: C.textSecondary }}>Project not found.</div>

  function updateFeature(idx, key, val) {
    setFeatures(prev => prev.map((f, i) => i === idx ? { ...f, [key]: val } : f))
  }

  function rankFeatures() {
    const ranked = [...features].map(f => {
      const sp = SP_VALUES[f.size] || 5
      const netValue = (parseFloat(f.businessValue) || 1) / sp
      const rec = netValue >= 1.5 ? 'Include' : 'Consider dropping'
      return { ...f, netValue, recommendation: rec }
    }).sort((a, b) => b.netValue - a.netValue)
    setFeatures(ranked)
    setSorted(true)
  }

  const calcedTotalSP = features.reduce((s, f) => s + (SP_VALUES[f.size] || 5), 0)
  const spToUse = parseFloat(totalSP) || calcedTotalSP
  const vel = parseFloat(velocity) || 0
  const iters = vel > 0 ? Math.ceil(spToUse / vel) : 0
  const totalWeeks = iters * (parseFloat(iterLen) || 2)
  const totalMonths = Math.round(totalWeeks / 4.3 * 10) / 10
  const costUSD = Math.round(totalMonths * 5000)

  function handleSave() {
    addEstimation(id, {
      technique: 'Story Points',
      date: new Date().toISOString().split('T')[0],
      effort: `${totalMonths} staff months`,
      cost: `$${costUSD.toLocaleString()}`,
      duration: `${totalMonths} months`,
      effortNum: totalMonths, costNum: costUSD, durationNum: totalMonths,
      status: 'Saved',
      data: { velocity: vel, totalBacklogSP: spToUse, iterationLength: iterLen, iterationsNeeded: iters, totalWeeks, features },
    })
    setSaved(true)
    setTimeout(() => navigate(`/dashboard/projects/${id}`), 1200)
  }

  const inp = { padding: '8px 10px', border: `1.5px solid ${C.border}`, borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => navigate(`/dashboard/projects/${id}/estimate`)} style={{ background: 'none', border: 'none', color: C.textSecondary, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0 }}>← Back to Technique Selector</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ fontSize: 28 }}>🃏</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.textPrimary }}>Story Points & T-Shirt Sizing</h1>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textSecondary }}>{project.name}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Story Points panel */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Story Points Calculation</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Velocity (SP per iteration)</label>
            <input type="number" style={{ ...inp, width: '100%' }} placeholder="e.g. 25" value={velocity} onChange={e => setVelocity(e.target.value)} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Total Backlog SP <span style={{ fontWeight: 400, color: C.textSecondary }}>(auto-calculated from T-Shirt: {calcedTotalSP})</span></label>
            <input type="number" style={{ ...inp, width: '100%' }} placeholder={calcedTotalSP.toString()} value={totalSP} onChange={e => setTotalSP(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Iteration Length (weeks)</label>
            <input type="number" style={{ ...inp, width: '100%' }} min={1} max={4} value={iterLen} onChange={e => setIterLen(e.target.value)} />
          </div>
          {vel > 0 && (
            <div style={{ background: C.primary + '0d', border: `1px solid ${C.primary}30`, borderRadius: 8, padding: 14 }}>
              {[
                { label: 'Total Backlog SP', value: spToUse },
                { label: 'Iterations Needed', value: iters },
                { label: 'Total Duration', value: `${totalWeeks} weeks (${totalMonths} months)`, highlight: true },
                { label: 'Estimated Cost', value: `$${costUSD.toLocaleString()}` },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span style={{ color: C.textSecondary }}>{m.label}</span>
                  <span style={{ fontWeight: 700, color: m.highlight ? C.primary : C.textPrimary }}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* T-Shirt Sizing panel */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>T-Shirt Sizing & Prioritization</h3>
            <button onClick={rankFeatures} style={{ padding: '5px 12px', background: C.primary, color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Rank by Value</button>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Feature', 'Size', 'SP', 'Value (1-10)', 'Recommendation'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: C.textSecondary, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? '#fff' : C.mainBg }}>
                    <td style={{ padding: '7px 8px', fontWeight: 500, color: C.textPrimary }}>{f.name}</td>
                    <td style={{ padding: '7px 8px' }}>
                      <select value={f.size} onChange={e => updateFeature(i, 'size', e.target.value)}
                        style={{ padding: '3px 5px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, outline: 'none' }}>
                        {SIZES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '7px 8px', fontWeight: 600, color: C.textSecondary }}>{SP_VALUES[f.size]}</td>
                    <td style={{ padding: '7px 8px', width: 70 }}>
                      <input type="number" min={1} max={10} value={f.businessValue} onChange={e => updateFeature(i, 'businessValue', e.target.value)}
                        style={{ width: '100%', padding: '3px 5px', border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, outline: 'none', boxSizing: 'border-box' }} />
                    </td>
                    <td style={{ padding: '7px 8px' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 3, background: f.recommendation === 'Include' ? C.success + '15' : C.danger + '15', color: f.recommendation === 'Include' ? C.success : C.danger }}>
                        {sorted ? f.recommendation : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: C.textSecondary }}>SP sizes: XS=1, S=2, M=5, L=8, XL=13. Total: <strong>{calcedTotalSP} SP</strong></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {saved ? (
          <div style={{ padding: '10px 20px', background: C.success + '12', border: `1px solid ${C.success}30`, borderRadius: 8, fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Estimation Saved!</div>
        ) : (
          <button onClick={handleSave} style={{ padding: '10px 24px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Estimation</button>
        )}
      </div>
    </div>
  )
}
