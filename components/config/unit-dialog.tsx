"use client"

/**
 * 计量单位对话框组件
 * 用于新建和编辑计量单位
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

interface Unit {
  id: string
  code: string
  name: string
  name_cn: string
  type: string
  description: string | null
  is_active: boolean
  sort_order: number
}

interface UnitFormValues {
  code: string
  name: string
  name_cn: string
  type: string
  description: string
  is_active: boolean
  sort_order: number
}

interface UnitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: Unit | null
  onSuccess: () => void
}

export function UnitDialog({ open, onOpenChange, unit, onSuccess }: UnitDialogProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const isEditing = !!unit

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({
    defaultValues: {
      code: "",
      name: "",
      name_cn: "",
      type: "Quantity",
      description: "",
      is_active: true,
      sort_order: 0,
    },
  })

  const type = watch("type")
  const isActive = watch("is_active")

  /**
   * 加载计量单位数据到表单
   */
  useEffect(() => {
    if (unit) {
      reset({
        code: unit.code,
        name: unit.name,
        name_cn: unit.name_cn,
        type: unit.type,
        description: unit.description || "",
        is_active: unit.is_active,
        sort_order: unit.sort_order,
      })
    } else {
      reset({
        code: "",
        name: "",
        name_cn: "",
        type: "Quantity",
        description: "",
        is_active: true,
        sort_order: 0,
      })
    }
  }, [unit, reset])

  /**
   * 提交表单
   */
  const onSubmit = async (data: UnitFormValues) => {
    try {
      if (isEditing) {
        // 更新现有计量单位
        const { error } = await supabase
          .from("units_of_measurement")
          .update({
            code: data.code,
            name: data.name,
            name_cn: data.name_cn,
            type: data.type,
            description: data.description || null,
            is_active: data.is_active,
            sort_order: data.sort_order,
          })
          .eq("id", unit.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Unit updated successfully",
        })
      } else {
        // 创建新计量单位
        const { error } = await supabase.from("units_of_measurement").insert({
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
          description: "Unit created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("保存计量单位失败:", error)
      toast({
        title: "Error",
        description: isEditing ? "Failed to update unit" : "Failed to create unit",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Unit" : "Add New Unit"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the unit information below"
              : "Enter the unit information below"}
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
                placeholder="e.g., PCS"
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
                  <SelectItem value="Quantity">Quantity</SelectItem>
                  <SelectItem value="Weight">Weight</SelectItem>
                  <SelectItem value="Volume">Volume</SelectItem>
                  <SelectItem value="Length">Length</SelectItem>
                  <SelectItem value="Area">Area</SelectItem>
                  <SelectItem value="Time">Time</SelectItem>
                  <SelectItem value="Package">Package</SelectItem>
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
                placeholder="e.g., Piece"
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
                placeholder="e.g., 个"
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
              placeholder="Additional information about this unit"
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

