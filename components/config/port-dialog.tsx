"use client"

/**
 * 港口信息对话框组件
 * 用于新建和编辑港口信息
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

interface Port {
  id: string
  code: string
  name: string
  name_cn: string
  country: string
  country_cn: string
  city: string | null
  type: string
  is_active: boolean
  sort_order: number
  description: string | null
}

interface PortFormValues {
  code: string
  name: string
  name_cn: string
  country: string
  country_cn: string
  city: string
  type: string
  is_active: boolean
  sort_order: number
  description: string
}

interface PortDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  port: Port | null
  onSuccess: () => void
}

export function PortDialog({ open, onOpenChange, port, onSuccess }: PortDialogProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const isEditing = !!port

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PortFormValues>({
    defaultValues: {
      code: "",
      name: "",
      name_cn: "",
      country: "",
      country_cn: "",
      city: "",
      type: "Seaport",
      is_active: true,
      sort_order: 0,
      description: "",
    },
  })

  const type = watch("type")
  const isActive = watch("is_active")

  /**
   * 加载港口数据到表单
   */
  useEffect(() => {
    if (port) {
      reset({
        code: port.code,
        name: port.name,
        name_cn: port.name_cn,
        country: port.country,
        country_cn: port.country_cn,
        city: port.city || "",
        type: port.type,
        is_active: port.is_active,
        sort_order: port.sort_order,
        description: port.description || "",
      })
    } else {
      reset({
        code: "",
        name: "",
        name_cn: "",
        country: "",
        country_cn: "",
        city: "",
        type: "Seaport",
        is_active: true,
        sort_order: 0,
        description: "",
      })
    }
  }, [port, reset])

  /**
   * 提交表单
   */
  const onSubmit = async (data: PortFormValues) => {
    try {
      if (isEditing) {
        // 更新现有港口
        const { error } = await supabase
          .from("ports")
          .update({
            code: data.code,
            name: data.name,
            name_cn: data.name_cn,
            country: data.country,
            country_cn: data.country_cn,
            city: data.city || null,
            type: data.type,
            is_active: data.is_active,
            sort_order: data.sort_order,
            description: data.description || null,
          })
          .eq("id", port.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Port updated successfully",
        })
      } else {
        // 创建新港口
        const { error } = await supabase.from("ports").insert({
          code: data.code,
          name: data.name,
          name_cn: data.name_cn,
          country: data.country,
          country_cn: data.country_cn,
          city: data.city || null,
          type: data.type,
          is_active: data.is_active,
          sort_order: data.sort_order,
          description: data.description || null,
        })

        if (error) throw error

        toast({
          title: "Success",
          description: "Port created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("保存港口失败:", error)
      toast({
        title: "Error",
        description: isEditing ? "Failed to update port" : "Failed to create port",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Port" : "Add New Port"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the port information below"
              : "Enter the port information below"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 港口代码 */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Port Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code"
                {...register("code", { required: "Port code is required" })}
                placeholder="e.g., CNNBO"
              />
              {errors.code && (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              )}
            </div>

            {/* 港口类型 */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Seaport">Seaport</SelectItem>
                  <SelectItem value="Airport">Airport</SelectItem>
                  <SelectItem value="Inland">Inland Port</SelectItem>
                  <SelectItem value="Rail">Rail Terminal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 英文名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Port Name (EN) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Port name is required" })}
                placeholder="e.g., Ningbo"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* 中文名称 */}
            <div className="space-y-2">
              <Label htmlFor="name_cn">
                Port Name (CN) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name_cn"
                {...register("name_cn", { required: "Chinese name is required" })}
                placeholder="e.g., 宁波"
              />
              {errors.name_cn && (
                <p className="text-sm text-destructive">{errors.name_cn.message}</p>
              )}
            </div>

            {/* 国家英文名 */}
            <div className="space-y-2">
              <Label htmlFor="country">
                Country (EN) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country"
                {...register("country", { required: "Country is required" })}
                placeholder="e.g., China"
              />
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>

            {/* 国家中文名 */}
            <div className="space-y-2">
              <Label htmlFor="country_cn">
                Country (CN) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="country_cn"
                {...register("country_cn", { required: "Country (CN) is required" })}
                placeholder="e.g., 中国"
              />
              {errors.country_cn && (
                <p className="text-sm text-destructive">{errors.country_cn.message}</p>
              )}
            </div>

            {/* 城市 */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} placeholder="e.g., Ningbo" />
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
              placeholder="Additional information about this port"
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

