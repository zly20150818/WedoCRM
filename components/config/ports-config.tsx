"use client"

/**
 * 港口信息配置组件
 * 管理港口基础数据
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
import { PortDialog } from "./port-dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface Port {
  id: string
  code: string
  name: string
  name_cn: string
  country: string
  country_cn: string
  city: string | null
  type: string
  is_active: boolean
  sort_order: number
  description: string | null
  created_at: string
  updated_at: string
}

export function PortsConfig() {
  const [ports, setPorts] = useState<Port[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPort, setEditingPort] = useState<Port | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载港口数据
   */
  const loadPorts = async () => {
    try {
      const { data, error } = await supabase
        .from("ports")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) throw error

      setPorts(data || [])
    } catch (error) {
      console.error("加载港口数据失败:", error)
      toast({
        title: "Error",
        description: "Failed to load ports data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPorts()
  }, [])

  /**
   * 打开新建对话框
   */
  const handleCreate = () => {
    setEditingPort(null)
    setDialogOpen(true)
  }

  /**
   * 打开编辑对话框
   */
  const handleEdit = (port: Port) => {
    setEditingPort(port)
    setDialogOpen(true)
  }

  /**
   * 删除港口
   */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this port?")) {
      return
    }

    try {
      const { error } = await supabase.from("ports").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Port deleted successfully",
      })

      loadPorts()
    } catch (error) {
      console.error("删除港口失败:", error)
      toast({
        title: "Error",
        description: "Failed to delete port",
        variant: "destructive",
      })
    }
  }

  /**
   * 对话框成功回调
   */
  const handleDialogSuccess = () => {
    setDialogOpen(false)
    setEditingPort(null)
    loadPorts()
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total: {ports.length} ports
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Port
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Port Name</TableHead>
              <TableHead>Chinese Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No ports found. Click "Add Port" to create one.
                </TableCell>
              </TableRow>
            ) : (
              ports.map((port) => (
                <TableRow key={port.id}>
                  <TableCell className="font-mono">{port.code}</TableCell>
                  <TableCell className="font-medium">{port.name}</TableCell>
                  <TableCell>{port.name_cn}</TableCell>
                  <TableCell>
                    {port.country} ({port.country_cn})
                  </TableCell>
                  <TableCell>{port.city || "-"}</TableCell>
                  <TableCell>{port.type}</TableCell>
                  <TableCell>
                    <Badge variant={port.is_active ? "default" : "secondary"}>
                      {port.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(port)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(port.id)}
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

      <PortDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        port={editingPort}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

