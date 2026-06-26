import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme, useThemeColors } from '../context/ThemeContext'

const SAMPLE_TEAM = [
  { id: 'u1', name: 'Bilal Ahmed', email: 'bilal@example.com', role: 'team_member' },
  { id: 'u2', name: 'Muquaddas Fatima', email: 'muquaddas@example.com', role: 'team_member' },
  { id: 'u3', name: 'Sara Khan', email: 'sara@example.com', role: 'team_member' },
  { id: 'u4', name: 'Usman Ali', email: 'usman@example.com', role: 'team_member' },
  { id: 'u5', name: 'Ahmed Raza', email: 'ahmed@example.com', role: 'team_member' },
]

function Toggle({ on, onToggle, label, desc }) {
  const C = useThemeColors()
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{desc}</div>}
      </div>
      <div onClick={onToggle}
        style={{ width: 44, height: 24, borderRadius: 12, background: on ? C.primary : C.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  )
}

export default function Settings() {
  const C = useThemeColors()
  const { profile } = useAuth()
  const { isDark, toggleDark } = useTheme()
  const [tab, setTab] = useState('Profile')
  const [profileForm, setProfileForm] = useState({ name: profile?.full_name || '', email: profile?.email || '' })

  useEffect(() => {
    if (profile) setProfileForm({ name: profile.full_name || '', email: profile.email || '' })
  }, [profile])

  const [saved, setSaved] = useState(false)
  const [team, setTeam] = useState(SAMPLE_TEAM)
  const [inviteEmail, setInviteEmail] = useState('')
  const [notifPrefs, setNotifPrefs] = useState({ deadlines: true, risks: true, estimations: true, tasks: true, comments: false })

  function saveProfile() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function inviteMember() {
    if (!inviteEmail.trim()) return
    const newMember = { id: 'u' + Date.now(), name: inviteEmail.split('@')[0], email: inviteEmail, role: 'team_member' }
    setTeam(t => [...t, newMember])
    setInviteEmail('')
  }

  function removeMember(id) {
    setTeam(t => t.filter(m => m.id !== id))
  }

  function changeRole(id, role) {
    setTeam(t => t.map(m => m.id === id ? { ...m, role } : m))
  }

  const tabs = ['Profile', 'Team Management', 'Notifications', 'Appearance']
  const inp = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: C.textPrimary, background: C.cardBg, fontFamily: 'inherit' }
  const card = { background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Settings</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Manage your profile, team, notifications, and appearance</p>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${C.border}`, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? C.primary : C.textSecondary, borderBottom: tab === t ? `2px solid ${C.primary}` : '2px solid transparent', marginBottom: -2, fontFamily: 'inherit' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'Profile' && (
        <div style={{ maxWidth: 540 }}>
          <div style={{ ...card, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Profile Information</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff' }}>
                {(profileForm.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>{profileForm.name || 'User'}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{profile?.role === 'pm' ? 'Project Manager' : 'Team Member'}</div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Full Name</label>
              <input style={inp} value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Email Address</label>
              <input style={inp} type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Role</label>
              <input style={{ ...inp, background: C.mainBg, color: C.textSecondary }} value={profile?.role === 'pm' ? 'Project Manager' : 'Team Member'} readOnly />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={saveProfile} style={{ padding: '9px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save Changes</button>
              {saved && <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Saved!</span>}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Change Password</h3>
            {['Current Password', 'New Password', 'Confirm New Password'].map((label, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>{label}</label>
                <input style={inp} type="password" placeholder="••••••••" />
              </div>
            ))}
            <button style={{ padding: '9px 20px', background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.textSecondary, fontFamily: 'inherit' }}>Update Password</button>
          </div>
        </div>
      )}

      {/* Team Management tab */}
      {tab === 'Team Management' && (
        <div style={{ maxWidth: 680 }}>
          {profile?.role !== 'pm' && (
            <div style={{ background: C.warning + '18', border: `1px solid ${C.warning}40`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: C.warning }}>
              Team management is available to Project Managers only.
            </div>
          )}
          <div style={{ ...card, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Invite Team Member</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input style={{ ...inp, flex: 1 }} type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@example.com" />
              <button onClick={inviteMember} disabled={profile?.role !== 'pm'}
                style={{ padding: '9px 18px', background: profile?.role !== 'pm' ? C.border : C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
                Send Invite
              </button>
            </div>
          </div>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Team Members ({team.length})</h3>
            {team.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {m.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>{m.email}</div>
                </div>
                <select value={m.role} onChange={e => changeRole(m.id, e.target.value)} disabled={profile?.role !== 'pm'}
                  style={{ padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: 'none', background: C.cardBg, color: C.textPrimary }}>
                  <option value="pm">Project Manager</option>
                  <option value="team_member">Team Member</option>
                </select>
                <button onClick={() => removeMember(m.id)} disabled={profile?.role !== 'pm'}
                  style={{ padding: '5px 10px', background: C.danger + '12', color: C.danger, border: `1px solid ${C.danger}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'Notifications' && (
        <div style={{ maxWidth: 500 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Notification Preferences</h3>
            {[
              { key: 'deadlines', label: 'Deadline Reminders', desc: 'Get notified when project deadlines are approaching' },
              { key: 'risks', label: 'Risk Alerts', desc: 'Get notified when new high-priority risks are added' },
              { key: 'estimations', label: 'Estimation Updates', desc: 'Get notified when new estimation runs are saved' },
              { key: 'tasks', label: 'Task Assignments', desc: 'Get notified when tasks are assigned to you' },
              { key: 'comments', label: 'Comment Mentions', desc: 'Get notified when you are @mentioned in a comment' },
            ].map(n => (
              <Toggle key={n.key} on={notifPrefs[n.key]} onToggle={() => setNotifPrefs(p => ({ ...p, [n.key]: !p[n.key] }))} label={n.label} desc={n.desc} />
            ))}
            <button onClick={() => alert('Preferences saved!')} style={{ marginTop: 16, padding: '9px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Appearance tab */}
      {tab === 'Appearance' && (
        <div style={{ maxWidth: 500 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Appearance</h3>
            <Toggle on={isDark} onToggle={toggleDark} label="Dark Mode" desc="Switches the entire app to a dark color scheme" />
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>Color Theme Preview</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { name: 'Primary', color: C.primary },
                  { name: 'Background', color: C.mainBg, border: true },
                  { name: 'Card', color: C.cardBg, border: true },
                  { name: 'Success', color: C.success },
                  { name: 'Warning', color: C.warning },
                  { name: 'Danger', color: C.danger },
                  { name: 'Text', color: C.textPrimary },
                  { name: 'Secondary', color: C.textSecondary },
                ].map(s => (
                  <div key={s.name} style={{ textAlign: 'center' }}>
                    <div style={{ width: '100%', height: 36, borderRadius: 8, background: s.color, border: s.border ? `1px solid ${C.border}` : 'none', marginBottom: 4 }} />
                    <div style={{ fontSize: 10, color: C.textSecondary }}>{s.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ ...card, marginTop: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>About</h3>
            <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}>
              <div><strong style={{ color: C.textPrimary }}>ASPM CASE Tool</strong> v1.0</div>
              <div>Agile Software Project Management — Computer-Aided Software Engineering</div>
              <div style={{ marginTop: 8 }}>Built with React + Supabase</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
