"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  FileText,
  Users,
  Pencil,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CustomerDialog } from "@/components/customers/customer-dialog"

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

/**
 * 联系人类型定义
 */
interface Contact {
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

/**
 * 客户详情页面
 * 显示客户的完整信息，包括基本信息、联系人、项目等
 */
export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const customerId = params.id as string

  /**
   * 加载客户详细信息
   */
  async function loadCustomer() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load customer details",
          variant: "destructive",
        })
        return
      }

      setCustomer(data)
    } catch (error) {
      console.error("Error loading customer:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载联系人列表
   */
  async function loadContacts() {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("customer_id", customerId)
        .order("is_primary", { ascending: false })

      if (error) {
        console.error("Error loading contacts:", error)
        return
      }

      setContacts(data || [])
    } catch (error) {
      console.error("Error loading contacts:", error)
    }
  }

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadCustomer()
    loadContacts()
  }, [customerId])

  /**
   * 获取状态徽章颜色
   */
  function getStatusColor(status: string) {
    switch (status) {
      case "Active":
        return "bg-green-500"
      case "Inactive":
        return "bg-gray-500"
      case "Pending":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  /**
   * 获取细分徽章颜色
   */
  function getSegmentColor(segment: string | null) {
    switch (segment) {
      case "VIP":
        return "bg-purple-500"
      case "Customer":
        return "bg-blue-500"
      case "Lead":
        return "bg-yellow-500"
      case "Potential":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  /**
   * 格式化日期
   */
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>
      </MainLayout>
    )
  }

  if (!customer) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <h2 className="text-2xl font-bold">Customer not found</h2>
          <Button onClick={() => router.push("/customers")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/customers")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{customer.name}</h1>
                <Badge className={getStatusColor(customer.status)}>
                  {customer.status}
                </Badge>
                {customer.segment && (
                  <Badge className={getSegmentColor(customer.segment)}>
                    {customer.segment}
                  </Badge>
                )}
              </div>
              {customer.company_full_name && (
                <p className="text-muted-foreground mt-1">
                  {customer.company_full_name}
                </p>
              )}
            </div>
          </div>
          <Button onClick={() => setEditDialogOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Customer
          </Button>
        </div>

        {/* 内容区域 */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 基本信息卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Email</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Phone</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.phone}
                        </div>
                      </div>
                    </div>
                  )}
                  {customer.country && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Country</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.country}
                        </div>
                      </div>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Address</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.address}
                        </div>
                      </div>
                    </div>
                  )}
                  {customer.tax_id && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Tax ID</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.tax_id}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 业务信息卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Currency</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Language</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.language.toUpperCase()}
                      </div>
                    </div>
                    {customer.credit_level && (
                      <div>
                        <div className="text-sm font-medium">Credit Level</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.credit_level}
                        </div>
                      </div>
                    )}
                    {customer.segment && (
                      <div>
                        <div className="text-sm font-medium">Segment</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.segment}
                        </div>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div className="font-medium">
                        {formatDate(customer.created_at)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Updated</div>
                      <div className="font-medium">
                        {formatDate(customer.updated_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 备注卡片 */}
            {customer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {customer.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 联系人标签页 */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contacts</CardTitle>
                    <CardDescription>
                      Manage customer contact persons
                    </CardDescription>
                  </div>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {contacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No contacts found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{contact.name}</h4>
                            {contact.is_primary && (
                              <Badge variant="secondary">Primary</Badge>
                            )}
                          </div>
                          {contact.title && (
                            <p className="text-sm text-muted-foreground">
                              {contact.title}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {contact.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 项目标签页 */}
          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Customer projects and orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No projects found
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 文档标签页 */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Customer related documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No documents found
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 编辑客户对话框 */}
        <CustomerDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          customer={customer}
          onSuccess={loadCustomer}
        />
      </div>
    </MainLayout>
  )
}

