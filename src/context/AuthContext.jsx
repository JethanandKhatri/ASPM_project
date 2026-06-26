import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseAdmin } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    const fallbackProfile = {
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      role: authUser.user_metadata?.role || 'developer',
    }

    setProfile(data ? { ...fallbackProfile, ...data } : fallbackProfile)
    setLoading(false)
  }

  async function adminCreateUser(email, password, role, fullName) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    })
    if (error) throw error

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role,
    })
    if (profileError) throw profileError
    return data.user
  }

  async function listUsers() {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').order('full_name')
    if (error) throw error
    return data || []
  }

  async function adminDeleteUser(userId) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) throw error
    await supabaseAdmin.from('profiles').delete().eq('id', userId)
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, adminCreateUser, listUsers, adminDeleteUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
