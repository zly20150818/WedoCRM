export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          company: string | null
          role: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          company?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          company?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          country: string | null
          address: string | null
          status: string
          credit_level: string | null
          total_orders_value: number | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          country?: string | null
          address?: string | null
          status?: string
          credit_level?: string | null
          total_orders_value?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          country?: string | null
          address?: string | null
          status?: string
          credit_level?: string | null
          total_orders_value?: number | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          sku: string | null
          category: string
          description: string | null
          unit_price: number
          currency: string | null
          min_order_quantity: number | null
          stock_quantity: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sku?: string | null
          category: string
          description?: string | null
          unit_price: number
          currency?: string | null
          min_order_quantity?: number | null
          stock_quantity?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sku?: string | null
          category?: string
          description?: string | null
          unit_price?: number
          currency?: string | null
          min_order_quantity?: number | null
          stock_quantity?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          client_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          total_amount: number
          currency: string | null
          status: string
          shipping_address: string | null
          shipping_method: string | null
          expected_delivery_date: string | null
          description: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          order_number: string
          client_id?: string | null
          product_id?: string | null
          quantity: number
          unit_price: number
          total_amount: number
          currency?: string | null
          status?: string
          shipping_address?: string | null
          shipping_method?: string | null
          expected_delivery_date?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          client_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          total_amount?: number
          currency?: string | null
          status?: string
          shipping_address?: string | null
          shipping_method?: string | null
          expected_delivery_date?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      logistics: {
        Row: {
          id: string
          order_id: string | null
          tracking_number: string | null
          carrier: string | null
          shipping_method: string | null
          origin_address: string | null
          destination_address: string | null
          status: string
          shipped_date: string | null
          estimated_delivery_date: string | null
          actual_delivery_date: string | null
          shipping_cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          tracking_number?: string | null
          carrier?: string | null
          shipping_method?: string | null
          origin_address?: string | null
          destination_address?: string | null
          status?: string
          shipped_date?: string | null
          estimated_delivery_date?: string | null
          actual_delivery_date?: string | null
          shipping_cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          tracking_number?: string | null
          carrier?: string | null
          shipping_method?: string | null
          origin_address?: string | null
          destination_address?: string | null
          status?: string
          shipped_date?: string | null
          estimated_delivery_date?: string | null
          actual_delivery_date?: string | null
          shipping_cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_alerts: {
        Row: {
          id: string
          order_id: string | null
          client_id: string | null
          type: string
          severity: string
          message: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          client_id?: string | null
          type: string
          severity?: string
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          client_id?: string | null
          type?: string
          severity?: string
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
