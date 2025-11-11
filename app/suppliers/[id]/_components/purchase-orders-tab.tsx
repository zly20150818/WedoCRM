"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PurchaseOrdersTabProps {
  supplierId: string
}

export default function PurchaseOrdersTab({ supplierId }: PurchaseOrdersTabProps) {
  // TODO: Implement purchase orders loading from database
  // For now, showing empty state

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <p>No purchase orders found.</p>
          <p className="text-sm mt-2">
            Purchase orders will be displayed here when available.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
