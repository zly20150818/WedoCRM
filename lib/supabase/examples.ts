/**
 * Supabase 数据库操作示例
 * 
 * 这些函数展示了如何在外贸出口管理系统中使用 Supabase 进行数据操作
 */

import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Client = Database["public"]["Tables"]["clients"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]
type Order = Database["public"]["Tables"]["orders"]["Row"]
type Logistics = Database["public"]["Tables"]["logistics"]["Row"]
type OrderAlert = Database["public"]["Tables"]["order_alerts"]["Row"]

// ==================== 客户管理 ====================

/**
 * 获取所有客户
 */
export async function getClients() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching clients:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 根据 ID 获取客户
 */
export async function getClientById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching client:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 创建新客户
 */
export async function createClient(client: Database["public"]["Tables"]["clients"]["Insert"]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...client,
      created_by: user?.id || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating client:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 更新客户信息
 */
export async function updateClient(
  id: string,
  updates: Database["public"]["Tables"]["clients"]["Update"]
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating client:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 删除客户
 */
export async function deleteClient(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    console.error("Error deleting client:", error)
    return { error }
  }

  return { error: null }
}

// ==================== 产品管理 ====================

/**
 * 获取所有产品
 */
export async function getProducts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 创建产品
 */
export async function createProduct(product: Database["public"]["Tables"]["products"]["Insert"]) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()

  if (error) {
    console.error("Error creating product:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ==================== 订单管理 ====================

/**
 * 获取所有订单
 */
export async function getOrders() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      clients (*),
      products (*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 创建订单
 */
export async function createOrder(order: Database["public"]["Tables"]["orders"]["Insert"]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...order,
      created_by: user?.id || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating order:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ==================== 物流管理 ====================

/**
 * 获取订单的物流信息
 */
export async function getLogisticsByOrderId(orderId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("logistics")
    .select("*")
    .eq("order_id", orderId)
    .single()

  if (error) {
    console.error("Error fetching logistics:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 创建物流记录
 */
export async function createLogistics(logistics: Database["public"]["Tables"]["logistics"]["Insert"]) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("logistics")
    .insert(logistics)
    .select()
    .single()

  if (error) {
    console.error("Error creating logistics:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ==================== 订单预警 ====================

/**
 * 获取所有订单预警
 */
export async function getOrderAlerts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("order_alerts")
    .select(`
      *,
      orders (*),
      clients (*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching order alerts:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * 创建订单预警
 */
export async function createOrderAlert(
  alert: Database["public"]["Tables"]["order_alerts"]["Insert"]
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("order_alerts")
    .insert(alert)
    .select()
    .single()

  if (error) {
    console.error("Error creating order alert:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ==================== 实时订阅示例 ====================

/**
 * 订阅订单数据变化（实时更新）
 */
export function subscribeToOrders(callback: (payload: any) => void) {
  const supabase = createClient()
  return supabase
    .channel("orders-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      callback
    )
    .subscribe()
}

/**
 * 订阅物流状态变化
 */
export function subscribeToLogistics(callback: (payload: any) => void) {
  const supabase = createClient()
  return supabase
    .channel("logistics-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "logistics",
      },
      callback
    )
    .subscribe()
}

/**
 * 订阅订单预警变化
 */
export function subscribeToOrderAlerts(callback: (payload: any) => void) {
  const supabase = createClient()
  return supabase
    .channel("order-alerts-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "order_alerts",
      },
      callback
    )
    .subscribe()
}

