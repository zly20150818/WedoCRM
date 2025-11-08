"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Search, Pencil, Trash2, Star } from "lucide-react"
import { SupplierDialog } from "@/components/suppliers/supplier-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

/**
 * 供应商类型定义
 */
interface Supplier {
  id: string
  name: string
  country: string | null
  address: string | null
  category: string | null
  status: string
  rating: number
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * 供应商管理页面
 */
export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载供应商列表
   */
  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSuppliers(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load suppliers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  /**
   * 过滤供应商列表
   */
  const filteredSuppliers = suppliers.filter((supplier) => {
    const search = searchTerm.toLowerCase()
    return (
      supplier.name.toLowerCase().includes(search) ||
      supplier.country?.toLowerCase().includes(search) ||
      supplier.category?.toLowerCase().includes(search)
    )
  })

  /**
   * 打开新建供应商对话框
   */
  const handleCreate = () => {
    setSelectedSupplier(undefined)
    setDialogOpen(true)
  }

  /**
   * 打开编辑供应商对话框
   */
  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setDialogOpen(true)
  }

  /**
   * 删除供应商
   */
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  /**
   * 确认删除供应商
   */
  const confirmDelete = async () => {
    if (!deletingId) return

    try {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", deletingId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      })

      loadSuppliers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete supplier",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeletingId(null)
    }
  }

  /**
   * 获取状态徽章样式
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500">Active</Badge>
      case "Inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "Blacklisted":
        return <Badge variant="destructive">Blacklisted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  /**
   * 渲染评级星星
   */
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>
                Manage your supplier database and relationships
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索栏 */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, country, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* 供应商列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm ? "No suppliers found" : "No suppliers yet"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>
                      <TableCell>{supplier.country || "-"}</TableCell>
                      <TableCell>{supplier.category || "-"}</TableCell>
                      <TableCell>{renderRating(supplier.rating)}</TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(supplier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(supplier.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 供应商对话框 */}
      <SupplierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={selectedSupplier}
        onSuccess={loadSuppliers}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              supplier and all associated contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  )
}

