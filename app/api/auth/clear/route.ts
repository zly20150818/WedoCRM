import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

/**
 * 服务器端清理认证的 API 路由
 * 彻底清除所有 Supabase cookies
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient()

    // 1. 退出登录
    await supabase.auth.signOut()

    // 2. 获取所有 cookies 名称
    const allCookies = cookieStore.getAll()
    
    // 3. 删除所有 Supabase 相关的 cookies
    allCookies.forEach((cookie) => {
      if (
        cookie.name.startsWith("sb-") ||
        cookie.name.includes("supabase") ||
        cookie.name.includes("auth-token") ||
        cookie.name.includes("session")
      ) {
        cookieStore.delete(cookie.name)
      }
    })

    // 4. 强制删除常见的认证 cookie 名称
    const authCookieNames = [
      "sb-localhost-auth-token",
      "sb-127.0.0.1-auth-token",
      "sb-access-token",
      "sb-refresh-token",
    ]

    authCookieNames.forEach((name) => {
      cookieStore.delete(name)
    })

    return NextResponse.json(
      { success: true, message: "Authentication cleared successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error clearing auth:", error)
    return NextResponse.json(
      { success: false, error: "Failed to clear authentication" },
      { status: 500 }
    )
  }
}

