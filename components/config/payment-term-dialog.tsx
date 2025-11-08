"use client"

/**
 * 付款方式对话框组件
 * 用于新建和编辑付款方式
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
}

interface PaymentTermFormValues {
  code: string
  name: string
  name_cn: string
  type: string
  days: string
  description: string
  is_active: boolean
  sort_order: number
}

interface PaymentTermDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  term: PaymentTerm | null
  onSuccess: () => void
}

export function PaymentTermDialog({
  open,
  onOpenChange,
  term,
  onSuccess,
}: PaymentTermDialogProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const isEditing = !!term

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentTermFormValues>({
    defaultValues: {
      code: "",
      name: "",
      name_cn: "",
      type: "TT",
      days: "",
      description: "",
      is_active: true,
      sort_order: 0,
    },
  })

  const type = watch("type")
  const isActive = watch("is_active")

  /**
   * 加载付款方式数据到表单
   */
  useEffect(() => {
    if (term) {
      reset({
        code: term.code,
        name: term.name,
        name_cn: term.name_cn,
        type: term.type,
        days: term.days !== null ? String(term.days) : "",
        description: term.description || "",
        is_active: term.is_active,
        sort_order: term.sort_order,
      })
    } else {
      reset({
        code: "",
        name: "",
        name_cn: "",
        type: "TT",
        days: "",
        description: "",
        is_active: true,
        sort_order: 0,
      })
    }
  }, [term, reset])

  /**
   * 提交表单
   */
  const onSubmit = async (data: PaymentTermFormValues) => {
    try {
      const days = data.days ? parseInt(data.days) : null

      if (isEditing) {
        // 更新现有付款方式
        const { error } = await supabase
          .from("payment_terms")
          .update({
            code: data.code,
            name: data.name,
            name_cn: data.name_cn,
            type: data.type,
            days,
            description: data.description || null,
            is_active: data.is_active,
            sort_order: data.sort_order,
          })
          .eq("id", term.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Payment term updated successfully",
        })
      } else {
        // 创建新付款方式
        const { error } = await supabase.from("payment_terms").insert({
          code: data.code,
          name: data.name,
          name_cn: data.name_cn,
          type: data.type,
          days,
          description: data.description || null,
          is_active: data.is_active,
          sort_order: data.sort_order,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Payment term created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("保存付款方式失败:", error)
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update payment term"
          : "Failed to create payment term",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Payment Term" : "Add New Payment Term"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the payment term information below"
              : "Enter the payment term information below"}
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
                placeholder="e.g., TT30"
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
                  <SelectItem value="TT">T/T (Telegraphic Transfer)</SelectItem>
                  <SelectItem value="LC">L/C (Letter of Credit)</SelectItem>
                  <SelectItem value="DP">D/P (Documents against Payment)</SelectItem>
                  <SelectItem value="DA">D/A (Documents against Acceptance)</SelectItem>
                  <SelectItem value="OA">O/A (Open Account)</SelectItem>
                  <SelectItem value="CAD">CAD (Cash Against Documents)</SelectItem>
                  <SelectItem value="Advance">Advance Payment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
                placeholder="e.g., 30 Days T/T"
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
                placeholder="e.g., 30天电汇"
              />
              {errors.name_cn && (
                <p className="text-sm text-destructive">{errors.name_cn.message}</p>
              )}
            </div>

            {/* 天数 */}
            <div className="space-y-2">
              <Label htmlFor="days">Days</Label>
              <Input
                id="days"
                type="number"
                {...register("days")}
                placeholder="e.g., 30"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty if not applicable
              </p>
            </div>

            {/* 排序 */}
            <div className="space-y-2">
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
              placeholder="Additional information about this payment term"
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

