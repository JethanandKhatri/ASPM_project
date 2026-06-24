import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const C = { primary: '#3B5998', mainBg: '#F4F6FB', cardBg: '#FFFFFF', border: '#E0E4ED', textPrimary: '#1A1A2E', textSecondary: '#6B7280', danger: '#E24B4A', success: '#639922' }

const SAMPLE_TEAM = [
  { id: 'u1', name: 'Bilal Ahmed', email: 'bilal@example.com', role: 'team_member' },
  { id: 'u2', name: 'Muquaddas Fatima', email: 'muquaddas@example.com', role: 'team_member' },
  { id: 'u3', name: 'Sara Khan', email: 'sara@example.com', role: 'team_member' },
  { id: 'u4', name: 'Usman Ali', email: 'usman@example.com', role: 'team_member' },
  { id: 'u5', name: 'Ahmed Raza', email: 'ahmed@example.com', role: 'team_member' },
]

export default function Settings() {
  const { profile } = useAuth()
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

  const tabs = ['Profile', 'Team Management', 'Notifications']
  const inp = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: C.textPrimary }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Settings</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Manage your profile, team, and notification preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `2px solid ${C.border}`, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t ? 600 : 400, color: tab === t ? C.primary : C.textSecondary, borderBottom: tab === t ? `2px solid ${C.primary}` : '2px solid transparent', marginBottom: -2 }}>
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'Profile' && (
        <div style={{ maxWidth: 540 }}>
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
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
              <button onClick={saveProfile} style={{ padding: '9px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
              {saved && <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Saved!</span>}
            </div>
          </div>

          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Change Password</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Current Password</label>
              <input style={inp} type="password" placeholder="••••••••" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>New Password</label>
              <input style={inp} type="password" placeholder="Min 8 characters" />
            </div>
            <button style={{ padding: '9px 20px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', color: C.textSecondary }}>Update Password</button>
          </div>
        </div>
      )}

      {/* Team Management tab */}
      {tab === 'Team Management' && (
        <div style={{ maxWidth: 680 }}>
          {profile?.role !== 'pm' && (
            <div style={{ background: '#fffbeb', border: `1px solid #fef08a`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#92400e' }}>
              Team management is available to Project Managers only.
            </div>
          )}
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Invite Team Member</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input style={{ ...inp, flex: 1 }} type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@example.com" />
              <button onClick={inviteMember} disabled={profile?.role !== 'pm'}
                style={{ padding: '9px 18px', background: profile?.role !== 'pm' ? '#d1d5db' : C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Send Invite
              </button>
            </div>
          </div>
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
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
                  style={{ padding: '5px 8px', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, outline: 'none' }}>
                  <option value="pm">Project Manager</option>
                  <option value="team_member">Team Member</option>
                </select>
                <button onClick={() => removeMember(m.id)} disabled={profile?.role !== 'pm'}
                  style={{ padding: '5px 10px', background: '#fef2f2', color: C.danger, border: `1px solid ${C.danger}30`, borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
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
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Notification Preferences</h3>
            {[
              { key: 'deadlines', label: 'Deadline Reminders', desc: 'Get notified when project deadlines are approaching' },
              { key: 'risks', label: 'Risk Alerts', desc: 'Get notified when new high-priority risks are added' },
              { key: 'estimations', label: 'Estimation Updates', desc: 'Get notified when new estimation runs are saved' },
              { key: 'tasks', label: 'Task Assignments', desc: 'Get notified when tasks are assigned to you' },
              { key: 'comments', label: 'Comment Mentions', desc: 'Get notified when you are @mentioned in a comment' },
            ].map(n => (
              <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{n.desc}</div>
                </div>
                <div onClick={() => setNotifPrefs(p => ({ ...p, [n.key]: !p[n.key] }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: notifPrefs[n.key] ? C.primary : '#d1d5db', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: notifPrefs[n.key] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            ))}
            <button onClick={() => alert('Preferences saved!')} style={{ marginTop: 16, padding: '9px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
