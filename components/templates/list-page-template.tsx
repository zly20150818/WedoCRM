/**
 * 📋 列表页面模板
 * 
 * 使用方法：
 * 1. 复制此文件到你的页面目录（如 app/orders/page.tsx）
 * 2. 修改 CONFIG 对象配置表名、字段、筛选器等
 * 3. 根据需要调整样式和功能
 * 
 * 功能特性：
 * - ✅ 搜索功能
 * - ✅ 多筛选器（下拉选择、日期范围等）
 * - ✅ 状态标签筛选
 * - ✅ 表格显示
 * - ✅ 分页
 * - ✅ 排序
 * - ✅ 操作按钮（查看、编辑、删除等）
 * - ✅ 响应式设计
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Plus, Eye, Edit, Trash2, Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { MainLayout } from "@/components/layout/main-layout"

// ==================== 配置区域 ====================
// 📝 复制文件后，主要修改这个配置对象

const CONFIG = {
  // 页面基本信息
  title: "Sales Orders",
  createButtonText: "Create New Order",
  createRoute: "/orders/new",
  
  // Supabase 表配置
  table: "orders",
  
  // 主键字段
  idField: "id",
  
  // 搜索配置
  search: {
    enabled: true,
    placeholder: "Search by Order # or Project Name",
    fields: ["order_number", "customer_name"], // 要搜索的字段
  },
  
  // 状态标签配置
  statusTabs: {
    enabled: true,
    field: "status", // 状态字段名
    options: [
      { value: "all", label: "All Statuses" },
      { value: "Pending", label: "Pending" },
      { value: "Processing", label: "Processing" },
      { value: "Shipped", label: "Shipped" },
      { value: "Delivered", label: "Delivered" },
      { value: "Canceled", label: "Canceled" },
    ],
  },
  
  // 筛选器配置
  filters: [
    {
      type: "select" as const,
      field: "customer_id",
      label: "Filter by Customer",
      placeholder: "All Customers",
      icon: Filter,
      // 如果是关联表，配置关联查询
      relation: {
        table: "customers",
        valueField: "id",
        labelField: "name",
      },
    },
    {
      type: "dateRange" as const,
      field: "expected_delivery_date",
      label: "Delivery Date Range",
      icon: CalendarIcon,
    },
  ],
  
  // 表格列配置
  columns: [
    {
      key: "order_number",
      label: "ORDER #",
      sortable: true,
      render: (value: string, row: any) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: "customer_name",
      label: "PROJECT NAME",
      sortable: true,
    },
    {
      key: "customer_name",
      label: "CUSTOMER",
      sortable: true,
    },
    {
      key: "total_amount",
      label: "TOTAL AMOUNT",
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: "expected_delivery_date",
      label: "DELIVERY DATE",
      sortable: true,
      render: (value: string) => value ? format(new Date(value), "yyyy-MM-dd") : "-",
    },
    {
      key: "status",
      label: "STATUS",
      sortable: true,
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          Pending: "bg-yellow-100 text-yellow-800",
          Processing: "bg-blue-100 text-blue-800",
          Shipped: "bg-green-100 text-green-800",
          Delivered: "bg-green-100 text-green-800",
          Canceled: "bg-red-100 text-red-800",
        }
        return (
          <Badge className={cn("", statusColors[value] || "bg-gray-100 text-gray-800")}>
            {value}
          </Badge>
        )
      },
    },
  ],
  
  // 操作按钮配置
  actions: [
    {
      icon: Eye,
      label: "View",
      href: (row: any) => `/orders/${row.id}`,
      variant: "ghost" as const,
    },
    {
      icon: Edit,
      label: "Edit",
      href: (row: any) => `/orders/${row.id}/edit`,
      variant: "ghost" as const,
    },
  ],
  
  // 分页配置
  pagination: {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  // 默认排序
  defaultSort: {
    field: "created_at",
    direction: "desc" as const,
  },
}

// ==================== 组件实现 ====================

interface ListPageTemplateProps {
  config?: typeof CONFIG
}

export default function ListPageTemplate({ config = CONFIG }: ListPageTemplateProps) {
  const router = useRouter()
  const supabase = createClient()
  
  // 状态管理
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortField, setSortField] = useState(config.defaultSort.field)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(config.defaultSort.direction as "asc" | "desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filterOptions, setFilterOptions] = useState<Record<string, any[]>>({})

  // 加载筛选器选项（关联表数据）
  useEffect(() => {
    const loadFilterOptions = async () => {
      for (const filter of config.filters) {
        if (filter.type === "select" && filter.relation) {
          const { data } = await supabase
            .from(filter.relation.table)
            .select(`${filter.relation.valueField}, ${filter.relation.labelField}`)
            .order(filter.relation.labelField)
          
          if (data) {
            setFilterOptions(prev => ({
              ...prev,
              [filter.field]: data,
            }))
          }
        }
      }
    }
    loadFilterOptions()
  }, [])

  // 加载数据
  useEffect(() => {
    loadData()
  }, [searchTerm, selectedStatus, filters, sortField, sortDirection, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from(config.table)
        .select("*", { count: "exact" })

      // 搜索
      if (searchTerm && config.search.enabled) {
        const searchConditions = config.search.fields
          .map(field => `${field}.ilike.%${searchTerm}%`)
          .join(",")
        query = query.or(searchConditions)
      }

      // 状态筛选
      if (selectedStatus !== "all" && config.statusTabs.enabled) {
        query = query.eq(config.statusTabs.field, selectedStatus)
      }

      // 其他筛选器
      Object.entries(filters).forEach(([field, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            // 日期范围
            if (value[0]) query = query.gte(field, value[0])
            if (value[1]) query = query.lte(field, value[1])
          } else {
            query = query.eq(field, value)
          }
        }
      })

      // 排序
      query = query.order(sortField, { ascending: sortDirection === "asc" })

      // 分页
      const from = (currentPage - 1) * config.pagination.pageSize
      const to = from + config.pagination.pageSize - 1
      query = query.range(from, to)

      const { data: results, error, count } = await query

      if (error) throw error

      setData(results || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const totalPages = Math.ceil(totalCount / config.pagination.pageSize)
  const startItem = (currentPage - 1) * config.pagination.pageSize + 1
  const endItem = Math.min(currentPage * config.pagination.pageSize, totalCount)

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题和创建按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {config.title}
          </h1>
          <Button
            onClick={() => router.push(config.createRoute)}
            className="flex h-10 items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>{config.createButtonText}</span>
          </Button>
        </div>

        {/* Card containing Toolbar and Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4">
            {/* 搜索框 */}
            {config.search.enabled && (
              <div className="relative w-full max-w-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  className="w-full pl-10 h-10 bg-background"
                  placeholder={config.search.placeholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            )}

            {/* 动态筛选器 */}
            {config.filters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {config.filters.map((filter) => {
                  if (filter.type === "select") {
                    const options = filterOptions[filter.field] || []
                    const hasIcon = "icon" in filter && filter.icon
                    return (
                      <div key={filter.field} className="relative">
                        {hasIcon && (
                          <filter.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                        )}
                        <Select
                          value={filters[filter.field] || ""}
                          onValueChange={(value) => {
                            setFilters({ ...filters, [filter.field]: value || null })
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className={cn("h-10", hasIcon && "pl-10")}>
                            <SelectValue placeholder={filter.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            {options.map((option: any) => (
                              <SelectItem
                                key={option[filter.relation!.valueField]}
                                value={option[filter.relation!.valueField]}
                              >
                                {option[filter.relation!.labelField]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  }

                  if (filter.type === "dateRange") {
                    return (
                      <Popover key={filter.field}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-10 justify-start text-left font-normal">
                            {filter.icon && <filter.icon className="mr-2 h-4 w-4" />}
                            {filters[filter.field]?.[0]
                              ? `${format(new Date(filters[filter.field][0]), "PP")} - ${
                                  filters[filter.field][1]
                                    ? format(new Date(filters[filter.field][1]), "PP")
                                    : "..."
                                }`
                              : filter.label}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={{
                              from: filters[filter.field]?.[0]
                                ? new Date(filters[filter.field][0])
                                : undefined,
                              to: filters[filter.field]?.[1]
                                ? new Date(filters[filter.field][1])
                                : undefined,
                            }}
                            onSelect={(range) => {
                              setFilters({
                                ...filters,
                                [filter.field]: range?.from
                                  ? [range.from.toISOString(), range?.to?.toISOString() || null]
                                  : null,
                              })
                              setCurrentPage(1)
                            }}
                            numberOfMonths={2}
                          />
                        </PopoverContent>
                      </Popover>
                    )
                  }

                  return null
                })}
              </div>
            )}

            {/* 如果没有筛选器，显示一个占位符来保持布局 */}
            {config.filters.length === 0 && !config.search.enabled && <div />}
          </div>

          {/* 状态标签 - 在工具栏下方，卡片内部 */}
          {config.statusTabs.enabled && (
            <div className="flex gap-2 flex-wrap px-4 pt-4 pb-4 border-b border-border">
              {config.statusTabs.options.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedStatus === option.value ? "default" : "outline"}
                  onClick={() => {
                    setSelectedStatus(option.value)
                    setCurrentPage(1)
                  }}
                  className="rounded-full h-8"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {config.columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "px-6 py-3 text-xs font-medium uppercase text-muted-foreground",
                        column.sortable && "cursor-pointer hover:bg-muted/70"
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && sortField === column.key && (
                          <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {config.actions.length > 0 && (
                    <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground text-right">
                      Action
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={config.columns.length + (config.actions.length > 0 ? 1 : 0)}
                      className="px-6 py-4 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={config.columns.length + (config.actions.length > 0 ? 1 : 0)}
                      className="px-6 py-4 text-center"
                    >
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row[config.idField]} className="hover:bg-muted/50">
                      {config.columns.map((column) => (
                        <TableCell key={column.key} className="px-6 py-4">
                          {column.render
                            ? (column as any).render(row[column.key], row)
                            : row[column.key] || "-"}
                        </TableCell>
                      ))}
                      {config.actions.length > 0 && (
                        <TableCell className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            {config.actions.map((action, index) => {
                              // 如果是第一个操作且只有查看操作，使用链接样式
                              if (index === 0 && config.actions.length === 1 && action.label === "View") {
                                return (
                                  <Button
                                    key={index}
                                    variant="link"
                                    className="font-medium text-primary hover:underline p-0 h-auto"
                                    onClick={() => router.push(action.href(row))}
                                  >
                                    View Details
                                  </Button>
                                )
                              }
                              return (
                                <Button
                                  key={index}
                                  variant={action.variant}
                                  size="sm"
                                  onClick={() => router.push(action.href(row))}
                                  title={action.label}
                                >
                                  <action.icon className="h-4 w-4" />
                                </Button>
                              )
                            })}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <nav
              aria-label="Table navigation"
              className="flex items-center justify-between p-4 border-t border-border"
            >
              <span className="text-sm font-normal text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{startItem}</span> to{" "}
                <span className="font-semibold text-foreground">{endItem}</span> of{" "}
                <span className="font-semibold text-foreground">{totalCount}</span>
              </span>
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  if (pageNum > totalPages) return null

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "secondary" : "ghost"}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
