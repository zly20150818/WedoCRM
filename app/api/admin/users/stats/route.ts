import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * GET /api/admin/users/stats
 * 获取用户统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 验证当前用户是否为管理员
    
    // 获取所有用户
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) throw error

    const users = data.users

    // 统计数据
    const stats = {
      total: users.length,
      active: users.filter(u => u.user_metadata?.is_active !== false).length,
      inactive: users.filter(u => u.user_metadata?.is_active === false).length,
      byRole: users.reduce((acc, user) => {
        const role = user.user_metadata?.role || 'User'
        acc[role] = (acc[role] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentRegistrations: users
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(u => ({
          id: u.id,
          email: u.email,
          createdAt: u.created_at,
          role: u.user_metadata?.role || 'User'
        }))
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
