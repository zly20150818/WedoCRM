"use client"

/**
 * 系统配置管理页面
 * 管理外贸系统的基础数据配置
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PortsConfig } from "@/components/config/ports-config"
import { IncotermsConfig } from "@/components/config/incoterms-config"
import { ShippingMethodsConfig } from "@/components/config/shipping-methods-config"
import { PaymentTermsConfig } from "@/components/config/payment-terms-config"
import { UnitsConfig } from "@/components/config/units-config"

export default function ConfigPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground">
          Manage basic data configuration for the export management system
        </p>
      </div>

      <Tabs defaultValue="ports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ports">Ports</TabsTrigger>
          <TabsTrigger value="incoterms">Incoterms</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Methods</TabsTrigger>
          <TabsTrigger value="payment">Payment Terms</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
        </TabsList>

        <TabsContent value="ports">
          <Card>
            <CardHeader>
              <CardTitle>Port Management</CardTitle>
              <CardDescription>
                Manage ports and terminals information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortsConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoterms">
          <Card>
            <CardHeader>
              <CardTitle>Incoterms Management</CardTitle>
              <CardDescription>
                Manage international commercial terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncotermsConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Methods Management</CardTitle>
              <CardDescription>
                Manage shipping and transportation methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingMethodsConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Terms Management</CardTitle>
              <CardDescription>
                Manage payment terms and conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentTermsConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="units">
          <Card>
            <CardHeader>
              <CardTitle>Units of Measurement Management</CardTitle>
              <CardDescription>
                Manage units of measurement for products and shipping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnitsConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

