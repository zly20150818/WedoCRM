"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProductDialog } from "@/components/products/product-dialog"
import { CategoryDialog } from "@/components/products/category-dialog"
import { Plus, Search, Pencil, Trash2, Package, FolderPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
 * 产品类型定义
 */
interface Product {
  id: string
  part_number: string
  name: string
  name_cn: string
  description: string | null
  description_cn: string | null
  unit: string
  price_with_tax: number | null
  price_without_tax: number | null
  weight: number | null
  volume: number | null
  hs_code: string | null
  tax_refund_rate: number | null
  packaging_info: string | null
  images: string
  attachments: string
  is_active: boolean
  notes: string | null
  category_id: string | null
  default_supplier_id: string | null
  project_id: string | null
  created_at: string
  updated_at: string
}

/**
 * 产品分类类型定义
 */
interface ProductCategory {
  id: string
  name: string
  name_cn: string | null
  description: string | null
  created_at: string
  updated_at: string
}

/**
 * 产品管理页面
 * 显示产品列表，支持搜索、筛选、新增、编辑和删除
 */
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)

  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载产品列表
   */
  async function loadProducts() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        })
        return
      }

      setProducts(data || [])
      setFilteredProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载产品分类
   */
  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  /**
   * 应用搜索和筛选
   */
  useEffect(() => {
    let filtered = [...products]

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.name_cn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description_cn?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter !== "all") {
      filtered = filtered.filter((product) => 
        statusFilter === "active" ? product.is_active : !product.is_active
      )
    }

    // 分类筛选
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category_id === categoryFilter)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, statusFilter, categoryFilter, products])

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  /**
   * 打开新建产品对话框
   */
  function handleCreate() {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  /**
   * 打开新建分类对话框
   */
  function handleCreateCategory() {
    setEditingCategory(null)
    setCategoryDialogOpen(true)
  }

  /**
   * 打开编辑产品对话框
   */
  function handleEdit(product: Product) {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  /**
   * 确认删除产品
   */
  function handleDeleteClick(product: Product) {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  /**
   * 执行删除产品
   */
  async function handleDeleteConfirm() {
    if (!productToDelete) return

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  /**
   * 格式化价格显示
   */
  function formatPrice(price: number | null) {
    if (price === null) return "-"
    return `¥${price.toFixed(2)}`
  }

  /**
   * 获取分类名称
   */
  function getCategoryName(categoryId: string | null) {
    if (!categoryId) return "-"
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : "-"
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题和操作按钮 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product catalog
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateCategory}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, part number, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 产品统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium text-muted-foreground">
                Total Products
              </div>
            </div>
            <div className="text-2xl font-bold mt-1">{products.length}</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground">
              Active
            </div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {products.filter((p) => p.is_active).length}
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground">
              Categories
            </div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {categories.length}
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground">
              This Month
            </div>
            <div className="text-2xl font-bold mt-1 text-purple-600">
              {
                products.filter((p) => {
                  const createdDate = new Date(p.created_at)
                  const now = new Date()
                  return (
                    createdDate.getMonth() === now.getMonth() &&
                    createdDate.getFullYear() === now.getFullYear()
                  )
                }).length
              }
            </div>
          </div>
        </div>

        {/* 产品列表表格 */}
        <div className="bg-card rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-muted-foreground">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Chinese Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price (with Tax)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.part_number}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.name_cn}</TableCell>
                    <TableCell>{getCategoryName(product.category_id)}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{formatPrice(product.price_with_tax)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={product.is_active ? "bg-green-500" : "bg-gray-500"}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* 创建/编辑产品对话框 */}
        <ProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editingProduct}
          onSuccess={loadProducts}
          categories={categories}
        />

        {/* 创建/编辑分类对话框 */}
        <CategoryDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          category={editingCategory}
          onSuccess={() => {
            loadCategories()
            loadProducts()
          }}
        />

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the product "{productToDelete?.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}

