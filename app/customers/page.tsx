/**
 * customers 列表页
 * 
 * 自动生成，请根据需要调整
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
import { Search, Plus, Eye, Edit } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"

const CONFIG = {
  title: "customers",
  createButtonText: "Create New customer",
  createRoute: "/customers/new",
  
  table: "customers",
  idField: "id",
  
  search: {
    enabled: true,
    placeholder: "Search by name, email, phone",
    fields: ["name","email","phone"],
  },
  
  statusTabs: {
    enabled: false,
    field: "",
    options: [],
  },
  
  columns: [
    {
      key: "name",
      label: "NAME",
      sortable: true,
    },
    {
      key: "email",
      label: "EMAIL",
      sortable: true,
    },
    {
      key: "phone",
      label: "PHONE",
      sortable: true,
    },
  ],
  
  pagination: {
    pageSize: 20,
  },
  
  defaultSort: {
    field: "created_at",
    direction: "desc" as const,
  },
}

export default function CustomersPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortField, setSortField] = useState(CONFIG.defaultSort.field)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(CONFIG.defaultSort.direction as "asc" | "desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [searchTerm, selectedStatus, sortField, sortDirection, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from(CONFIG.table)
        .select("*", { count: "exact" })

      if (searchTerm && CONFIG.search.enabled) {
        const conditions = CONFIG.search.fields
          .map((f) => `${f}.ilike.%${searchTerm}%`)
          .join(",")
        query = query.or(conditions)
      }

      if (selectedStatus !== "all" && CONFIG.statusTabs.enabled) {
        query = query.eq(CONFIG.statusTabs.field, selectedStatus)
      }

      query = query.order(sortField, { ascending: sortDirection === "asc" })

      const from = (currentPage - 1) * CONFIG.pagination.pageSize
      const to = from + CONFIG.pagination.pageSize - 1
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

  const totalPages = Math.ceil(totalCount / CONFIG.pagination.pageSize)

  return (
    <MainLayout>
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{CONFIG.title}</h1>
        <Button onClick={() => router.push(CONFIG.createRoute)}>
          <Plus className="mr-2 h-4 w-4" />
          {CONFIG.createButtonText}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={CONFIG.search.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {CONFIG.columns.map((column: any) => (
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
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={CONFIG.columns.length + 1} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={CONFIG.columns.length + 1} className="text-center py-8">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row[CONFIG.idField]}>
                  {CONFIG.columns.map((column: any) => (
                    <TableCell key={column.key}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || "-"}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/customers/${row.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/customers/${row.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * CONFIG.pagination.pageSize + 1} to{" "}
            {Math.min(currentPage * CONFIG.pagination.pageSize, totalCount)} of {totalCount} results
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
    </MainLayout>
  )
}


