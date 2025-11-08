"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProductDialog } from "@/components/products/product-dialog"
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
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  DollarSign,
  Weight,
  Box,
  FileText,
  Info,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
}

/**
 * 产品详情页面
 * 显示单个产品的详细信息
 */
export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<ProductCategory | null>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载产品详情
   */
  async function loadProduct() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        })
        return
      }

      setProduct(data)

      // 加载产品分类信息
      if (data.category_id) {
        const { data: categoryData } = await supabase
          .from("product_categories")
          .select("*")
          .eq("id", data.category_id)
          .single()

        if (categoryData) {
          setCategory(categoryData)
        }
      }
    } catch (error) {
      console.error("Error loading product:", error)
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
   * 加载产品分类列表
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
   * 初始化加载
   */
  useEffect(() => {
    if (productId) {
      loadProduct()
      loadCategories()
    }
  }, [productId])

  /**
   * 打开编辑对话框
   */
  function handleEdit() {
    setDialogOpen(true)
  }

  /**
   * 打开删除确认对话框
   */
  function handleDeleteClick() {
    setDeleteDialogOpen(true)
  }

  /**
   * 执行删除产品
   */
  async function handleDeleteConfirm() {
    if (!product) return

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      router.push("/products")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  /**
   * 返回列表页面
   */
  function handleBack() {
    router.push("/products")
  }

  /**
   * 格式化价格显示
   */
  function formatPrice(price: number | null) {
    if (price === null) return "-"
    return `¥${price.toFixed(2)}`
  }

  /**
   * 格式化日期显示
   */
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="ml-4 text-muted-foreground">Loading product details...</p>
        </div>
      </MainLayout>
    )
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-xl text-muted-foreground mb-4">Product not found</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground mt-1">
                Part Number: {product.part_number}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* 状态徽章 */}
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className={product.is_active ? "bg-green-500" : "bg-gray-500"}
          >
            {product.is_active ? "Active" : "Inactive"}
          </Badge>
          {category && (
            <Badge variant="outline">
              <Package className="h-3 w-3 mr-1" />
              {category.name}
            </Badge>
          )}
        </div>

        <Separator />

        {/* 详细信息卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Product Name (English)
                </p>
                <p className="text-base">{product.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Product Name (Chinese)
                </p>
                <p className="text-base">{product.name_cn}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description (English)
                </p>
                <p className="text-base">{product.description || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description (Chinese)
                </p>
                <p className="text-base">{product.description_cn || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unit</p>
                <p className="text-base">{product.unit}</p>
              </div>
            </CardContent>
          </Card>

          {/* 定价信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Price with Tax
                </p>
                <p className="text-2xl font-bold">
                  {formatPrice(product.price_with_tax)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Price without Tax
                </p>
                <p className="text-2xl font-bold">
                  {formatPrice(product.price_without_tax)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tax Refund Rate
                </p>
                <p className="text-base">
                  {product.tax_refund_rate ? `${product.tax_refund_rate}%` : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 物流信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Weight className="h-5 w-5" />
                Logistics Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weight</p>
                <p className="text-base">
                  {product.weight ? `${product.weight} kg` : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Volume</p>
                <p className="text-base">
                  {product.volume ? `${product.volume} m³` : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">HS Code</p>
                <p className="text-base">{product.hs_code || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Packaging Information
                </p>
                <p className="text-base">{product.packaging_info || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* 附加信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="text-base">{product.notes || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <p className="text-base">{formatDate(product.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Updated At
                </p>
                <p className="text-base">{formatDate(product.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 编辑对话框 */}
        <ProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={product}
          onSuccess={loadProduct}
          categories={categories}
        />

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the product "{product.name}". This
                action cannot be undone.
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

