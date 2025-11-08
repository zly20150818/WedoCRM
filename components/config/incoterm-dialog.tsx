"use client"

/**
 * 贸易术语对话框组件
 * 用于新建和编辑贸易术语
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

interface Incoterm {
  id: string
  code: string
  name: string
  name_cn: string
  description: string | null
  version: string
  is_active: boolean
  sort_order: number
}

interface IncotermFormValues {
  code: string
  name: string
  name_cn: string
  description: string
  version: string
  is_active: boolean
  sort_order: number
}

interface IncotermDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incoterm: Incoterm | null
  onSuccess: () => void
}

export function IncotermDialog({
  open,
  onOpenChange,
  incoterm,
  onSuccess,
}: IncotermDialogProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const isEditing = !!incoterm

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IncotermFormValues>({
    defaultValues: {
      code: "",
      name: "",
      name_cn: "",
      description: "",
      version: "2020",
      is_active: true,
      sort_order: 0,
    },
  })

  const version = watch("version")
  const isActive = watch("is_active")

  /**
   * 加载贸易术语数据到表单
   */
  useEffect(() => {
    if (incoterm) {
      reset({
        code: incoterm.code,
        name: incoterm.name,
        name_cn: incoterm.name_cn,
        description: incoterm.description || "",
        version: incoterm.version,
        is_active: incoterm.is_active,
        sort_order: incoterm.sort_order,
      })
    } else {
      reset({
        code: "",
        name: "",
        name_cn: "",
        description: "",
        version: "2020",
        is_active: true,
        sort_order: 0,
      })
    }
  }, [incoterm, reset])

  /**
   * 提交表单
   */
  const onSubmit = async (data: IncotermFormValues) => {
    try {
      if (isEditing) {
        // 更新现有贸易术语
        const { error } = await supabase
          .from("incoterms")
          .update({
            code: data.code,
            name: data.name,
            name_cn: data.name_cn,
            description: data.description || null,
            version: data.version,
            is_active: data.is_active,
            sort_order: data.sort_order,
          })
          .eq("id", incoterm.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Incoterm updated successfully",
        })
      } else {
        // 创建新贸易术语
        const { error } = await supabase.from("incoterms").insert({
          code: data.code,
          name: data.name,
          name_cn: data.name_cn,
          description: data.description || null,
          version: data.version,
          is_active: data.is_active,
          sort_order: data.sort_order,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Incoterm created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("保存贸易术语失败:", error)
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update incoterm"
          : "Failed to create incoterm",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Incoterm" : "Add New Incoterm"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the incoterm information below"
              : "Enter the incoterm information below"}
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
                placeholder="e.g., FOB"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            {/* 版本 */}
            <div className="space-y-2">
              <Label htmlFor="version">
                Version <span className="text-destructive">*</span>
              </Label>
              <Select
                value={version}
                onValueChange={(value) => setValue("version", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2020">Incoterms 2020</SelectItem>
                  <SelectItem value="2010">Incoterms 2010</SelectItem>
                  <SelectItem value="2000">Incoterms 2000</SelectItem>
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
                placeholder="e.g., Free On Board"
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
                placeholder="e.g., 装运港船上交货"
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
              placeholder="Additional information about this incoterm"
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

