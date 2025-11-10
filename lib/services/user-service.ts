import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/types/user"
import { mapSupabaseUserToProfile, mapProfileUpdatesToMetadata } from "@/lib/types/user"

/**
 * 用户服务类
 * 提供统一的用户数据操作接口
 * 注意：用户数据现在存储在 auth.users 的 user_metadata 中，不再使用 profiles 表
 */
export class UserService {
  private supabase = createClient()

  /**
   * 获取当前登录用户
   */
  async getCurrentUser(): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) {
        console.error("Error fetching current user:", error)
        return { data: null, error }
      }

      if (!user) {
        return { data: null, error: null }
      }

      return {
        data: mapSupabaseUserToProfile(user),
        error: null
      }
    } catch (error) {
      console.error("Error in getCurrentUser:", error)
      return { data: null, error }
    }
  }

  /**
   * 更新当前用户信息
   * 更新 auth.users 的 user_metadata
   */
  async updateCurrentUser(updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const metadata = mapProfileUpdatesToMetadata(updates)

      const { data, error } = await this.supabase.auth.updateUser({
        data: metadata
      })

      if (error) {
        console.error("Error updating user:", error)
        return { data: null, error }
      }

      return {
        data: data.user ? mapSupabaseUserToProfile(data.user) : null,
        error: null
      }
    } catch (error) {
      console.error("Error in updateCurrentUser:", error)
      return { data: null, error }
    }
  }

  /**
   * 获取用户详情（通过 ID）
   * @deprecated 客户端无法直接访问其他用户信息，请使用 API Route: /api/admin/users/:id
   */
  async getUserById(userId: string) {
    console.warn("getUserById should be called from API routes with service role key")
    return { 
      data: null, 
      error: new Error("This method should be called from server-side API routes") 
    }
  }

  /**
   * 更新用户信息（管理员功能）
   * @deprecated 请使用 API Route: /api/admin/users/:id
   */
  async updateUser(userId: string, updates: Partial<UserProfile>) {
    console.warn("updateUser should be called from API routes with service role key")
    return { 
      data: null, 
      error: new Error("This method should be called from server-side API routes") 
    }
  }

  /**
   * 按角色查询用户列表
   * @deprecated 请使用 API Route: /api/admin/users?role=xxx
   */
  async getUsersByRole(role: string) {
    console.warn("getUsersByRole should be called from API routes with service role key")
    return { 
      data: null, 
      error: new Error("This method should be called from server-side API routes") 
    }
  }

  /**
   * 搜索用户
   * @deprecated 请使用 API Route: /api/admin/users?search=xxx
   */
  async searchUsers(query: string) {
    console.warn("searchUsers should be called from API routes")
    return { 
      data: null, 
      error: new Error("This method should be called from server-side API routes") 
    }
  }

  /**
   * 获取所有活跃用户
   * @deprecated 请使用 API Route: /api/admin/users?active=true
   */
  async getActiveUsers() {
    console.warn("getActiveUsers should be called from API routes")
    return { 
      data: null, 
      error: new Error("This method should be called from server-side API routes") 
    }
  }

  /**
   * 停用用户
   * @deprecated 请使用 API Route: PATCH /api/admin/users/:id
   */
  async deactivateUser(userId: string) {
    return this.updateUser(userId, { isActive: false })
  }

  /**
   * 激活用户
   * @deprecated 请使用 API Route: PATCH /api/admin/users/:id
   */
  async activateUser(userId: string) {
    return this.updateUser(userId, { isActive: true })
  }

  /**
   * 更新用户角色
   * @deprecated 请使用 API Route: PATCH /api/admin/users/:id
   */
  async updateUserRole(userId: string, newRole: string) {
    return this.updateUser(userId, { role: newRole as any })
  }

  /**
   * 获取用户统计信息
   * @deprecated 请使用 API Route: GET /api/admin/users/stats
   */
  async getUserStats() {
    console.warn("getUserStats should be called from API routes")
    return {
      total: 0,
      active: 0,
      inactive: 0,
      byRole: {},
    }
  }

  /**
   * 检查邮箱是否已存在
   * 注意：这个功能在 Supabase Auth 中会自动处理
   */
  async isEmailExists(email: string) {
    // Supabase Auth 会在注册时自动检查邮箱是否存在
    // 这里返回一个提示信息
    console.info("Email uniqueness is handled by Supabase Auth during registration")
    return { exists: false, error: null }
  }
}

// 导出单例
export const userService = new UserService()

