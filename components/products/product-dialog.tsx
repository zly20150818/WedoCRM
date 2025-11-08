"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Trash2, Maximize2 } from "lucide-react"

/**
 * 表单验证架构
 */
const formSchema = z.object({
  part_number: z.string().min(1, "Part number is required"),
  name: z.string().min(1, "Product name is required"),
  name_cn: z.string().min(1, "Chinese name is required"),
  description: z.string().optional(),
  description_cn: z.string().optional(),
  unit: z.string().default("PCS"),
  price_with_tax: z.string().optional(),
  price_without_tax: z.string().optional(),
  weight: z.string().optional(),
  volume: z.string().optional(),
  hs_code: z.string().optional(),
  tax_refund_rate: z.string().optional(),
  packaging_info: z.string().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
  category_id: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

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

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSuccess: () => void
  categories: ProductCategory[]
}

// 本地存储的 key
const DRAFT_STORAGE_KEY = "product_dialog_draft"

/**
 * 产品创建/编辑对话框组件
 * 用于新建或编辑产品信息
 * 
 * 特性：
 * - 全屏显示，适合字段较多的表单
 * - 自动保存草稿到 localStorage
 * - 支持手动保存草稿和清空表单
 * - 关闭后重新打开会恢复未提交的数据
 */
export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
  categories,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_number: "",
      name: "",
      name_cn: "",
      description: "",
      description_cn: "",
      unit: "PCS",
      price_with_tax: "",
      price_without_tax: "",
      weight: "",
      volume: "",
      hs_code: "",
      tax_refund_rate: "",
      packaging_info: "",
      is_active: true,
      notes: "",
      category_id: "",
    },
  })

  /**
   * 从 localStorage 加载草稿
   */
  function loadDraft() {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (savedDraft) {
        const draft = JSON.parse(savedDraft)
        return draft
      }
    } catch (error) {
      console.error("Error loading draft:", error)
    }
    return null
  }

  /**
   * 保存草稿到 localStorage
   */
  function saveDraft(data: FormValues) {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data))
      toast({
        title: "Draft Saved",
        description: "Your changes have been saved as draft",
      })
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive",
      })
    }
  }

  /**
   * 清除草稿
   */
  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing draft:", error)
    }
  }

  /**
   * 手动保存草稿
   */
  function handleSaveDraft() {
    const currentValues = form.getValues()
    saveDraft(currentValues)
  }

  /**
   * 清空表单
   */
  function handleClearForm() {
    form.reset({
      part_number: "",
      name: "",
      name_cn: "",
      description: "",
      description_cn: "",
      unit: "PCS",
      price_with_tax: "",
      price_without_tax: "",
      weight: "",
      volume: "",
      hs_code: "",
      tax_refund_rate: "",
      packaging_info: "",
      is_active: true,
      notes: "",
      category_id: "",
    })
    clearDraft()
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared",
    })
  }

  /**
   * 当产品数据改变时，更新表单
   */
  useEffect(() => {
    if (product) {
      // 编辑模式：加载现有产品数据
      form.reset({
        part_number: product.part_number,
        name: product.name,
        name_cn: product.name_cn,
        description: product.description || "",
        description_cn: product.description_cn || "",
        unit: product.unit,
        price_with_tax: product.price_with_tax?.toString() || "",
        price_without_tax: product.price_without_tax?.toString() || "",
        weight: product.weight?.toString() || "",
        volume: product.volume?.toString() || "",
        hs_code: product.hs_code || "",
        tax_refund_rate: product.tax_refund_rate?.toString() || "",
        packaging_info: product.packaging_info || "",
        is_active: product.is_active,
        notes: product.notes || "",
        category_id: product.category_id || "",
      })
    } else {
      // 新建模式：尝试从 localStorage 恢复草稿
      const draft = loadDraft()
      if (draft) {
        form.reset(draft)
        toast({
          title: "Draft Restored",
          description: "Your previous draft has been restored",
        })
      } else {
        form.reset({
          part_number: "",
          name: "",
          name_cn: "",
          description: "",
          description_cn: "",
          unit: "PCS",
          price_with_tax: "",
          price_without_tax: "",
          weight: "",
          volume: "",
          hs_code: "",
          tax_refund_rate: "",
          packaging_info: "",
          is_active: true,
          notes: "",
          category_id: "",
        })
      }
    }
  }, [product, form, open])

  /**
   * 监听表单变化，自动保存草稿（仅在新建模式）
   */
  useEffect(() => {
    if (!product && open) {
      const subscription = form.watch((value) => {
        // 防抖保存
        const timeoutId = setTimeout(() => {
          saveDraft(value as FormValues)
        }, 1000)
        return () => clearTimeout(timeoutId)
      })
      return () => subscription.unsubscribe()
    }
  }, [form, product, open])

  /**
   * 表单提交处理
   */
  async function onSubmit(values: FormValues) {
    setLoading(true)

    try {
      // 准备数据，将字符串转换为数字
      const data = {
        part_number: values.part_number,
        name: values.name,
        name_cn: values.name_cn,
        description: values.description || null,
        description_cn: values.description_cn || null,
        unit: values.unit,
        price_with_tax: values.price_with_tax ? parseFloat(values.price_with_tax) : null,
        price_without_tax: values.price_without_tax ? parseFloat(values.price_without_tax) : null,
        weight: values.weight ? parseFloat(values.weight) : null,
        volume: values.volume ? parseFloat(values.volume) : null,
        hs_code: values.hs_code || null,
        tax_refund_rate: values.tax_refund_rate ? parseFloat(values.tax_refund_rate) : null,
        packaging_info: values.packaging_info || null,
        is_active: values.is_active,
        notes: values.notes || null,
        category_id: values.category_id && values.category_id !== "none" ? values.category_id : null,
      }

      if (product) {
        // 更新现有产品
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", product.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        // 创建新产品
        const { error } = await supabase.from("products").insert(data)

        if (error) throw error

        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }

      onOpenChange(false)
      onSuccess()
      form.reset()
      // 成功提交后清除草稿
      clearDraft()
    } catch (error: any) {
      console.error("Error saving product:", error)
      
      // 处理唯一性约束错误
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "A product with this part number already exists",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: product
            ? "Failed to update product"
            : "Failed to create product",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none" 
            : "max-w-4xl max-h-[90vh]"
        } flex flex-col p-0`}
      >
        {/* 固定的顶部标题和按钮区域 */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <DialogHeader className="flex-row items-start justify-between space-y-0">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-2xl">
                {product ? "Edit Product" : "Create New Product"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {product 
                  ? "Update the product information below" 
                  : "Fill in the details to create a new product. Your progress is automatically saved."}
              </DialogDescription>
            </div>
            
            {/* 右上角按钮区域 */}
            <div className="flex gap-2 shrink-0">
              {!product && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSaveDraft}
                    disabled={loading}
                    title="Save Draft"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearForm}
                    disabled={loading}
                    title="Clear Form"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Form
                  </Button>
                </>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                form="product-form"
                title={product ? "Update Product" : "Create Product"}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? "Update" : "Create"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* 可滚动的内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Form {...form}>
            <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 基本信息部分 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="part_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="P-001" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique product identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PCS">PCS</SelectItem>
                          <SelectItem value="SET">SET</SelectItem>
                          <SelectItem value="BOX">BOX</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="M2">M²</SelectItem>
                          <SelectItem value="M3">M³</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name (English) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Industrial Widget" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name_cn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name (Chinese) *</FormLabel>
                      <FormControl>
                        <Input placeholder="工业部件" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Product description in English"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description_cn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Chinese)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="产品描述（中文）"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 定价信息部分 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price_with_tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price with Tax (CNY)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_without_tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price without Tax (CNY)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="85.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 物流信息部分 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Logistics Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="1.500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (m³)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.005"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hs_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HS Code</FormLabel>
                      <FormControl>
                        <Input placeholder="8471.30.00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Harmonized System code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tax_refund_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Refund Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="13.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Export tax refund rate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packaging_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Packaging Information</FormLabel>
                      <FormControl>
                        <Input placeholder="Carton, 50 pcs/box" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* 附加信息部分 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this product..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal notes about the product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this product available for use
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 底部提示信息 */}
            {!product && (
              <div className="text-sm text-muted-foreground pt-4 border-t">
                * Your changes are automatically saved as draft
              </div>
            )}
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

