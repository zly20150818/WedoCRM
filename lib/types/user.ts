// 用户类型定义 - 基于 auth.users 的 user_metadata
import type { User as SupabaseUser } from '@supabase/supabase-js'

/**
 * 用户资料接口
 * 数据存储在 auth.users.user_metadata 中
 */
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  role: 'User' | 'Admin' | 'Manager'
  avatar?: string
  isActive: boolean
  createdAt: string
}

/**
 * 用户 metadata 结构（存储在 auth.users.user_metadata 中）
 */
export interface UserMetadata {
  first_name: string
  last_name: string
  company?: string
  role: string
  avatar?: string
  is_active: boolean
}

/**
 * 注册数据接口
 */
export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  company?: string
  password: string
}

/**
 * 从 Supabase User 转换为 UserProfile
 */
export function mapSupabaseUserToProfile(user: SupabaseUser): UserProfile {
  const metadata = user.user_metadata || {}
  
  return {
    id: user.id,
    email: user.email!,
    firstName: metadata.first_name || '',
    lastName: metadata.last_name || '',
    company: metadata.company,
    role: metadata.role || 'User',
    avatar: metadata.avatar,
    isActive: metadata.is_active !== false, // 默认 true
    createdAt: user.created_at,
  }
}

/**
 * 从 UserProfile 更新对象转换为 user_metadata 更新对象
 */
export function mapProfileUpdatesToMetadata(updates: Partial<UserProfile>): Partial<UserMetadata> {
  const metadata: Partial<UserMetadata> = {}
  
  if (updates.firstName !== undefined) metadata.first_name = updates.firstName
  if (updates.lastName !== undefined) metadata.last_name = updates.lastName
  if (updates.company !== undefined) metadata.company = updates.company
  if (updates.role !== undefined) metadata.role = updates.role
  if (updates.avatar !== undefined) metadata.avatar = updates.avatar
  if (updates.isActive !== undefined) metadata.is_active = updates.isActive
  
  return metadata
}
