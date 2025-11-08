"use client"

/**
 * 计量单位配置组件
 * 管理计量单位基础数据
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
import { UnitDialog } from "./unit-dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface Unit {
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

export function UnitsConfig() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载计量单位数据
   */
  const loadUnits = async () => {
    try {
      const { data, error } = await supabase
        .from("units_of_measurement")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) throw error

      setUnits(data || [])
    } catch (error) {
      console.error("加载计量单位数据失败:", error)
      toast({
        title: "Error",
        description: "Failed to load units data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUnits()
  }, [])

  /**
   * 打开新建对话框
   */
  const handleCreate = () => {
    setEditingUnit(null)
    setDialogOpen(true)
  }

  /**
   * 打开编辑对话框
   */
  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setDialogOpen(true)
  }

  /**
   * 删除计量单位
   */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("units_of_measurement")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Unit deleted successfully",
      })

      loadUnits()
    } catch (error) {
      console.error("删除计量单位失败:", error)
      toast({
        title: "Error",
        description: "Failed to delete unit",
        variant: "destructive",
      })
    }
  }

  /**
   * 对话框成功回调
   */
  const handleDialogSuccess = () => {
    setDialogOpen(false)
    setEditingUnit(null)
    loadUnits()
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total: {units.length} units
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
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
            {units.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No units found. Click "Add Unit" to create one.
                </TableCell>
              </TableRow>
            ) : (
              units.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-mono">{unit.code}</TableCell>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>{unit.name_cn}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{unit.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={unit.is_active ? "default" : "secondary"}>
                      {unit.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(unit)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(unit.id)}
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

      <UnitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        unit={editingUnit}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

