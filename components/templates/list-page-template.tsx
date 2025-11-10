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
import { Search, Plus, Eye, Edit, Trash2, Calendar as CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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
  const [sortDirection, setSortDirection] = useState(config.defaultSort.direction)
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

  return (
    <div className="p-8">
      {/* 页面标题和创建按钮 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{config.title}</h1>
        <Button onClick={() => router.push(config.createRoute)}>
          <Plus className="mr-2 h-4 w-4" />
          {config.createButtonText}
        </Button>
      </div>

      {/* 搜索和筛选器 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* 搜索框 */}
          {config.search.enabled && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={config.search.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* 动态筛选器 */}
          {config.filters.map((filter) => {
            if (filter.type === "select") {
              const options = filterOptions[filter.field] || []
              return (
                <div key={filter.field} className="relative">
                  {filter.icon && (
                    <filter.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  )}
                  <Select
                    value={filters[filter.field] || ""}
                    onValueChange={(value) =>
                      setFilters({ ...filters, [filter.field]: value || null })
                    }
                  >
                    <SelectTrigger className={filter.icon ? "pl-10" : ""}>
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
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
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

        {/* 状态标签 */}
        {config.statusTabs.enabled && (
          <div className="flex gap-2 flex-wrap">
            {config.statusTabs.options.map((option) => (
              <Button
                key={option.value}
                variant={selectedStatus === option.value ? "default" : "outline"}
                onClick={() => setSelectedStatus(option.value)}
                className="rounded-full"
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}
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
              {config.actions.length > 0 && <TableHead>ACTIONS</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={config.columns.length + 1} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={config.columns.length + 1} className="text-center py-8">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row[config.idField]}>
                  {config.columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || "-"}
                    </TableCell>
                  ))}
                  {config.actions.length > 0 && (
                    <TableCell>
                      <div className="flex gap-2">
                        {config.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant={action.variant}
                            size="sm"
                            onClick={() => router.push(action.href(row))}
                          >
                            <action.icon className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * config.pagination.pageSize + 1} to{" "}
            {Math.min(currentPage * config.pagination.pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
