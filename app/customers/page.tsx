"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

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
 * 客户管理页面
 * 显示客户列表，支持搜索、筛选、新增、编辑和删除
 */
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [segmentFilter, setSegmentFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载客户列表
   */
  async function loadCustomers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive",
        })
        return
      }

      setCustomers(data || [])
      setFilteredCustomers(data || [])
    } catch (error) {
      console.error("Error loading customers:", error)
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
   * 应用搜索和筛选
   */
  useEffect(() => {
    let filtered = [...customers]

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.company_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.includes(searchTerm) ||
          customer.country?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 状态筛选
    if (statusFilter !== "all") {
      filtered = filtered.filter((customer) => customer.status === statusFilter)
    }

    // 细分筛选
    if (segmentFilter !== "all") {
      filtered = filtered.filter((customer) => customer.segment === segmentFilter)
    }

    setFilteredCustomers(filtered)
  }, [searchTerm, statusFilter, segmentFilter, customers])

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadCustomers()
  }, [])

  /**
   * 打开新建客户对话框
   */
  function handleCreate() {
    setEditingCustomer(null)
    setDialogOpen(true)
  }

  /**
   * 打开编辑客户对话框
   */
  function handleEdit(customer: Customer) {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  /**
   * 确认删除客户
   */
  function handleDeleteClick(customer: Customer) {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  /**
   * 执行删除客户
   */
  async function handleDeleteConfirm() {
    if (!customerToDelete) return

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerToDelete.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })

      loadCustomers()
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题和操作按钮 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground mt-1">
              Manage your customer relationships
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Potential">Potential</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 客户统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground">
              Total Customers
            </div>
            <div className="text-2xl font-bold mt-1">{customers.length}</div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground">
              Active
            </div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {customers.filter((c) => c.status === "Active").length}
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground">
              VIP Customers
            </div>
            <div className="text-2xl font-bold mt-1 text-purple-600">
              {customers.filter((c) => c.segment === "VIP").length}
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="text-sm font-medium text-muted-foreground">
              This Month
            </div>
            <div className="text-2xl font-bold mt-1 text-blue-600">
              {
                customers.filter((c) => {
                  const createdDate = new Date(c.created_at)
                  const now = new Date()
                  return (
                    createdDate.getMonth() === now.getMonth() &&
                    createdDate.getFullYear() === now.getFullYear()
                  )
                }).length
              }
            </div>
          </div>
        </div>

        {/* 客户列表表格 */}
        <div className="bg-card rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-muted-foreground">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.company_full_name || "-"}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.country || "-"}</TableCell>
                    <TableCell>
                      {customer.segment ? (
                        <Badge
                          variant="secondary"
                          className={getSegmentColor(customer.segment)}
                        >
                          {customer.segment}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(customer.status)}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/customers/${customer.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(customer)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* 创建/编辑客户对话框 */}
        <CustomerDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          customer={editingCustomer}
          onSuccess={loadCustomers}
        />

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the customer "{customerToDelete?.name}".
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}

