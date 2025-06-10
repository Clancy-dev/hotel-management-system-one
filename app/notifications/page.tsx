"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Search,
  MoreHorizontal,
  Check,
  Bell,
  BellOff,
  Archive,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Notification {
  id: number
  title: string
  message: string
  time: string
  timestamp: Date
  type: "urgent" | "warning" | "info" | "success"
  read: boolean
  archived: boolean
  category: "room" | "booking" | "maintenance" | "staff" | "system"
  actionable?: boolean
  priority: "high" | "medium" | "low"
}

const allNotifications: Notification[] = [
  {
    id: 1,
    title: "Room Cleaning Required",
    message: "Room 203 needs immediate cleaning - guest checking in at 3 PM. Housekeeping has been notified.",
    time: "5 min ago",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    type: "urgent",
    read: false,
    archived: false,
    category: "room",
    actionable: true,
    priority: "high",
  },
  {
    id: 2,
    title: "New Booking Received",
    message: "Premium suite booked for tomorrow - John Smith. Payment confirmed, welcome package prepared.",
    time: "15 min ago",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: "success",
    read: false,
    archived: false,
    category: "booking",
    actionable: true,
    priority: "medium",
  },
  {
    id: 3,
    title: "Check-out Overdue",
    message: "Room 201 guest has exceeded check-out time by 2 hours. Front desk should contact guest immediately.",
    time: "30 min ago",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: "warning",
    read: false,
    archived: false,
    category: "room",
    actionable: true,
    priority: "high",
  },
  {
    id: 4,
    title: "Maintenance Request",
    message: "Air conditioning issue reported in Room 305. Maintenance team dispatched.",
    time: "1 hour ago",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    type: "info",
    read: true,
    archived: false,
    category: "maintenance",
    actionable: true,
    priority: "medium",
  },
  {
    id: 5,
    title: "Staff Schedule Updated",
    message: "Tomorrow's housekeeping schedule has been modified. Please review the changes.",
    time: "2 hours ago",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "info",
    read: true,
    archived: false,
    category: "staff",
    actionable: false,
    priority: "low",
  },
  {
    id: 6,
    title: "System Backup Completed",
    message: "Daily system backup completed successfully at 2:00 AM. All data secured.",
    time: "6 hours ago",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    type: "success",
    read: true,
    archived: false,
    category: "system",
    actionable: false,
    priority: "low",
  },
  {
    id: 7,
    title: "Guest Complaint",
    message: "Guest in Room 405 reported noise complaint. Security has been notified.",
    time: "8 hours ago",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: "warning",
    read: true,
    archived: false,
    category: "room",
    actionable: true,
    priority: "medium",
  },
  {
    id: 8,
    title: "Payment Processed",
    message: "Payment for booking #12345 has been successfully processed. Amount: $450.00",
    time: "1 day ago",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: "success",
    read: true,
    archived: true,
    category: "booking",
    actionable: false,
    priority: "low",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(allNotifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedTab, setSelectedTab] = useState("all")

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20"
      case "low":
        return "text-green-600 bg-green-50 dark:bg-green-950/20"
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950/20"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || notification.category === selectedCategory
    const matchesType = selectedType === "all" || notification.type === selectedType

    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "unread" && !notification.read) ||
      (selectedTab === "archived" && notification.archived) ||
      (selectedTab === "actionable" && notification.actionable)

    return matchesSearch && matchesCategory && matchesType && matchesTab
  })

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAsUnread = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: false } : notification)),
    )
  }

  const archiveNotification = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, archived: true } : notification)),
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    urgent: notifications.filter((n) => n.type === "urgent" && !n.read).length,
    archived: notifications.filter((n) => n.archived).length,
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole="admin" userName="Clancy Johnson" />

      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage and view all system notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={markAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline">
              <Archive className="h-4 w-4 mr-2" />
              Archive All Read
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All notifications</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <BellOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground">Require immediate action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archived</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
              <p className="text-xs text-muted-foreground">Completed items</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Notifications</CardTitle>
            <CardDescription>Search and filter notifications by category, type, and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="room">Room</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="actionable">Actionable</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No notifications found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 ${
                      !notification.read ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" : ""
                    } ${notification.archived ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                              <Badge variant={getNotificationBadgeVariant(notification.type)} className="text-xs">
                                {notification.type}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {notification.time}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                              {notification.actionable && (
                                <Badge variant="outline" className="text-xs">
                                  Actionable
                                </Badge>
                              )}
                              {notification.archived && (
                                <Badge variant="outline" className="text-xs">
                                  Archived
                                </Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read ? (
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => markAsUnread(notification.id)}>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Mark as unread
                                </DropdownMenuItem>
                              )}
                              {!notification.archived && (
                                <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
