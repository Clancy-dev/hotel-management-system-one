"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Building2,
  Users,
  Calendar,
  Settings,
  BarChart3,
  UserCheck,
  CreditCard,
  FileText,
  HelpCircle,
  Bell,
  MessageSquare,
  Coffee,
  Utensils,
  Wifi,
  Phone,
  ShieldCheck,
  Briefcase,
  Bed,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const routes = [
  {
    title: "Admin Dashboard",
    url: "/admin",
    icon: BarChart3,
    category: "Dashboards",
    description: "Overview of hotel performance and analytics",
  },
  {
    title: "Receptionist Dashboard",
    url: "/receptionist",
    icon: UserCheck,
    category: "Dashboards",
    description: "Front desk operations and guest management",
  },
  {
    title: "Room Management",
    url: "/rooms",
    icon: Building2,
    category: "Management",
    description: "Manage room inventory and status",
  },
  {
    title: "Staff Management",
    url: "/staff",
    icon: Users,
    category: "Management",
    description: "Employee schedules and management",
  },
  {
    title: "Reservations",
    url: "/reservations",
    icon: Calendar,
    category: "Management",
    description: "Booking and reservation management",
  },
  {
    title: "Billing & Payments",
    url: "/billing",
    icon: CreditCard,
    category: "Management",
    description: "Financial transactions and billing",
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileText,
    category: "Management",
    description: "Generate and view system reports",
  },
  {
    title: "Housekeeping",
    url: "/housekeeping",
    icon: Bed,
    category: "Hotel Services",
    description: "Room cleaning and maintenance schedules",
  },
  {
    title: "Room Service",
    url: "/room-service",
    icon: Coffee,
    category: "Hotel Services",
    description: "In-room dining and service requests",
  },
  {
    title: "Restaurant",
    url: "/restaurant",
    icon: Utensils,
    category: "Hotel Services",
    description: "Restaurant operations and reservations",
  },
  {
    title: "Concierge",
    url: "/concierge",
    icon: Bell,
    category: "Hotel Services",
    description: "Guest services and recommendations",
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: ShieldCheck,
    category: "Hotel Services",
    description: "Facility maintenance and repairs",
  },
  {
    title: "WiFi Management",
    url: "/wifi",
    icon: Wifi,
    category: "Hotel Services",
    description: "Network and internet management",
  },
  {
    title: "Guest Messages",
    url: "/messages",
    icon: MessageSquare,
    category: "Hotel Services",
    description: "Guest communication and messages",
  },
  {
    title: "Phone Directory",
    url: "/directory",
    icon: Phone,
    category: "Hotel Services",
    description: "Internal and external phone directory",
  },
  {
    title: "Business Center",
    url: "/business",
    icon: Briefcase,
    category: "Hotel Services",
    description: "Business services and facilities",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    category: "System",
    description: "System configuration and preferences",
  },
  {
    title: "Help & Support",
    url: "/help",
    icon: HelpCircle,
    category: "System",
    description: "Documentation and support resources",
  },
]

interface SearchCommandProps {
  isMobile?: boolean
}

export function SearchCommand({ isMobile = false }: SearchCommandProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredRoutes = React.useMemo(() => {
    if (!search) return routes

    return routes.filter(
      (route) =>
        route.title.toLowerCase().includes(search.toLowerCase()) ||
        route.description.toLowerCase().includes(search.toLowerCase()) ||
        route.category.toLowerCase().includes(search.toLowerCase()),
    )
  }, [search])

  const groupedRoutes = React.useMemo(() => {
    const groups: Record<string, typeof routes> = {}
    filteredRoutes.forEach((route) => {
      if (!groups[route.category]) {
        groups[route.category] = []
      }
      groups[route.category].push(route)
    })
    return groups
  }, [filteredRoutes])

  const handleSelect = (url: string) => {
    setOpen(false)
    setSearch("")
    router.push(url)
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (isMobile) {
    return (
      <>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Search className="h-4 w-4" />
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search pages, features, and more..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedRoutes).map(([category, categoryRoutes]) => (
              <CommandGroup key={category} heading={category}>
                {categoryRoutes.map((route) => {
                  const Icon = route.icon
                  return (
                    <CommandItem
                      key={route.url}
                      value={`${route.title} ${route.description} ${route.category}`}
                      onSelect={() => handleSelect(route.url)}
                      className="flex items-center gap-2 p-3"
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{route.title}</span>
                        <span className="text-xs text-muted-foreground">{route.description}</span>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </CommandDialog>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-muted-foreground">
          <Search className="mr-2 h-4 w-4" />
          <span>Search pages... (⌘K)</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages, features, and more..."
              className="pl-10 border-0 focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {Object.keys(groupedRoutes).length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>
          ) : (
            Object.entries(groupedRoutes).map(([category, categoryRoutes]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">{category}</div>
                {categoryRoutes.map((route) => {
                  const Icon = route.icon
                  return (
                    <button
                      key={route.url}
                      onClick={() => handleSelect(route.url)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-medium text-sm">{route.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{route.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
        <div className="border-t p-2 text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">⌘K</kbd> to search anytime
        </div>
      </PopoverContent>
    </Popover>
  )
}
