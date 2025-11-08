"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Trash2, Maximize2, Save } from "lucide-react"
import { format } from "date-fns"

/**
 * 采购订单明细项验证架构
 */
const itemSchema = z.object({
  part_number: z.string().min(1, "Part number is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().default("PCS"),
  unit_price: z.string().min(1, "Unit price is required"),
})

/**
 * 表单验证架构
 */
const formSchema = z.object({
  po_number: z.string().min(1, "PO number is required"),
  project_id: z.string().min(1, "Project is required"),
  supplier_id: z.string().min(1, "Supplier is required"),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  currency: z.string().default("CNY"),
  exchange_rate: z.string().default("1.0"),
  delivery_date: z.string().optional(),
  terms: z.string().optional(),
  status: z.string().default("Pending"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

/**
 * 采购订单类型定义
 */
interface PurchaseOrder {
  id: string
  po_number: string
  project_id: string
  supplier_id: string
  items: any
  currency: string
  exchange_rate: number
  delivery_date: string | null
  terms: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * 供应商类型
 */
interface Supplier {
  id: string
  name: string
}

/**
 * 项目类型
 */
interface Project {
  id: string
  name: string
  project_number: string
}

interface PurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder?: PurchaseOrder
  onSuccess: () => void
}

// 本地存储的 key
const DRAFT_STORAGE_KEY = "purchase_order_draft"

/**
 * 采购订单对话框组件
 * 用于新建和编辑采购订单
 */
export function PurchaseOrderDialog({
  open,
  onOpenChange,
  purchaseOrder,
  onSuccess,
}: PurchaseOrderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 初始化表单
   */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      po_number: "",
      project_id: "",
      supplier_id: "",
      items: [
        {
          part_number: "",
          description: "",
          quantity: "",
          unit: "PCS",
          unit_price: "",
        },
      ],
      currency: "CNY",
      exchange_rate: "1.0",
      delivery_date: "",
      terms: "",
      status: "Pending",
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  /**
   * 加载供应商和项目列表
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)

        // 加载供应商
        const { data: suppliersData, error: suppliersError } = await supabase
          .from("suppliers")
          .select("id, name")
          .eq("status", "Active")
          .order("name")

        if (suppliersError) throw suppliersError
        setSuppliers(suppliersData || [])

        // 加载项目
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, name, project_number")
          .eq("status", "Active")
          .order("created_at", { ascending: false })

        if (projectsError) throw projectsError
        setProjects(projectsData || [])
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    if (open) {
      loadData()
    }
  }, [open, supabase, toast])

  /**
   * 从 localStorage 加载草稿
   */
  function loadDraft() {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (savedDraft) {
        return JSON.parse(savedDraft)
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
      po_number: "",
      project_id: "",
      supplier_id: "",
      items: [
        {
          part_number: "",
          description: "",
          quantity: "",
          unit: "PCS",
          unit_price: "",
        },
      ],
      currency: "CNY",
      exchange_rate: "1.0",
      delivery_date: "",
      terms: "",
      status: "Pending",
      notes: "",
    })
    clearDraft()
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared",
    })
  }

  /**
   * 当对话框打开或采购订单改变时重置表单
   */
  useEffect(() => {
    if (open) {
      if (purchaseOrder) {
        // 编辑模式：填充现有数据
        const items = Array.isArray(purchaseOrder.items)
          ? purchaseOrder.items.map((item: any) => ({
              part_number: item.part_number || "",
              description: item.description || "",
              quantity: item.quantity?.toString() || "",
              unit: item.unit || "PCS",
              unit_price: item.unit_price?.toString() || "",
            }))
          : []

        form.reset({
          po_number: purchaseOrder.po_number,
          project_id: purchaseOrder.project_id,
          supplier_id: purchaseOrder.supplier_id,
          items: items.length > 0 ? items : [{ part_number: "", description: "", quantity: "", unit: "PCS", unit_price: "" }],
          currency: purchaseOrder.currency,
          exchange_rate: purchaseOrder.exchange_rate.toString(),
          delivery_date: purchaseOrder.delivery_date
            ? format(new Date(purchaseOrder.delivery_date), "yyyy-MM-dd")
            : "",
          terms: purchaseOrder.terms || "",
          status: purchaseOrder.status,
          notes: purchaseOrder.notes || "",
        })
      } else {
        // 新建模式：尝试恢复草稿
        const draft = loadDraft()
        if (draft) {
          form.reset(draft)
          toast({
            title: "Draft Restored",
            description: "Your previous draft has been restored",
          })
        } else {
          form.reset({
            po_number: "",
            project_id: "",
            supplier_id: "",
            items: [
              {
                part_number: "",
                description: "",
                quantity: "",
                unit: "PCS",
                unit_price: "",
              },
            ],
            currency: "CNY",
            exchange_rate: "1.0",
            delivery_date: "",
            terms: "",
            status: "Pending",
            notes: "",
          })
        }
      }
    }
  }, [open, purchaseOrder, form, toast])

  /**
   * 自动保存草稿（仅在新建模式）
   */
  useEffect(() => {
    if (!purchaseOrder && open) {
      const subscription = form.watch((value) => {
        const timeoutId = setTimeout(() => {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value))
        }, 1000)
        return () => clearTimeout(timeoutId)
      })
      return () => subscription.unsubscribe()
    }
  }, [form, purchaseOrder, open])

  /**
   * 添加明细项
   */
  const handleAddItem = () => {
    append({
      part_number: "",
      description: "",
      quantity: "",
      unit: "PCS",
      unit_price: "",
    })
  }

  /**
   * 计算总金额
   */
  const calculateTotal = () => {
    const items = form.getValues("items")
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price) || 0
      return sum + quantity * unitPrice
    }, 0)
  }

  /**
   * 提交表单
   */
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)

      // 转换数据类型
      const poData = {
        po_number: values.po_number,
        project_id: values.project_id,
        supplier_id: values.supplier_id,
        items: values.items.map((item) => ({
          part_number: item.part_number,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          unit_price: parseFloat(item.unit_price),
        })),
        currency: values.currency,
        base_currency: "CNY",
        exchange_rate: parseFloat(values.exchange_rate),
        exchange_date: new Date().toISOString(),
        delivery_date: values.delivery_date || null,
        terms: values.terms || null,
        status: values.status,
        notes: values.notes || null,
      }

      if (purchaseOrder) {
        // 更新采购订单
        const { error } = await supabase
          .from("purchase_orders")
          .update(poData)
          .eq("id", purchaseOrder.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Purchase order updated successfully",
        })
      } else {
        // 创建新采购订单
        const { error } = await supabase
          .from("purchase_orders")
          .insert([poData])

        if (error) throw error

        toast({
          title: "Success",
          description: "Purchase order created successfully",
        })

        // 清除草稿
        clearDraft()
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save purchase order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const editMode = !!purchaseOrder

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
              <DialogTitle>
                {purchaseOrder ? "Edit Purchase Order" : "Create New Purchase Order"}
              </DialogTitle>
            </div>
            
            {/* 右上角按钮区域 - 始终可见 */}
            <div className="flex gap-2 shrink-0">
              {!editMode && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} title="Save Draft">
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearForm} title="Clear Form">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Form
                  </Button>
                </>
              )}
              <Button type="submit" size="sm" form="purchase-order-form" title={purchaseOrder ? "Update" : "Create"}>
                {purchaseOrder ? "Update" : "Create"}
              </Button>
              <Button
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
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Form {...form}>
              <form id="purchase-order-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* PO编号 */}
                  <FormField
                    control={form.control}
                    name="po_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PO Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="PO-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 项目 */}
                  <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.project_number} - {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 供应商 */}
                  <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 状态 */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Ordered">Ordered</SelectItem>
                            <SelectItem value="PartiallyReceived">
                              Partially Received
                            </SelectItem>
                            <SelectItem value="Received">Received</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 币种 */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CNY">CNY</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="JPY">JPY</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 汇率 */}
                  <FormField
                    control={form.control}
                    name="exchange_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exchange Rate</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.0001"
                            placeholder="1.0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 交货日期 */}
                  <FormField
                    control={form.control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* 采购明细 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Purchase Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* 产品编号 */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.part_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Part Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter part number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* 单位 */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <FormControl>
                                <Input placeholder="PCS" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* 描述 */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Description *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter item description"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* 数量 */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* 单价 */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit_price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 总金额 */}
                <div className="flex justify-end items-center gap-2 text-lg font-semibold">
                  <span>Total:</span>
                  <span>
                    {form.watch("currency")} {calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* 条款和备注 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>

                {/* 付款条款 */}
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter payment terms and conditions"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 备注 */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                {/* 提示信息 */}
                {!editMode && (
                  <div className="text-sm text-muted-foreground">
                    * Your changes are automatically saved as draft
                  </div>
                )}
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

