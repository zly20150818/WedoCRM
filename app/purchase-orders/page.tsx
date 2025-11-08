"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Search, Pencil, Eye, FileText } from "lucide-react"
import { PurchaseOrderDialog } from "@/components/purchase-orders/purchase-order-dialog"
import { format } from "date-fns"

/**
 * 采购订单类型定义
 */
interface PurchaseOrder {
  id: string
  po_number: string
  project_id: string
  supplier_id: string
  sales_order_id: string | null
  purchase_request_id: string | null
  items: any
  currency: string
  base_currency: string
  exchange_rate: number
  exchange_date: string
  delivery_date: string | null
  terms: string | null
  status: string
  notes: string | null
  received_at: string | null
  received_by: string | null
  storage_location: string | null
  receiving_photos: any
  receiving_notes: string | null
  qc_status: string | null
  qc_checked_at: string | null
  qc_checked_by: string | null
  qc_passed: boolean | null
  qc_issues: string | null
  qc_photos: any
  qc_action: string | null
  qc_checklist: any
  created_at: string
  updated_at: string
  // 关联数据
  supplier?: {
    name: string
  }
  project?: {
    name: string
    project_number: string
  }
}

/**
 * 采购订单管理页面
 */
export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | undefined>()
  const { toast } = useToast()
  const supabase = createClient()

  /**
   * 加载采购订单列表
   */
  const loadPurchaseOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          supplier:suppliers(name),
          project:projects(name, project_number)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPurchaseOrders(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load purchase orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPurchaseOrders()
  }, [])

  /**
   * 过滤采购订单列表
   */
  const filteredPOs = purchaseOrders.filter((po) => {
    const search = searchTerm.toLowerCase()
    return (
      po.po_number.toLowerCase().includes(search) ||
      po.supplier?.name?.toLowerCase().includes(search) ||
      po.project?.project_number?.toLowerCase().includes(search)
    )
  })

  /**
   * 打开新建采购订单对话框
   */
  const handleCreate = () => {
    setSelectedPO(undefined)
    setDialogOpen(true)
  }

  /**
   * 打开编辑采购订单对话框
   */
  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po)
    setDialogOpen(true)
  }

  /**
   * 查看采购订单详情
   */
  const handleView = (po: PurchaseOrder) => {
    // TODO: 实现查看详情功能
    toast({
      title: "View Purchase Order",
      description: `Viewing PO: ${po.po_number}`,
    })
  }

  /**
   * 计算采购订单总金额
   */
  const calculateTotal = (items: any): number => {
    if (!items || !Array.isArray(items)) return 0
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const unitPrice = parseFloat(item.unit_price) || 0
      return sum + quantity * unitPrice
    }, 0)
  }

  /**
   * 获取状态徽章样式
   */
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      Pending: { label: "Pending", className: "bg-yellow-500" },
      Approved: { label: "Approved", className: "bg-blue-500" },
      Ordered: { label: "Ordered", className: "bg-purple-500" },
      PartiallyReceived: { label: "Partially Received", className: "bg-orange-500" },
      Received: { label: "Received", className: "bg-green-500" },
      Cancelled: { label: "Cancelled", className: "bg-red-500" },
      Completed: { label: "Completed", className: "bg-gray-500" },
    }

    const config = statusMap[status] || { label: status, className: "" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  /**
   * 获取质检状态徽章
   */
  const getQCStatusBadge = (qcStatus: string | null, qcPassed: boolean | null) => {
    if (!qcStatus) return <Badge variant="outline">No QC</Badge>
    
    if (qcStatus === "Pending") {
      return <Badge className="bg-yellow-500">QC Pending</Badge>
    }
    
    if (qcStatus === "Completed") {
      if (qcPassed === true) {
        return <Badge className="bg-green-500">QC Passed</Badge>
      } else if (qcPassed === false) {
        return <Badge className="bg-red-500">QC Failed</Badge>
      }
    }

    return <Badge variant="outline">{qcStatus}</Badge>
  }

  return (
    <MainLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Manage purchase orders and track procurement status
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索栏 */}
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO number, supplier, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* 采购订单列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPOs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm ? "No purchase orders found" : "No purchase orders yet"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>QC Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">
                        {po.po_number}
                      </TableCell>
                      <TableCell>{po.supplier?.name || "-"}</TableCell>
                      <TableCell>
                        {po.project?.project_number || "-"}
                      </TableCell>
                      <TableCell>
                        {po.currency} {calculateTotal(po.items).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {po.delivery_date
                          ? format(new Date(po.delivery_date), "yyyy-MM-dd")
                          : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell>
                        {getQCStatusBadge(po.qc_status, po.qc_passed)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(po)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(po)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Generate Document",
                                description: "Document generation coming soon",
                              })
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 采购订单对话框 */}
      <PurchaseOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        purchaseOrder={selectedPO}
        onSuccess={loadPurchaseOrders}
      />
    </MainLayout>
  )
}

