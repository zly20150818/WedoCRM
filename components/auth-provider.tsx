"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: {
    firstName: string
    lastName: string
    email: string
    company?: string
    password: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          await loadUserProfile(session.user)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log("Loading profile for user:", supabaseUser.id)
      
      // Fetch user profile from profiles table
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is fine for new users
        console.error("Error loading profile:", error)
      }

      console.log("Profile loaded:", profile)

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        company: profile?.company || undefined,
        role: profile?.role || "User",
      }

      console.log("Setting user data:", userData)
      setUser(userData)
      console.log("User data set successfully")
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      // 检查环境变量
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setIsLoading(false)
        return {
          success: false,
          error: "Supabase 配置未找到，请检查环境变量配置",
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        setIsLoading(false)

        // 提供更友好的错误信息
        let errorMessage = "登录失败"
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "邮箱或密码错误。如果您还没有账户，请先注册。"
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "请先验证您的邮箱。在本地开发环境中，请检查 Inbucket (http://localhost:54324) 获取验证邮件。"
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "请求过于频繁，请稍后再试"
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "无法连接到 Supabase，请确保 Supabase 服务正在运行 (supabase start)"
        } else {
          errorMessage = error.message || "登录失败，请稍后重试"
        }

        return { success: false, error: errorMessage }
      }

      if (data.user) {
        await loadUserProfile(data.user)
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: "登录失败，未获取到用户信息" }
    } catch (error: any) {
      console.error("Login error:", error)
      setIsLoading(false)
      return {
        success: false,
        error: error?.message || "登录失败，请检查网络连接和 Supabase 配置",
      }
    }
  }

  const register = async (userData: {
    firstName: string
    lastName: string
    email: string
    company?: string
    password: string
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            company: userData.company,
          },
        },
      })

      if (authError) {
        console.error("Registration error:", authError)
        setIsLoading(false)

        let errorMessage = "注册失败"
        if (authError.message.includes("User already registered")) {
          errorMessage = "该邮箱已被注册，请直接登录"
        } else if (authError.message.includes("Password")) {
          errorMessage = "密码不符合要求，请使用至少 6 位字符"
        } else if (authError.message.includes("Email")) {
          errorMessage = "邮箱格式不正确"
        } else {
          errorMessage = authError.message || "注册失败，请稍后重试"
        }

        return { success: false, error: errorMessage }
      }

      if (authData.user) {
        // Create profile in profiles table
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          company: userData.company || null,
          role: "User",
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          // User is created but profile failed
          // 尝试使用触发器自动创建 profile（如果已配置）
        }

        await loadUserProfile(authData.user)
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: "注册失败，未创建用户" }
    } catch (error: any) {
      console.error("Registration error:", error)
      setIsLoading(false)
      return {
        success: false,
        error: error?.message || "注册失败，请检查网络连接",
      }
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
