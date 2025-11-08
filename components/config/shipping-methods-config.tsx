"use client"

/**
 * 运输方式配置组件
 * 管理运输方式基础数据
 */

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShippingMethodDialog } from "./shipping-method-dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface ShippingMethod {
  id: string
  code: string
  name: string
  name_cn: string
  type: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export function ShippingMethodsConfig() {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载运输方式数据
   */
  const loadMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("shipping_methods")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) throw error

      setMethods(data || [])
    } catch (error) {
      console.error("加载运输方式数据失败:", error)
      toast({
        title: "Error",
        description: "Failed to load shipping methods data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMethods()
  }, [])

  /**
   * 打开新建对话框
   */
  const handleCreate = () => {
    setEditingMethod(null)
    setDialogOpen(true)
  }

  /**
   * 打开编辑对话框
   */
  const handleEdit = (method: ShippingMethod) => {
    setEditingMethod(method)
    setDialogOpen(true)
  }

  /**
   * 删除运输方式
   */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping method?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("shipping_methods")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Shipping method deleted successfully",
      })

      loadMethods()
    } catch (error) {
      console.error("删除运输方式失败:", error)
      toast({
        title: "Error",
        description: "Failed to delete shipping method",
        variant: "destructive",
      })
    }
  }

  /**
   * 对话框成功回调
   */
  const handleDialogSuccess = () => {
    setDialogOpen(false)
    setEditingMethod(null)
    loadMethods()
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total: {methods.length} shipping methods
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Shipping Method
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Name (CN)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No shipping methods found. Click "Add Shipping Method" to create one.
                </TableCell>
              </TableRow>
            ) : (
              methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-mono">{method.code}</TableCell>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell>{method.name_cn}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{method.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={method.is_active ? "default" : "secondary"}>
                      {method.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(method)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ShippingMethodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        method={editingMethod}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

