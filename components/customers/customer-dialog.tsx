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
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

/**
 * 表单验证架构
 */
const formSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  company_full_name: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  credit_level: z.string().optional(),
  tax_id: z.string().optional(),
  currency: z.string().default("USD"),
  language: z.string().default("en"),
  nda_url: z.string().optional(),
  company_logo: z.string().optional(),
  segment: z.string().optional(),
  grade: z.string().optional(),
  status: z.string().default("Active"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

/**
 * 客户类型定义
 */
interface Customer {
  id: string
  name: string
  company_full_name: string | null
  email: string | null
  phone: string | null
  country: string | null
  address: string | null
  credit_level: string | null
  tax_id: string | null
  currency: string
  language: string
  nda_url: string | null
  company_logo: string | null
  segment: string | null
  grade: string | null
  owner_id: string | null
  tags: string[]
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

interface CustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onSuccess: () => void
}

/**
 * 客户创建/编辑对话框组件
 * 用于新建或编辑客户信息
 */
export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      company_full_name: "",
      email: "",
      phone: "",
      country: "",
      address: "",
      credit_level: "",
      tax_id: "",
      currency: "USD",
      language: "en",
      nda_url: "",
      company_logo: "",
      segment: "",
      grade: "",
      status: "Active",
      notes: "",
    },
  })

  /**
   * 当客户数据改变时，更新表单
   */
  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        company_full_name: customer.company_full_name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        country: customer.country || "",
        address: customer.address || "",
        credit_level: customer.credit_level || "",
        tax_id: customer.tax_id || "",
        currency: customer.currency,
        language: customer.language,
        nda_url: customer.nda_url || "",
        company_logo: customer.company_logo || "",
        segment: customer.segment || "",
        grade: customer.grade || "",
        status: customer.status,
        notes: customer.notes || "",
      })
    } else {
      form.reset({
        name: "",
        company_full_name: "",
        email: "",
        phone: "",
        country: "",
        address: "",
        credit_level: "",
        tax_id: "",
        currency: "USD",
        language: "en",
        nda_url: "",
        company_logo: "",
        segment: "",
        grade: "",
        status: "Active",
        notes: "",
      })
    }
  }, [customer, form])

  /**
   * 表单提交处理
   */
  async function onSubmit(values: FormValues) {
    setLoading(true)

    try {
      // 准备数据，处理空字符串
      const data = {
        ...values,
        email: values.email || null,
        phone: values.phone || null,
        country: values.country || null,
        address: values.address || null,
        credit_level: values.credit_level || null,
        tax_id: values.tax_id || null,
        nda_url: values.nda_url || null,
        company_logo: values.company_logo || null,
        segment: values.segment || null,
        grade: values.grade || null,
        notes: values.notes || null,
        company_full_name: values.company_full_name || null,
        owner_id: user?.id || null,
      }

      if (customer) {
        // 更新现有客户
        const { error } = await supabase
          .from("customers")
          .update(data)
          .eq("id", customer.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Customer updated successfully",
        })
      } else {
        // 创建新客户
        const { error } = await supabase.from("customers").insert(data)

        if (error) throw error

        toast({
          title: "Success",
          description: "Customer created successfully",
        })
      }

      onOpenChange(false)
      onSuccess()
      form.reset()
    } catch (error) {
      console.error("Error saving customer:", error)
      toast({
        title: "Error",
        description: customer
          ? "Failed to update customer"
          : "Failed to create customer",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Customer" : "Create New Customer"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 基本信息部分 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company_full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Company Ltd." {...field} />
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
                          placeholder="contact@example.com"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Street address, city, state, zip code"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 业务信息部分 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="segment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segment</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select segment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Potential">Potential</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Customer">Customer</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="credit_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select credit level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AA">AA</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CNY">CNY</SelectItem>
                          <SelectItem value="JPY">JPY</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
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
                        placeholder="Add any additional notes about this customer..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal notes about the customer
                    </FormDescription>
                    <FormMessage />
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
                {customer ? "Update Customer" : "Create Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

