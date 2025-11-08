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
import { Loader2 } from "lucide-react"

/**
 * 表单验证架构
 */
const formSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  country: z.string().optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  status: z.string().default("Active"),
  rating: z.string().default("0"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

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

interface SupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier
  onSuccess: () => void
}

/**
 * 供应商对话框组件
 * 用于新建和编辑供应商
 */
export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 初始化表单
   */
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      country: "",
      address: "",
      category: "",
      status: "Active",
      rating: "0",
      notes: "",
    },
  })

  /**
   * 当对话框打开或供应商改变时重置表单
   */
  useEffect(() => {
    if (open) {
      if (supplier) {
        // 编辑模式：填充现有供应商数据
        form.reset({
          name: supplier.name,
          country: supplier.country || "",
          address: supplier.address || "",
          category: supplier.category || "",
          status: supplier.status,
          rating: supplier.rating.toString(),
          notes: supplier.notes || "",
        })
      } else {
        // 新建模式：重置为默认值
        form.reset({
          name: "",
          country: "",
          address: "",
          category: "",
          status: "Active",
          rating: "0",
          notes: "",
        })
      }
    }
  }, [open, supplier, form])

  /**
   * 提交表单
   */
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)

      // 转换数据类型
      const supplierData = {
        name: values.name,
        country: values.country || null,
        address: values.address || null,
        category: values.category || null,
        status: values.status,
        rating: parseFloat(values.rating) || 0,
        notes: values.notes || null,
      }

      if (supplier) {
        // 更新供应商
        const { error } = await supabase
          .from("suppliers")
          .update(supplierData)
          .eq("id", supplier.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Supplier updated successfully",
        })
      } else {
        // 创建新供应商
        const { error } = await supabase
          .from("suppliers")
          .insert([supplierData])

        if (error) throw error

        toast({
          title: "Success",
          description: "Supplier created successfully",
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save supplier",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 供应商名称 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 国家 */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 地址 */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter full address"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* 分类 */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Electronics" {...field} />
                    </FormControl>
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Blacklisted">Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 评级 */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (0-5)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="0.0"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Rate supplier from 0 to 5 stars
                  </FormDescription>
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
                      placeholder="Additional notes about this supplier"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 提交按钮 */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {supplier ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

