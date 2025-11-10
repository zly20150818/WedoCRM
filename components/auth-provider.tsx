"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile, RegisterData } from "@/lib/types/user"
import { mapSupabaseUserToProfile } from "@/lib/types/user"

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    setUser(authUser ? mapSupabaseUserToProfile(authUser) : null)
  }

  useEffect(() => {
    // 检查初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapSupabaseUserToProfile(session.user) : null)
      setIsLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUserToProfile(session.user) : null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      setUser(data.user ? mapSupabaseUserToProfile(data.user) : null)
      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            company: userData.company,
            role: 'User', // 新用户默认角色（第一个用户会被触发器自动设为 Admin）
            is_active: true,
          },
        },
      })

      if (error) throw error
      
      setUser(data.user ? mapSupabaseUserToProfile(data.user) : null)
      return { success: true }
    } catch (error: any) {
      console.error("Registration error:", error)
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const metadata: Record<string, any> = {}
      
      if (updates.firstName !== undefined) metadata.first_name = updates.firstName
      if (updates.lastName !== undefined) metadata.last_name = updates.lastName
      if (updates.company !== undefined) metadata.company = updates.company
      if (updates.avatar !== undefined) metadata.avatar = updates.avatar
      // 注意：role 和 isActive 通常由管理员通过 API Route 更新

      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      })

      if (error) throw error
      
      setUser(data.user ? mapSupabaseUserToProfile(data.user) : null)
      return { success: true }
    } catch (error: any) {
      console.error("Update profile error:", error)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
