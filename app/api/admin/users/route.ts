import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { mapSupabaseUserToProfile } from '@/lib/types/user'

// 使用 Service Role Key 创建管理员客户端（仅服务端）
// 注意：这个 Key 拥有完全权限，绝不能暴露给客户端
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
 * GET /api/admin/users
 * 获取用户列表
 * 
 * 查询参数：
 * - role: 按角色筛选
 * - active: 按激活状态筛选 (true/false)
 * - search: 搜索关键词
 * - page: 页码（默认 1）
 * - limit: 每页数量（默认 50）
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 验证当前用户是否为管理员
    // 可以通过 request.headers.get('authorization') 获取 token
    // 然后验证用户角色
    
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const active = searchParams.get('active')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // 获取所有用户
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: limit,
    })
    
    if (error) throw error

    // 转换并筛选用户
    let users = data.users.map(user => mapSupabaseUserToProfile(user))

    // 按角色筛选
    if (role) {
      users = users.filter(u => u.role === role)
    }

    // 按激活状态筛选
    if (active !== null) {
      const isActive = active === 'true'
      users = users.filter(u => u.isActive === isActive)
    }

    // 搜索
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(u => 
        u.email.toLowerCase().includes(searchLower) ||
        u.firstName.toLowerCase().includes(searchLower) ||
        u.lastName.toLowerCase().includes(searchLower) ||
        u.company?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ 
      users,
      total: users.length,
      page,
      limit
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/users
 * 更新用户信息（管理员功能）
 * 
 * Body: { userId: string, updates: Partial<UserProfile> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, updates } = body

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'Missing userId or updates' },
        { status: 400 }
      )
    }

    // 构建 user_metadata 更新对象
    const metadata: Record<string, any> = {}
    
    if (updates.firstName !== undefined) metadata.first_name = updates.firstName
    if (updates.lastName !== undefined) metadata.last_name = updates.lastName
    if (updates.company !== undefined) metadata.company = updates.company
    if (updates.role !== undefined) metadata.role = updates.role
    if (updates.avatar !== undefined) metadata.avatar = updates.avatar
    if (updates.isActive !== undefined) metadata.is_active = updates.isActive

    // 更新用户
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { user_metadata: metadata }
    )

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      user: mapSupabaseUserToProfile(data.user) 
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users
 * 删除用户（管理员功能）
 * 
 * Body: { userId: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // 删除用户
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
