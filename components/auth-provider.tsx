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
  const [isLoading, setIsLoading] = useState(true) // 初始为 true，检查 session
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("Checking session...")
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!mounted) return

        // 如果获取 session 时出错，清除所有状态并跳转登录
        if (sessionError) {
          console.error("Error getting session:", sessionError)
          console.warn("Session error detected, clearing and redirecting to login...")
          try {
            await supabase.auth.signOut()
          } catch (e) {
            console.error("Error during signOut:", e)
          }
          if (mounted) {
            setUser(null)
            setIsLoading(false)
          }
          window.location.href = "/login?error=session_invalid"
          return
        }

        if (session?.user) {
          console.log("Session found, loading profile...")
          await loadUserProfile(session.user)
        } else {
          console.log("No session found")
        }
      } catch (error: any) {
        console.error("Exception checking session:", error)
        // 任何异常都清除 session 并跳转登录
        console.warn("Exception in checkSession, clearing and redirecting...")
        try {
          await supabase.auth.signOut()
        } catch (e) {
          console.error("Error during signOut:", e)
        }
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
        window.location.href = "/login?error=session_error"
        return
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
      
      // 添加超时保护：5秒后如果还没有响应，就使用默认数据
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Profile query timeout")), 5000)
      )
      
      // Fetch user profile from profiles table
      const profileQuery = supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single()
      
      const { data: profile, error } = await Promise.race([
        profileQuery,
        timeout
      ]) as any

      // 如果 profile 不存在（PGRST116错误），尝试创建一个
      if (error && error.code === "PGRST116") {
        console.warn("Profile not found, attempting to create one...")
        
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
          // 如果是主键冲突（23505），说明触发器已经创建了 profile，重新查询
          if (insertError.code === '23505') {
            console.warn("Profile already exists (created by trigger), requerying...")
            const { data: existingProfile, error: reqError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", supabaseUser.id)
              .single()

            if (reqError || !existingProfile) {
              console.error("Cannot load existing profile:", reqError)
              // 这种情况很罕见，清除 session 并跳转登录
              await supabase.auth.signOut()
              setUser(null)
              window.location.href = "/login?error=profile_missing"
              return
            }

            // 使用已存在的 profile
            const userData: User = {
              id: supabaseUser.id,
              email: supabaseUser.email!,
              firstName: existingProfile.first_name || "",
              lastName: existingProfile.last_name || "",
              company: existingProfile.company || undefined,
              role: existingProfile.role || "User",
            }

            console.log("Setting user data (existing profile):", userData)
            setUser(userData)
            return
          }

          // 其他错误，清除 session
          console.error("Error creating profile:", insertError)
          console.warn("Cannot create profile, clearing session and redirecting to login...")
          await supabase.auth.signOut()
          setUser(null)
          window.location.href = "/login?error=profile_missing"
          return
        }

        console.log("Profile created successfully:", newProfile)
        
        // 使用新创建的 profile
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          firstName: newProfile.first_name || "",
          lastName: newProfile.last_name || "",
          company: newProfile.company || undefined,
          role: newProfile.role || "User",
        }

        console.log("Setting user data (new profile):", userData)
        setUser(userData)
        return
      }

      // 其他错误（网络问题、权限问题等），清除 session
      if (error) {
        console.error("Error loading profile:", error)
        console.warn("Profile query failed, clearing session and redirecting to login...")
        // 清除 session 并重定向到登录页
        await supabase.auth.signOut()
        setUser(null)
        window.location.href = "/login?error=profile_error"
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
    } catch (error: any) {
      console.error("Error loading user profile:", error)
      console.warn("Exception occurred, clearing session and redirecting to login...")
      
      // 发生异常（包括超时），清除 session 并重定向到登录页
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        console.error("Error signing out:", signOutError)
      }
      
      setUser(null)
      window.location.href = "/login?error=timeout"
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
        console.log("User created successfully, waiting for trigger to create profile...")
        
        // 等待触发器创建 profile（给触发器一点时间执行）
        // 触发器应该会自动创建 profile，所以不需要手动创建
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 加载用户 profile（如果触发器没有创建，loadUserProfile 会自动创建）
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
