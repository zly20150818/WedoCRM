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
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

/**
 * 表单验证架构
 */
const formSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  title: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  wechat: z.string().optional(),
  is_primary: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

/**
 * 联系人类型定义
 */
export interface Contact {
  id: string
  customer_id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  wechat: string | null
  is_primary: boolean
  created_at: string
  updated_at: string
}

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  customerId: string
  customerName: string
  onSuccess: () => void
}

/**
 * 联系人创建/编辑对话框组件
 * 用于管理客户公司的联系人
 * 一个客户（公司）可以有多个联系人（如采购经理、财务经理等）
 */
export function ContactDialog({
  open,
  onOpenChange,
  contact,
  customerId,
  customerName,
  onSuccess,
}: ContactDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      title: "",
      email: "",
      phone: "",
      wechat: "",
      is_primary: false,
    },
  })

  /**
   * 当联系人数据改变时，更新表单
   */
  useEffect(() => {
    if (contact) {
      form.reset({
        name: contact.name,
        title: contact.title || "",
        email: contact.email || "",
        phone: contact.phone || "",
        wechat: contact.wechat || "",
        is_primary: contact.is_primary,
      })
    } else {
      form.reset({
        name: "",
        title: "",
        email: "",
        phone: "",
        wechat: "",
        is_primary: false,
      })
    }
  }, [contact, form, open])

  /**
   * 表单提交处理
   */
  async function onSubmit(values: FormValues) {
    setLoading(true)

    try {
      // 如果设置为主要联系人，先取消该客户其他联系人的主要状态
      if (values.is_primary) {
        const { error: updateError } = await supabase
          .from("contacts")
          .update({ is_primary: false })
          .eq("customer_id", customerId)
          .neq("id", contact?.id || "")

        if (updateError) {
          console.error("Error updating other contacts:", updateError)
        }
      }

      // 准备数据，处理空字符串
      const data = {
        customer_id: customerId,
        name: values.name,
        title: values.title || null,
        email: values.email || null,
        phone: values.phone || null,
        wechat: values.wechat || null,
        is_primary: values.is_primary,
      }

      if (contact) {
        // 更新现有联系人
        const { error } = await supabase
          .from("contacts")
          .update(data)
          .eq("id", contact.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Contact updated successfully",
        })
      } else {
        // 创建新联系人
        const { error } = await supabase.from("contacts").insert(data)

        if (error) throw error

        toast({
          title: "Success",
          description: "Contact added successfully",
        })
      }

      onOpenChange(false)
      onSuccess()
      form.reset()
    } catch (error) {
      console.error("Error saving contact:", error)
      toast({
        title: "Error",
        description: contact
          ? "Failed to update contact"
          : "Failed to add contact",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Edit Contact Person" : "Add Contact Person"}
          </DialogTitle>
          <DialogDescription>
            {contact
              ? `Update contact information for ${customerName}`
              : `Add a new contact person for ${customerName}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sales Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="wechat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WeChat ID</FormLabel>
                    <FormControl>
                      <Input placeholder="WeChat ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_primary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Primary Contact
                      </FormLabel>
                      <FormDescription>
                        Mark this person as the main contact for this customer
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

            {/* 表单操作按钮 */}
            <div className="flex justify-end gap-4">
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
                {contact ? "Update Contact" : "Add Contact"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

