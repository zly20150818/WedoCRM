"use client"

/**
 * 付款方式配置组件
 * 管理付款方式基础数据
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
import { PaymentTermDialog } from "./payment-term-dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface PaymentTerm {
  id: string
  code: string
  name: string
  name_cn: string
  type: string
  days: number | null
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export function PaymentTermsConfig() {
  const [terms, setTerms] = useState<PaymentTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载付款方式数据
   */
  const loadTerms = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_terms")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) throw error

      setTerms(data || [])
    } catch (error) {
      console.error("加载付款方式数据失败:", error)
      toast({
        title: "Error",
        description: "Failed to load payment terms data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTerms()
  }, [])

  /**
   * 打开新建对话框
   */
  const handleCreate = () => {
    setEditingTerm(null)
    setDialogOpen(true)
  }

  /**
   * 打开编辑对话框
   */
  const handleEdit = (term: PaymentTerm) => {
    setEditingTerm(term)
    setDialogOpen(true)
  }

  /**
   * 删除付款方式
   */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment term?")) {
      return
    }

    try {
      const { error } = await supabase.from("payment_terms").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Payment term deleted successfully",
      })

      loadTerms()
    } catch (error) {
      console.error("删除付款方式失败:", error)
      toast({
        title: "Error",
        description: "Failed to delete payment term",
        variant: "destructive",
      })
    }
  }

  /**
   * 对话框成功回调
   */
  const handleDialogSuccess = () => {
    setDialogOpen(false)
    setEditingTerm(null)
    loadTerms()
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total: {terms.length} payment terms
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Term
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
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {terms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No payment terms found. Click "Add Payment Term" to create one.
                </TableCell>
              </TableRow>
            ) : (
              terms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="font-mono">{term.code}</TableCell>
                  <TableCell className="font-medium">{term.name}</TableCell>
                  <TableCell>{term.name_cn}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{term.type}</Badge>
                  </TableCell>
                  <TableCell>{term.days !== null ? `${term.days} days` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={term.is_active ? "default" : "secondary"}>
                      {term.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(term)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(term.id)}
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

      <PaymentTermDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        term={editingTerm}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}

