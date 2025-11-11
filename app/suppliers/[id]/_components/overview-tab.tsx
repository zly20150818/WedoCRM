import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, MapPin, User, Banknote } from "lucide-react"

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
  billing_address: any
  shipping_address: any
}

type SupplierContact = {
  id: string
  name: string
  position: string | null
  department: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  is_primary: boolean
}

type SupplierBankAccount = {
  id: string
  bank_name: string
  account_number: string
  account_holder_name: string | null
  swift_code: string | null
  iban: string | null
  currency: string | null
  is_primary: boolean
}

interface OverviewTabProps {
  supplier: Supplier
  contacts: SupplierContact[]
  bankAccounts: SupplierBankAccount[]
}

// 格式化账号号码，只显示后4位
function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length <= 4) return accountNumber
  const last4 = accountNumber.slice(-4)
  return `**** **** **** ${last4}`
}

// 格式化地址显示
function formatAddress(address: any): string {
  if (!address) return ""
  if (typeof address === "string") return address

  const parts: string[] = []
  if (address.address_line1) parts.push(address.address_line1)
  if (address.address_line2) parts.push(address.address_line2)
  
  // Combine city, state, and postal_code on one line if they exist
  const cityParts: string[] = []
  if (address.city) cityParts.push(address.city)
  if (address.state) cityParts.push(address.state)
  if (address.postal_code) cityParts.push(address.postal_code)
  if (cityParts.length > 0) parts.push(cityParts.join(", "))
  
  if (address.country) parts.push(address.country)

  return parts.join("\n")
}

// 默认头像组件
function ContactAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  if (avatarUrl) {
    return (
      <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
      <span className="text-sm font-medium text-primary">{initials}</span>
    </div>
  )
}

export default function OverviewTab({
  supplier,
  contacts,
  bankAccounts,
}: OverviewTabProps) {
  const primaryBankAccount = bankAccounts.find((account) => account.is_primary) || bankAccounts[0]
  const billingAddress = supplier.billing_address
    ? formatAddress(supplier.billing_address)
    : supplier.address || ""
  const shippingAddress = supplier.shipping_address
    ? formatAddress(supplier.shipping_address)
    : ""

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {supplier.business_registration_no && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Business Registration No.
                  </div>
                  <div className="text-sm font-medium">{supplier.business_registration_no}</div>
                </div>
              )}
              {supplier.tax_id && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tax ID</div>
                  <div className="text-sm font-medium">{supplier.tax_id}</div>
                </div>
              )}
              {(supplier.industry || supplier.type) && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Industry</div>
                  <div className="text-sm font-medium">{supplier.industry || supplier.type}</div>
                </div>
              )}
              {supplier.website && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Website</div>
                  <div className="text-sm font-medium">
                    <a
                      href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bank Information */}
        {primaryBankAccount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Bank Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Bank Name</div>
                  <div className="text-sm font-medium">{primaryBankAccount.bank_name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Account Number</div>
                  <div className="text-sm font-medium font-mono">
                    {maskAccountNumber(primaryBankAccount.account_number)}
                  </div>
                </div>
                {(primaryBankAccount.swift_code || primaryBankAccount.iban) && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">SWIFT / IBAN</div>
                    <div className="text-sm font-medium font-mono">
                      {primaryBankAccount.swift_code && primaryBankAccount.iban
                        ? `${primaryBankAccount.swift_code} / ${primaryBankAccount.iban}`
                        : primaryBankAccount.swift_code || primaryBankAccount.iban}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Address Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Billing Address */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  BILLING ADDRESS
                </div>
                <div className="text-sm whitespace-pre-line">
                  {billingAddress || (
                    <span className="text-muted-foreground italic">No billing address</span>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {shippingAddress && (
                <div className="pt-4 border-t border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    SHIPPING ADDRESS
                  </div>
                  <div className="text-sm whitespace-pre-line">{shippingAddress}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Contacts */}
        {contacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Main Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div key={contact.id} className="flex items-start gap-3">
                    <ContactAvatar name={contact.name} avatarUrl={contact.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{contact.name}</div>
                      {contact.position && (
                        <div className="text-xs text-muted-foreground">{contact.position}</div>
                      )}
                      {contact.department && contact.position && (
                        <div className="text-xs text-muted-foreground">
                          {contact.department}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
