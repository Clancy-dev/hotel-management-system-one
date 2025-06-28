"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Bed,
  Calendar,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Home,
  Hotel,
  Settings,
  Users,
  UserCheck,
  DoorOpen,
  DoorClosed,
  Wrench,
  TrendingUp,
  Star,
  Shield,
  User,
  Clock,
  Wallet,
  X,
  Upload,
} from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useRef } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Reservations",
      url: "#",
      icon: Calendar,
      items: [
        {
          title: "New Booking",
          url: "/reservations/new",
          icon: ClipboardList,
        },
        {
          title: "Check-in",
          url: "/reservations/checkin",
          icon: DoorOpen,
        },
        {
          title: "Check-out",
          url: "/reservations/checkout",
          icon: DoorClosed,
        },
        {
          title: "All Reservations",
          url: "/reservations",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Rooms",
      url: "#",
      icon: Bed,
      items: [
        {
          title: "Rooms Management",
          url: "/rooms/rooms-management",
          icon: ClipboardList,
        },
        {
          title: "Room Status",
          url: "/rooms/status",
          icon: Hotel,
        },
        {
          title: "Room Types",
          url: "/rooms/types",
          icon: Bed,
        },
        {
          title: "Room Maintenance",
          url: "/rooms/maintenance",
          icon: Wrench,
        },
        {
          title: "Out of Order",
          url: "/rooms/out-of-order",
          icon: DoorClosed,
        },
      ],
    },
    {
      title: "Guests",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Guest List",
          url: "/guests/list",
          icon: Users,
        },
        {
          title: "Guest History",
          url: "/guests/history",
          icon: Clock,
        },
        {
          title: "VIP Guests",
          url: "/guests/vip",
          icon: Star,
        },
      ],
    },
    {
      title: "Staff",
      url: "#",
      icon: UserCheck,
      items: [
        {
          title: "Staff Management",
          url: "/staff/management",
          icon: User,
        },
        {
          title: "Schedules",
          url: "/staff/schedules",
          icon: Clock,
        },
        {
          title: "Payroll",
          url: "/staff/payroll",
          icon: Wallet,
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "Occupancy Report",
          url: "/reports/occupancy",
          icon: TrendingUp,
        },
        {
          title: "Revenue Report",
          url: "/reports/revenue",
          icon: CreditCard,
        },
        {
          title: "Guest Satisfaction",
          url: "/reports/satisfaction",
          icon: Star,
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "Hotel Settings",
          url: "/settings/hotel",
          icon: Hotel,
        },
        {
          title: "User Management",
          url: "/settings/users",
          icon: Shield,
        },
        {
          title: "System Settings",
          url: "/settings/system",
          icon: Settings,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile, isMobile } = useSidebar()
  const pathname = usePathname()

  const [userImage, setUserImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    setOpenMobile(false)
  }

  const isActiveLink = (url: string) => {
    if (url === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(url)
  }

  const hasActiveChild = (items: any[]) => {
    return items?.some((item) => isActiveLink(item.url))
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/" onClick={handleLinkClick}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Hotel className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Hotel Management</span>
                    <span className="truncate text-xs">System</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Close button for mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setOpenMobile(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hotel Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible asChild defaultOpen={hasActiveChild(item.items)} className="group/collapsible">
                      <div>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} isActive={hasActiveChild(item.items)}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={isActiveLink(subItem.url)}>
                                  <Link href={subItem.url} onClick={handleLinkClick}>
                                    {subItem.icon && <subItem.icon />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton tooltip={item.title} isActive={isActiveLink(item.url)} asChild>
                      <Link href={item.url} onClick={handleLinkClick}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userImage || ""} alt="User" />
                    <AvatarFallback>AU</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Admin User</span>
                    <span className="truncate text-xs">admin@hotel.com</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLinkClick}>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
