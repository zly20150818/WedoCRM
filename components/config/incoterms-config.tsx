"use client"

/**
 * 贸易术语配置组件
 * 管理 Incoterms 基础数据
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
import { IncotermDialog } from "./incoterm-dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface Incoterm {
  id: string
  code: string
  name: string
  name_cn: string
  description: string | null
  version: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export function IncotermsConfig() {
  const [incoterms, setIncoterms] = useState<Incoterm[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIncoterm, setEditingIncoterm] = useState<Incoterm | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载贸易术语数据
   */
  const loadIncoterms = async () => {
    try {
      const { data, error } = await supabase
        .from("incoterms")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) throw error

      setIncoterms(data || [])
    } catch (error) {
      console.error("加载贸易术语数据失败:", error)
      toast({
        title: "Error",
        description: "Failed to load incoterms data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncoterms()
  }, [])

  /**
   * 打开新建对话框
   */
  const handleCreate = () => {
    setEditingIncoterm(null)
    setDialogOpen(true)
  }

  /**
   * 打开编辑对话框
   */
  const handleEdit = (incoterm: Incoterm) => {
    setEditingIncoterm(incoterm)
    setDialogOpen(true)
  }

  /**
   * 删除贸易术语
   */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this incoterm?")) {
      return
    }

    try {
      const { error } = await supabase.from("incoterms").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Incoterm deleted successfully",
      })

      loadIncoterms()
    } catch (error) {
      console.error("删除贸易术语失败:", error)
      toast({
        title: "Error",
        description: "Failed to delete incoterm",
        variant: "destructive",
      })
    }
  }

  /**
   * 对话框成功回调
   */
  const handleDialogSuccess = () => {
    setDialogOpen(false)
    setEditingIncoterm(null)
    loadIncoterms()
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total: {incoterms.length} incoterms
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Incoterm
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name (EN)</TableHead>
              <TableHead>Name (CN)</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incoterms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No incoterms found. Click "Add Incoterm" to create one.
                </TableCell>
              </TableRow>
            ) : (
              incoterms.map((incoterm) => (
                <TableRow key={incoterm.id}>
                  <TableCell className="font-mono font-bold">
                    {incoterm.code}
                  </TableCell>
                  <TableCell className="font-medium">{incoterm.name}</TableCell>
                  <TableCell>{incoterm.name_cn}</TableCell>
                  <TableCell>{incoterm.version}</TableCell>
                  <TableCell>
                    <Badge variant={incoterm.is_active ? "default" : "secondary"}>
                      {incoterm.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(incoterm)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(incoterm.id)}
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

      <IncotermDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        incoterm={editingIncoterm}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

