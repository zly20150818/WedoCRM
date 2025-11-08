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
  const [isLoading, setIsLoading] = useState(false) // 改为 false，不阻塞 UI
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking session...")
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (session?.user) {
          console.log("Session found, loading profile...")
          await loadUserProfile(session.user)
        } else {
          console.log("No session found")
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        if (mounted) {
          console.log("Setting isLoading to false")
          setIsLoading(false)
        }
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false
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

      // 如果 profile 不存在（PGRST116错误），尝试创建一个
      if (error && error.code === "PGRST116") {
        console.warn("Profile not found, creating one...")
        
        // 尝试创建 profile
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            first_name: supabaseUser.user_metadata?.first_name || "",
            last_name: supabaseUser.user_metadata?.last_name || "",
            role: "User",
            is_active: true,
          })
          .select()
          .single()

        if (insertError) {
          console.error("Error creating profile:", insertError)
        } else {
          console.log("Profile created successfully:", newProfile)
        }

        // 使用新创建的 profile 或从 metadata 中获取数据
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          firstName: newProfile?.first_name || supabaseUser.user_metadata?.first_name || "",
          lastName: newProfile?.last_name || supabaseUser.user_metadata?.last_name || "",
          company: newProfile?.company || undefined,
          role: newProfile?.role || "User",
        }

        console.log("Setting user data (new profile):", userData)
        setUser(userData)
        return
      }

      if (error) {
        console.error("Error loading profile:", error)
        // 即使有错误，也尝试用 auth metadata 创建用户对象
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          firstName: supabaseUser.user_metadata?.first_name || "",
          lastName: supabaseUser.user_metadata?.last_name || "",
          company: undefined,
          role: "User",
        }
        setUser(userData)
        return
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
      // 即使发生异常，也要设置基本的用户数据，避免无限加载
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        firstName: supabaseUser.user_metadata?.first_name || "",
        lastName: supabaseUser.user_metadata?.last_name || "",
        company: undefined,
        role: "User",
      }
      setUser(userData)
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
          error: "Supabase configuration not found. Please check environment variables.",
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        setIsLoading(false)

        // 提供更友好的错误信息（UI 显示用英文）
        let errorMessage = "Login failed"
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. If you don't have an account, please register first."
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email. For local development, check Inbucket at http://localhost:54324"
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many requests. Please try again later."
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Cannot connect to Supabase. Please ensure Supabase is running (supabase start)"
        } else {
          errorMessage = error.message || "Login failed. Please try again later."
        }

        return { success: false, error: errorMessage }
      }

      if (data.user) {
        await loadUserProfile(data.user)
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return { success: false, error: "Login failed. User information not retrieved." }
    } catch (error: any) {
      console.error("Login error:", error)
      setIsLoading(false)
      return {
        success: false,
        error: error?.message || "Login failed. Please check network connection and Supabase configuration.",
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

        let errorMessage = "Registration failed"
        if (authError.message.includes("User already registered")) {
          errorMessage = "This email is already registered. Please login instead."
        } else if (authError.message.includes("Password")) {
          errorMessage = "Password does not meet requirements. Please use at least 6 characters."
        } else if (authError.message.includes("Email")) {
          errorMessage = "Invalid email format"
        } else {
          errorMessage = authError.message || "Registration failed. Please try again later."
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
      return { success: false, error: "Registration failed. User not created." }
    } catch (error: any) {
      console.error("Registration error:", error)
      setIsLoading(false)
      return {
        success: false,
        error: error?.message || "Registration failed. Please check network connection.",
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
