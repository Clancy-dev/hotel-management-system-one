"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Bell,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Building2,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
} from "lucide-react"
import { SearchCommand } from "@/components/search-command"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

interface HeaderProps {
  userRole: "admin" | "receptionist"
  userName: string
}

interface Notification {
  id: number
  title: string
  message: string
  time: string
  type: "urgent" | "warning" | "info" | "success"
  read: boolean
  actionable?: boolean
}

export function Header({ userRole, userName }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Room Cleaning Required",
      message: "Room 203 needs immediate cleaning - guest checking in at 3 PM",
      time: "5 min ago",
      type: "urgent",
      read: false,
      actionable: true,
    },
    {
      id: 2,
      title: "New Booking Received",
      message: "Premium suite booked for tomorrow - John Smith",
      time: "15 min ago",
      type: "success",
      read: false,
      actionable: true,
    },
    {
      id: 3,
      title: "Check-out Overdue",
      message: "Room 201 guest has exceeded check-out time by 2 hours",
      time: "30 min ago",
      type: "warning",
      read: false,
      actionable: true,
    },
    {
      id: 4,
      title: "Maintenance Request",
      message: "Air conditioning issue reported in Room 305",
      time: "1 hour ago",
      type: "info",
      read: true,
      actionable: true,
    },
    {
      id: 5,
      title: "Staff Schedule Updated",
      message: "Tomorrow's housekeeping schedule has been modified",
      time: "2 hours ago",
      type: "info",
      read: true,
      actionable: false,
    },
  ])

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true)
  }, [])

  const getPageTitle = () => {
    if (pathname.includes("/admin")) return "Admin Dashboard"
    if (pathname.includes("/receptionist")) return "Receptionist Dashboard"
    if (pathname.includes("/notifications")) return "Notifications"
    return "Hotel Management"
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const urgentCount = notifications.filter((n) => n.type === "urgent" && !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "info":
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case "urgent":
        return "destructive"
      case "warning":
        return "secondary"
      case "success":
        return "default"
      case "info":
      default:
        return "outline"
    }
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const dismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const recentNotifications = notifications.slice(0, 4)

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="h-4 w-4" />

    return theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 bg-background/95">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div className="hidden md:block bg-background/95">
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
            <p className="text-sm text-muted-foreground">
              {getGreeting()}, {userName} ({userRole === "admin" ? "Admin" : "Receptionist"})
            </p>
          </div>
          {/* Mobile System Branding */}
          <div className="flex md:hidden items-center gap-2">
            <Building2 className="h-5 w-5" />
            <span className="font-semibold text-base">Hotel Manager</span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <SearchCommand />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Search button for mobile */}
          <div className="lg:hidden">
            <SearchCommand isMobile />
          </div>

          {/* Theme Toggle - Show on mobile (sm and up) */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {getThemeIcon()}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant={urgentCount > 0 ? "destructive" : "default"}
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="flex items-center justify-between p-3">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-6">
                      Mark all read
                    </Button>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator />

              {recentNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                        !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4
                                  className={`text-sm font-medium truncate ${!notification.read ? "font-semibold" : ""}`}
                                >
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs">
                                    {notification.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {notification.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      Mark read
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => dismissNotification(notification.id)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center cursor-pointer" onClick={() => router.push("/notifications")}>
                <span className="text-sm font-medium w-full">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt={userName} />
                  <AvatarFallback>
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userRole === "admin" ? "Administrator" : "Front Desk Receptionist"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Title Bar */}
      <div className="md:hidden border-t px-4 py-2 bg-background/95">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
        <p className="text-sm text-muted-foreground">
          {getGreeting()}, {userName}
        </p>
      </div>
    </header>
  )
}
