import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useThemeColors } from '../context/ThemeContext'

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

function genTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let p = 'Tmp@'
  for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)]
  return p
}

const ROLE_LABELS = { pm: 'Project Manager', sm: 'Scrum Master', team_member: 'Team Member', developer: 'Developer', admin: 'Admin' }

export default function Settings() {
  const C = useThemeColors()
  const { profile, adminCreateUser, listUsers } = useAuth()
  const [tab, setTab] = useState('Profile')
  const [profileForm, setProfileForm] = useState({ name: profile?.full_name || '', email: profile?.email || '' })

  useEffect(() => {
    if (profile) setProfileForm({ name: profile.full_name || '', email: profile.email || '' })
  }, [profile])

  const [saved, setSaved] = useState(false)

  // Team management — real users from DB
  const [team,        setTeam]        = useState([])
  const [teamLoading, setTeamLoading] = useState(false)

  // Invite form
  const [inviteName,   setInviteName]   = useState('')
  const [inviteEmail,  setInviteEmail]  = useState('')
  const [inviteRole,   setInviteRole]   = useState('team_member')
  const [inviting,     setInviting]     = useState(false)
  const [inviteResult, setInviteResult] = useState(null)

  const [notifPrefs, setNotifPrefs] = useState({ deadlines: true, risks: true, estimations: true, tasks: true, comments: false })

  const isPM = profile?.role === 'pm'

  // Load real team members from profiles table when PM opens Team Management
  useEffect(() => {
    if (isPM && tab === 'Team Management') {
      setTeamLoading(true)
      listUsers()
        .then(users => setTeam(users.filter(u => u.id !== profile?.id)))
        .catch(() => setTeam([]))
        .finally(() => setTeamLoading(false))
    }
  }, [isPM, tab])

  async function inviteMember() {
    if (!inviteName.trim() || !inviteEmail.trim()) return
    setInviting(true)
    setInviteResult(null)
    const tempPassword = genTempPassword()
    try {
      await adminCreateUser(inviteEmail.trim(), tempPassword, inviteRole, inviteName.trim())
      setInviteResult({ success: true, tempPassword, name: inviteName.trim(), email: inviteEmail.trim() })
      setInviteName('')
      setInviteEmail('')
      setInviteRole('team_member')
      const users = await listUsers()
      setTeam(users.filter(u => u.id !== profile?.id))
    } catch (err) {
      setInviteResult({ success: false, message: err.message || 'Failed to create user. Email may already be in use.' })
    } finally {
      setInviting(false)
    }
  }

  function saveProfile() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = ['Profile', ...(isPM ? ['Team Management'] : []), 'Notifications']
  const inp = { width: '100%', padding: '9px 12px', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', color: C.textPrimary, background: C.cardBg, fontFamily: 'inherit' }
  const card = { background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }

  return (
    <div style={{ padding: 28, background: C.mainBg, minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textPrimary }}>Settings</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: C.textSecondary }}>Manage your profile, team, and notifications</p>
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
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{ROLE_LABELS[profile?.role] || 'Team Member'}</div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Full Name</label>
              <input style={inp} value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Email Address</label>
              <input style={{ ...inp, background: C.mainBg, color: C.textSecondary }} value={profileForm.email} readOnly />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Role</label>
              <input style={{ ...inp, background: C.mainBg, color: C.textSecondary }} value={ROLE_LABELS[profile?.role] || 'Team Member'} readOnly />
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

      {/* Team Management tab — PM only */}
      {tab === 'Team Management' && (
        <div style={{ maxWidth: 720 }}>
          {!isPM ? (
            <div style={{ ...card, textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🔒</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>Access Restricted</div>
              <div style={{ fontSize: 13, color: C.textSecondary }}>Team management is available to Project Managers only.</div>
            </div>
          ) : (
            <>
              {/* Create account form */}
              <div style={{ ...card, marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Add Team Member</h3>
                <p style={{ margin: '0 0 16px', fontSize: 12, color: C.textSecondary }}>Creates a real login account. A temporary password will be displayed once — share it with the new member so they can sign in.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Full Name *</label>
                    <input style={inp} value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Ali Hassan" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Email Address *</label>
                    <input style={inp} type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="ali@example.com" />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 5 }}>Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                    style={{ ...inp, width: '50%' }}>
                    <option value="team_member">Team Member</option>
                    <option value="developer">Developer</option>
                    <option value="sm">Scrum Master</option>
                    <option value="pm">Project Manager</option>
                  </select>
                </div>
                <button onClick={inviteMember} disabled={inviting || !inviteName.trim() || !inviteEmail.trim()}
                  style={{ padding: '9px 22px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: inviting ? 'default' : 'pointer', fontFamily: 'inherit', opacity: (inviting || !inviteName.trim() || !inviteEmail.trim()) ? 0.6 : 1 }}>
                  {inviting ? 'Creating…' : 'Create Account'}
                </button>

                {inviteResult && (
                  <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 9, border: `1px solid ${inviteResult.success ? C.success + '40' : C.danger + '40'}`, background: inviteResult.success ? C.success + '08' : C.danger + '08' }}>
                    {inviteResult.success ? (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.success, marginBottom: 6 }}>✓ Account created for {inviteResult.name}</div>
                        <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 4 }}>Temporary password (shown only once):</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: C.primary, background: C.primary + '12', padding: '6px 14px', borderRadius: 6, display: 'inline-block', letterSpacing: 1, marginBottom: 8 }}>{inviteResult.tempPassword}</div>
                        <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8 }}>Tell {inviteResult.name} to log in with <strong>{inviteResult.email}</strong> and this password, then change it in Settings.</div>
                        <button onClick={() => setInviteResult(null)} style={{ fontSize: 12, color: C.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Dismiss</button>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.danger, marginBottom: 4 }}>Failed to create account</div>
                        <div style={{ fontSize: 12, color: C.textSecondary }}>{inviteResult.message}</div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Team list */}
              <div style={card}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>
                  All Users {teamLoading ? '' : `(${team.length})`}
                </h3>
                {teamLoading ? (
                  <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>Loading…</p>
                ) : team.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: C.textSecondary }}>No other users yet. Create one above.</p>
                ) : team.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {(m.full_name || m.email || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{m.full_name || '(no name)'}</div>
                      <div style={{ fontSize: 11, color: C.textSecondary }}>{m.email}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.primary, background: C.primary + '15', padding: '3px 10px', borderRadius: 10 }}>
                      {ROLE_LABELS[m.role] || m.role}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'Notifications' && (
        <div style={{ maxWidth: 500 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Notification Preferences</h3>
            {[
              { key: 'deadlines',   label: 'Deadline Reminders',  desc: 'Get notified when project deadlines are approaching' },
              { key: 'risks',       label: 'Risk Alerts',         desc: 'Get notified when new high-priority risks are added' },
              { key: 'estimations', label: 'Estimation Updates',  desc: 'Get notified when new estimation runs are saved' },
              { key: 'tasks',       label: 'Task Assignments',    desc: 'Get notified when tasks are assigned to you' },
              { key: 'comments',    label: 'Comment Mentions',    desc: 'Get notified when you are @mentioned in a comment' },
            ].map(n => (
              <Toggle key={n.key} on={notifPrefs[n.key]} onToggle={() => setNotifPrefs(p => ({ ...p, [n.key]: !p[n.key] }))} label={n.label} desc={n.desc} />
            ))}
            <button onClick={() => alert('Preferences saved!')} style={{ marginTop: 16, padding: '9px 20px', background: C.primary, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
