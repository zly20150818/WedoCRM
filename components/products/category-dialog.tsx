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
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

/**
 * 表单验证架构
 */
const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  name_cn: z.string().optional(),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

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

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: ProductCategory | null
  onSuccess: () => void
}

/**
 * 产品分类创建/编辑对话框组件
 * 用于新建或编辑产品分类
 */
export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      name_cn: "",
      description: "",
    },
  })

  /**
   * 当分类数据改变时，更新表单
   */
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        name_cn: category.name_cn || "",
        description: category.description || "",
      })
    } else {
      form.reset({
        name: "",
        name_cn: "",
        description: "",
      })
    }
  }, [category, form])

  /**
   * 表单提交处理
   */
  async function onSubmit(values: FormValues) {
    setLoading(true)

    try {
      // 准备数据
      const data = {
        name: values.name,
        name_cn: values.name_cn || null,
        description: values.description || null,
      }

      if (category) {
        // 更新现有分类
        const { error } = await supabase
          .from("product_categories")
          .update(data)
          .eq("id", category.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Category updated successfully",
        })
      } else {
        // 创建新分类
        const { error } = await supabase.from("product_categories").insert(data)

        if (error) throw error

        toast({
          title: "Success",
          description: "Category created successfully",
        })
      }

      onOpenChange(false)
      onSuccess()
      form.reset()
    } catch (error: any) {
      console.error("Error saving category:", error)

      // 处理唯一性约束错误
      if (error.code === "23505") {
        toast({
          title: "Error",
          description: "A category with this name already exists",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: category
            ? "Failed to update category"
            : "Failed to create category",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name (English) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Electronics" {...field} />
                  </FormControl>
                  <FormDescription>
                    The English name for this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_cn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name (Chinese)</FormLabel>
                  <FormControl>
                    <Input placeholder="电子产品" {...field} />
                  </FormControl>
                  <FormDescription>
                    The Chinese name for this category (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Category description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description for this category
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 表单操作按钮 */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


