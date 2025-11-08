"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

/**
 * 清理认证缓存页面
 * 用于清除浏览器中的旧 session 和 cookies
 */
export default function ClearAuthPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [isCleared, setIsCleared] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const clearAuth = async () => {
    setIsClearing(true)
    try {
      console.log("Step 1: Calling server-side clear API...")
      // 1. 调用服务器端 API 清理
      const response = await fetch("/api/auth/clear", {
        method: "POST",
      })
      
      if (response.ok) {
        console.log("✓ Server-side clear successful")
      }

      console.log("Step 2: Signing out...")
      // 2. 客户端退出登录
      await supabase.auth.signOut({ scope: "local" })
      
      console.log("Step 3: Clearing browser storage...")
      // 3. 清除 localStorage 和 sessionStorage
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
        
        // 清除所有 Supabase 相关的 localStorage 项
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("supabase") || key.includes("sb-")) {
            localStorage.removeItem(key)
          }
        })
      }
      
      console.log("Step 4: Clearing cookies...")
      // 4. 清除所有 cookies（更彻底）
      const cookies = document.cookie.split(";")
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        
        // 尝试多种方式删除 cookie
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=127.0.0.1`
      }

      console.log("✓ All clear operations completed")
      setIsCleared(true)
      
      // 5秒后自动跳转到登录页
      setTimeout(() => {
        window.location.href = "/login" // 使用 window.location 强制完全刷新
      }, 3000)
    } catch (error) {
      console.error("Error clearing auth:", error)
    } finally {
      setIsClearing(false)
    }
  }

  useEffect(() => {
    // 页面加载时自动清理
    clearAuth()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Clearing Authentication</CardTitle>
          <CardDescription>
            Cleaning up old sessions and cache...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isClearing && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Clearing authentication data...</p>
            </div>
          )}
          
          {isCleared && (
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl">✓</div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                Cleared Successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </div>
          )}

          {!isClearing && !isCleared && (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Click the button below to clear all authentication data
              </p>
              <Button onClick={clearAuth} className="w-full">
                Clear Authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

