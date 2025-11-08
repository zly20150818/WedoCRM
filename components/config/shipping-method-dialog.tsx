"use client"

/**
 * 运输方式对话框组件
 * 用于新建和编辑运输方式
 */

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { useToast } from "@/components/ui/use-toast"

interface ShippingMethod {
  id: string
  code: string
  name: string
  name_cn: string
  type: string
  description: string | null
  is_active: boolean
  sort_order: number
}

interface ShippingMethodFormValues {
  code: string
  name: string
  name_cn: string
  type: string
  description: string
  is_active: boolean
  sort_order: number
}

interface ShippingMethodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  method: ShippingMethod | null
  onSuccess: () => void
}

export function ShippingMethodDialog({
  open,
  onOpenChange,
  method,
  onSuccess,
}: ShippingMethodDialogProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const isEditing = !!method

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ShippingMethodFormValues>({
    defaultValues: {
      code: "",
      name: "",
      name_cn: "",
      type: "Sea",
      description: "",
      is_active: true,
      sort_order: 0,
    },
  })

  const type = watch("type")
  const isActive = watch("is_active")

  /**
   * 加载运输方式数据到表单
   */
  useEffect(() => {
    if (method) {
      reset({
        code: method.code,
        name: method.name,
        name_cn: method.name_cn,
        type: method.type,
        description: method.description || "",
        is_active: method.is_active,
        sort_order: method.sort_order,
      })
    } else {
      reset({
        code: "",
        name: "",
        name_cn: "",
        type: "Sea",
        description: "",
        is_active: true,
        sort_order: 0,
      })
    }
  }, [method, reset])

  /**
   * 提交表单
   */
  const onSubmit = async (data: ShippingMethodFormValues) => {
    try {
      if (isEditing) {
        // 更新现有运输方式
        const { error } = await supabase
          .from("shipping_methods")
          .update({
            code: data.code,
            name: data.name,
            name_cn: data.name_cn,
            type: data.type,
            description: data.description || null,
            is_active: data.is_active,
            sort_order: data.sort_order,
          })
          .eq("id", method.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Shipping method updated successfully",
        })
      } else {
        // 创建新运输方式
        const { error } = await supabase.from("shipping_methods").insert({
          code: data.code,
          name: data.name,
          name_cn: data.name_cn,
          type: data.type,
          description: data.description || null,
          is_active: data.is_active,
          sort_order: data.sort_order,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Shipping method created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("保存运输方式失败:", error)
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update shipping method"
          : "Failed to create shipping method",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Shipping Method" : "Add New Shipping Method"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the shipping method information below"
              : "Enter the shipping method information below"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 代码 */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                {...register("code", { required: "Code is required" })}
                placeholder="e.g., SEA_FCL"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            {/* 类型 */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sea">Sea Freight</SelectItem>
                  <SelectItem value="Air">Air Freight</SelectItem>
                  <SelectItem value="Land">Land Transport</SelectItem>
                  <SelectItem value="Rail">Rail Transport</SelectItem>
                  <SelectItem value="Courier">Express Courier</SelectItem>
                  <SelectItem value="Multimodal">Multimodal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 英文名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name (EN) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="e.g., Sea Freight FCL"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* 中文名称 */}
            <div className="space-y-2">
              <Label htmlFor="name_cn">
                Name (CN) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name_cn"
                {...register("name_cn", { required: "Chinese name is required" })}
                placeholder="e.g., 海运整柜"
              />
              {errors.name_cn && (
                <p className="text-sm text-destructive">{errors.name_cn.message}</p>
              )}
            </div>

            {/* 排序 */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                {...register("sort_order", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Additional information about this shipping method"
              rows={3}
            />
          </div>

          {/* 是否激活 */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

