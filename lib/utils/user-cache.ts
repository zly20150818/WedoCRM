/**
 * 用户数据缓存工具
 * 使用 localStorage 缓存用户 profile 数据，减少数据库查询
 */

import { User } from "@/components/auth-provider"

const USER_CACHE_KEY = "fincrm_user_cache"
const CACHE_EXPIRY_HOURS = 24 // 缓存有效期：24小时

interface UserCache {
  user: User
  timestamp: number
  userId: string // 用于验证缓存是否匹配当前用户
}

/**
 * 保存用户数据到缓存
 */
export function saveUserToCache(user: User): void {
  try {
    const cache: UserCache = {
      user,
      timestamp: Date.now(),
      userId: user.id,
    }
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache))
    console.log("User data cached successfully")
  } catch (error) {
    console.error("Failed to cache user data:", error)
  }
}

/**
 * 从缓存获取用户数据
 * @param currentUserId 当前认证用户的 ID，用于验证缓存是否匹配
 * @returns 缓存的用户数据，如果缓存无效则返回 null
 */
export function getUserFromCache(currentUserId: string): User | null {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY)
    if (!cached) {
      console.log("No cached user data found")
      return null
    }

    const cache: UserCache = JSON.parse(cached)

    // 验证缓存是否匹配当前用户
    if (cache.userId !== currentUserId) {
      console.log("Cached user ID does not match current user, invalidating cache")
      clearUserCache()
      return null
    }

    // 检查缓存是否过期
    const expiryTime = cache.timestamp + CACHE_EXPIRY_HOURS * 60 * 60 * 1000
    if (Date.now() > expiryTime) {
      console.log("User cache expired, will refresh from database")
      clearUserCache()
      return null
    }

    console.log("Using cached user data (valid for", 
      Math.round((expiryTime - Date.now()) / 1000 / 60), "more minutes)")
    return cache.user
  } catch (error) {
    console.error("Failed to load cached user data:", error)
    clearUserCache()
    return null
  }
}

/**
 * 清除用户缓存
 */
export function clearUserCache(): void {
  try {
    localStorage.removeItem(USER_CACHE_KEY)
    console.log("User cache cleared")
  } catch (error) {
    console.error("Failed to clear user cache:", error)
  }
}

/**
 * 检查缓存是否存在且有效
 */
export function isCacheValid(currentUserId: string): boolean {
  return getUserFromCache(currentUserId) !== null
}

