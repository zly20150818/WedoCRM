import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from "@/components/ui/star-rating"
import { Mail, Phone, Pencil } from "lucide-react"
import Link from "next/link"
import OverviewTab from "./_components/overview-tab"
import ProductsTab from "./_components/products-tab"
import PurchaseOrdersTab from "./_components/purchase-orders-tab"
import NotesTab from "./_components/notes-tab"

type Supplier = {
  id: string
  supplier_number: string
  name: string
  name_cn: string | null
  type: string | null
  industry: string | null
  country: string
  city: string | null
  address: string | null
  website: string | null
  tax_id: string | null
  business_registration_no: string | null
  rating: number | null
  review_count: number | null
  payment_term: string | null
  currency: string | null
  primary_contact: string | null
  email: string | null
  phone: string | null
  billing_address: any
  shipping_address: any
  tags: string[] | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type SupplierContact = {
  id: string
  supplier_id: string
  name: string
  position: string | null
  department: string | null
  email: string
  phone: string | null
  mobile: string | null
  wechat: string | null
  whatsapp: string | null
  is_primary: boolean
  avatar_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

type SupplierBankAccount = {
  id: string
  supplier_id: string
  bank_name: string
  account_number: string
  account_holder_name: string | null
  swift_code: string | null
  iban: string | null
  currency: string | null
  is_primary: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

type Product = {
  id: string
  sku: string
  name: string
  description: string | null
  price: number | null
  currency: string | null
  status: string | null
}

async function loadData(id: string) {
  const supabase = await createClient()

  // Load supplier基本信息
  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single<Supplier>()

  if (supplierError || !supplier) {
    return {
      supplier: null,
      contacts: [],
      bankAccounts: [],
      products: [],
    }
  }

  // Load supplier contacts
  const { data: contacts } = await supabase
    .from("supplier_contacts")
    .select("*")
    .eq("supplier_id", id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })

  // Load bank accounts
  const { data: bankAccounts } = await supabase
    .from("supplier_bank_accounts")
    .select("*")
    .eq("supplier_id", id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })

  // Load products for this supplier
  const { data: products } = await supabase
    .from("products")
    .select("id, sku, name, description, price, currency, status")
    .eq("supplier_id", id)
    .order("created_at", { ascending: false })

  return {
    supplier,
    contacts: (contacts as SupplierContact[]) || [],
    bankAccounts: (bankAccounts as SupplierBankAccount[]) || [],
    products: (products as Product[]) || [],
  }
}

export default async function SupplierDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { supplier, contacts, bankAccounts, products } = await loadData(params.id)

  if (!supplier) return notFound()

  const rating = supplier.rating || 0
  const reviewCount = supplier.review_count || 0

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
                {supplier.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mb-3">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <StarRating rating={rating} />
                  <span className="text-sm text-muted-foreground">
                    {rating.toFixed(1)}
                    {reviewCount > 0 && ` (${reviewCount} Reviews)`}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {/* Email */}
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${supplier.email}`}
                      className="hover:text-foreground hover:underline"
                    >
                      {supplier.email}
                    </a>
                  </div>
                )}
                {/* Phone */}
                {supplier.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${supplier.phone}`}
                      className="hover:text-foreground hover:underline"
                    >
                      {supplier.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <Link href={`/suppliers/${supplier.id}/edit`}>
                <Button className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Supplier
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab
              supplier={supplier}
              contacts={contacts}
              bankAccounts={bankAccounts}
            />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <ProductsTab supplierId={supplier.id} products={products} />
          </TabsContent>

          <TabsContent value="purchase-orders" className="mt-6">
            <PurchaseOrdersTab supplierId={supplier.id} />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <NotesTab supplierId={supplier.id} notes={supplier.notes} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
