"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

/**
 * 调试页面
 * 用于检查认证和数据库连接状态
 */
export default function DebugPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Checking...")
  const [profileData, setProfileData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    checkSupabase()
  }, [user])

  async function checkSupabase() {
    try {
      // 测试 Supabase 连接
      const { data, error } = await supabase.from("profiles").select("count").limit(1)
      
      if (error) {
        setSupabaseStatus(`Error: ${error.message}`)
      } else {
        setSupabaseStatus("Connected")
      }

      // 如果用户已登录，获取 profile
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          setProfileData({ error: profileError.message })
        } else {
          setProfileData(profile)
        }
      }
    } catch (error: any) {
      setSupabaseStatus(`Exception: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

      <div className="space-y-6">
        {/* Auth Status */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Is Loading:</span> {isLoading ? "Yes" : "No"}
            </div>
            <div>
              <span className="font-semibold">Is Authenticated:</span> {isAuthenticated ? "Yes" : "No"}
            </div>
            <div>
              <span className="font-semibold">User ID:</span> {user?.id || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {user?.email || "N/A"}
            </div>
            <div>
              <span className="font-semibold">First Name:</span> {user?.firstName || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Last Name:</span> {user?.lastName || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Role:</span> {user?.role || "N/A"}
            </div>
          </div>
        </div>

        {/* Supabase Status */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Supabase Connection</h2>
          <div>
            <span className="font-semibold">Status:</span> {supabaseStatus}
          </div>
        </div>

        {/* Profile Data */}
        {user && (
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Profile Data</h2>
            <pre className="bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>
        )}

        {/* Environment */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Environment</h2>
          <div className="space-y-2">
            <div>
              <span className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</span>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not Set"}
            </div>
            <div>
              <span className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                localStorage.clear()
                sessionStorage.clear()
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Storage & Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

