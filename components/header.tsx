"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Bell,
  Search,
  Menu,
} from "lucide-react"
// import { useTheme } from "next-themes"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    // icon: BarChart3,
  },
  {
    title: "Projects",
    href: "/projects",
    // icon: FolderKanban,
  },
  {
    title: "Customers",
    href: "/customers",
    // icon: Users,
  },
  {
    title: "Suppliers",
    href: "/suppliers",
    // icon: Factory,
  },
  {
    title: "Sales Orders",
    href: "#", // Assuming sales orders page doesn't exist yet
    // icon: ShoppingCart,
  },
  {
    title: "Purchase Orders",
    href: "/purchase-orders",
    // icon: ShoppingCart,
  },
  {
    title: "Settings",
    href: "/settings",
    // icon: Database,
  },
]

export function Header() {
  // const { theme, setTheme } = useTheme()
  // const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // const handleLogout = async () => {
  //   await logout()
  //   router.push("/login")
  // }

  // const handleSettings = () => {
  //   router.push("/settings")
  //   setMobileMenuOpen(false)
  // }

  // const handleProfile = () => {
  //   router.push("/profile")
  //   setMobileMenuOpen(false)
  // }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between whitespace-nowrap border-b border-border-light-html bg-content-light-html px-6 dark:border-border-dark-html dark:bg-content-dark-html">
      {/* Left: Logo and Navigation */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="text-primary-html size-8">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fillRule="evenodd"></path>
              <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fillRule="evenodd"></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold">AlustarsCRM</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          {menuItems.map((item) => {
            // const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "rounded-md bg-primary-html/10 px-3 py-2 text-sm font-medium text-primary-html dark:bg-primary-html/20"
                    : "rounded-md px-3 py-2 text-sm font-medium text-text-light-secondary-html hover:bg-background-light-html hover:text-text-light-primary-html dark:text-text-dark-secondary-html dark:hover:bg-background-dark-html dark:hover:text-text-dark-primary-html"
                }
              >
                {/* <Icon className="h-4 w-4" /> */}
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Right: Search, Notifications, User Menu */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:block max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-light-secondary-html dark:text-text-dark-secondary-html" />
            <input
              placeholder="Search..."
              className="form-input h-10 w-full rounded-md border-border-light-html bg-background-light-html py-2 pl-10 pr-4 text-sm placeholder:text-text-light-secondary-html focus:border-primary-html focus:ring-primary-html dark:border-border-dark-html dark:bg-background-dark-html dark:placeholder:text-text-dark-secondary-html"
              type="search"
            />
          </div>
        </div>

        {/* Notifications */}
        <button className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-background-light-html dark:bg-background-dark-html">
          <Bell className="h-5 w-5 text-text-light-secondary-html dark:text-text-dark-secondary-html" />
        </button>

        {/* User Avatar */}
        <div className="h-10 w-10 rounded-full bg-cover bg-center" data-alt="User avatar" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1PX1pxJ2ExtXWOhU3izFS5R6wBhp_7YmPiB3t02kOIBF1kgYK3aXvLNr4cxUfzsSWkgn0Qmsr5ynas9oQl7n5fJiATlo5TrwE3T6VDgRVukeboW_l14-FhKlHAscn7zTcPq4Z7B7qvTo3MqByHdRmL81zv1nKkgvrf2VKunqf9CrN9H8DABjO8RZ_peW4WO468RByk5EjyVfz7CVVP0fDZ7b24du1nX7cX-s5Zg3x3Z0w7qFYxWFsvb6_jkdnGpx_EOIEPTMJdtM")' }}></div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col space-y-2">
              {menuItems.map((item) => {
                // const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button
                      // variant={isActive ? "secondary" : "ghost"}
                      className={
                        isActive
                          ? "w-full justify-start gap-3 rounded-md bg-primary-html/10 px-3 py-2 text-primary-html font-semibold"
                          : "w-full justify-start gap-3 rounded-md px-3 py-2 text-text-light-secondary-html hover:bg-background-light-html hover:text-text-light-primary-html dark:text-text-dark-secondary-html dark:hover:bg-background-dark-html dark:hover:text-text-dark-primary-html"
                      }
                    >
                      {/* <Icon className="h-5 w-5" /> */}
                      <span>{item.title}</span>
                    </button>
                  </Link>
                )
              })}
              <div className="pt-4 border-t border-border-light-html dark:border-border-dark-html">
                {/* <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={handleProfile}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={handleSettings}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button> */}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
