import { createClient } from "@/lib/supabase/client"

/**
 * 用户 Profile 类型
 */
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  company: string | null
  role: string
  avatar: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 用户服务类
 * 提供统一的用户数据操作接口
 */
export class UserService {
  private supabase = createClient()

  /**
   * 获取用户详情
   */
  async getUserById(userId: string) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return { data: null, error }
    }

    return { data: data as UserProfile, error: null }
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId: string, updates: Partial<UserProfile>) {
    // 自动更新 updated_at
    const { data, error } = await this.supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return { data: null, error }
    }

    return { data: data as UserProfile, error: null }
  }

  /**
   * 按角色查询用户列表
   */
  async getUsersByRole(role: string) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("role", role)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users by role:", error)
      return { data: null, error }
    }

    return { data: data as UserProfile[], error: null }
  }

  /**
   * 搜索用户
   * 支持按邮箱、姓名、公司搜索
   */
  async searchUsers(query: string) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .or(
        `email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,company.ilike.%${query}%`
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error searching users:", error)
      return { data: null, error }
    }

    return { data: data as UserProfile[], error: null }
  }

  /**
   * 获取所有活跃用户
   */
  async getActiveUsers() {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching active users:", error)
      return { data: null, error }
    }

    return { data: data as UserProfile[], error: null }
  }

  /**
   * 停用用户
   */
  async deactivateUser(userId: string) {
    return this.updateUser(userId, { is_active: false })
  }

  /**
   * 激活用户
   */
  async activateUser(userId: string) {
    return this.updateUser(userId, { is_active: true })
  }

  /**
   * 更新用户角色
   * 注意：需要管理员权限
   */
  async updateUserRole(userId: string, newRole: string) {
    return this.updateUser(userId, { role: newRole })
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats() {
    const { data: allUsers, error: allError } = await this.supabase
      .from("profiles")
      .select("id, role, is_active")

    if (allError) {
      console.error("Error fetching user stats:", allError)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byRole: {},
      }
    }

    const stats = {
      total: allUsers.length,
      active: allUsers.filter((u) => u.is_active).length,
      inactive: allUsers.filter((u) => !u.is_active).length,
      byRole: allUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    return stats
  }

  /**
   * 检查邮箱是否已存在
   */
  async isEmailExists(email: string) {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking email:", error)
      return { exists: false, error }
    }

    return { exists: !!data, error: null }
  }
}

// 导出单例
export const userService = new UserService()

