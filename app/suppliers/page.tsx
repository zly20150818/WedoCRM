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
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { StarRating } from "@/components/ui/star-rating"

type SupplierRow = {
  id: string
  name: string
  type: string | null
  primary_contact: string | null
  email: string | null
  phone: string | null
  rating: number | null
}

const PAGE_SIZE = 5

export default function SuppliersPage() {
  const router = useRouter()
  const supabase = createClient()

  const [data, setData] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("suppliers")
        .select("id, name, type, primary_contact, email, phone, rating", { count: "exact" })
        .eq("is_active", true)

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%,primary_contact.ilike.%${searchTerm}%`,
        )
      }

      query = query.order("created_at", { ascending: false })

      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      query = query.range(from, to)

      const { data: results, error, count } = await query

      if (error) throw error

      setData((results as SupplierRow[]) || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error loading suppliers:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const startItem = (currentPage - 1) * PAGE_SIZE + 1
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount)

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Supplier Management
          </h1>
          <Button
            onClick={() => router.push("/suppliers/new")}
            className="flex h-10 items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Supplier</span>
          </Button>
        </div>

        {/* Card containing Toolbar and Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4">
            <div className="relative w-full max-w-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                className="w-full pl-10 h-10 bg-background"
                placeholder="Search by name, product..."
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Button variant="outline" className="flex h-10 items-center justify-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Company Name
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Main Product/Service
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Contact Person
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Rating
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-4 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="px-6 py-4 text-center">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/50">
                      <TableCell className="px-6 py-4 font-medium whitespace-nowrap">
                        {row.name}
                      </TableCell>
                      <TableCell className="px-6 py-4">{row.type || "-"}</TableCell>
                      <TableCell className="px-6 py-4">{row.primary_contact || "-"}</TableCell>
                      <TableCell className="px-6 py-4">{row.email || "-"}</TableCell>
                      <TableCell className="px-6 py-4">{row.phone || "-"}</TableCell>
                      <TableCell className="px-6 py-4">
                        {row.rating !== null && row.rating !== undefined ? (
                          <StarRating rating={row.rating} />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="link"
                          className="font-medium text-primary hover:underline p-0 h-auto"
                          onClick={() => router.push(`/suppliers/${row.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
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

