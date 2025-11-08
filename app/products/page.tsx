"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/layout/main-layout"
import { Package } from "lucide-react"

/**
 * 产品管理页面
 * 显示产品列表和管理功能
 */
export default function ProductsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-2">
              Manage your products and inventory
            </p>
          </div>
        </div>

        {/* 占位卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Products Management</CardTitle>
            </div>
            <CardDescription>Product features coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Products Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This page is ready for you to add product management features.
              </p>
              <p className="text-xs text-muted-foreground">
                Suggested features: Product catalog, inventory tracking, pricing management, etc.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

