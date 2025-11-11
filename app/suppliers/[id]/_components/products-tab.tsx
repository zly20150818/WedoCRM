"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  price: number | null
  currency: string | null
  status: string | null
}

interface ProductsTabProps {
  supplierId: string
  products: Product[]
}

export default function ProductsTab({ supplierId, products: initialProducts }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // Filter products based on search term
  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      (product.description && product.description.toLowerCase().includes(search))
    )
  })

  const formatPrice = (price: number | null, currency: string | null) => {
    if (price === null) return "—"
    const currencySymbol = currency === "USD" ? "$" : currency === "CNY" ? "¥" : currency || ""
    return `${currencySymbol}${price.toLocaleString()}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Products</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                className="pl-10 h-9"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No products found matching your search." : "No products available."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    SKU
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Product Name
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Description
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Price
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-xs font-medium uppercase text-muted-foreground text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="px-6 py-4 font-medium">{product.sku}</TableCell>
                    <TableCell className="px-6 py-4">{product.name}</TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {product.description || "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {formatPrice(product.price, product.currency)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {product.status || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="link" className="h-auto p-0 font-medium">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
