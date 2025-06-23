"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  Bed,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import Link from "next/link"

export default function DashboardPage() {
  const { formatCurrency } = useCurrency()

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(252300),
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Occupancy Rate",
      value: "84.2%",
      change: "+2.1%",
      icon: Bed,
      trend: "up",
    },
    {
      title: "Total Guests",
      value: "1,247",
      change: "+8.3%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Average Daily Rate",
      value: formatCurrency(185),
      change: "+5.2%",
      icon: TrendingUp,
      trend: "up",
    },
  ]

  const recentReservations = [
    {
      id: "RES001",
      guest: "John Smith",
      room: "205",
      checkIn: "Today",
      status: "confirmed",
      amount: formatCurrency(450),
    },
    {
      id: "RES002",
      guest: "Sarah Johnson",
      room: "301",
      checkIn: "Tomorrow",
      status: "pending",
      amount: formatCurrency(680),
    },
    {
      id: "RES003",
      guest: "Michael Brown",
      room: "102",
      checkIn: "Jan 18",
      status: "confirmed",
      amount: formatCurrency(320),
    },
  ]

  const roomStatus = [
    { status: "Available", count: 23, color: "bg-green-500" },
    { status: "Occupied", count: 127, color: "bg-blue-500" },
    { status: "Maintenance", count: 3, color: "bg-orange-500" },
    { status: "Out of Order", count: 2, color: "bg-red-500" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your hotel today.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/reservations/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Reservations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Reservations</CardTitle>
                <CardDescription>Latest bookings and their current status</CardDescription>
              </div>
              <Link href="/reservations">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{reservation.guest}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Room {reservation.room}</span>
                          <span>•</span>
                          <span>{reservation.checkIn}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{reservation.amount}</p>
                      <Badge className={getStatusColor(reservation.status)}>{reservation.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Status Overview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Room Status</CardTitle>
              <CardDescription>Current room availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomStatus.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <span className="text-sm font-medium">{status.status}</span>
                  </div>
                  <span className="text-sm font-bold">{status.count}</span>
                </div>
              ))}
              <Link href="/rooms/status">
                <Button variant="outline" className="w-full mt-4">
                  <Bed className="mr-2 h-4 w-4" />
                  Manage Rooms
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/reservations/checkin">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check-in Guest
                </Button>
              </Link>
              <Link href="/reservations/checkout">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  Check-out Guest
                </Button>
              </Link>
              <Link href="/rooms/maintenance">
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Maintenance
                </Button>
              </Link>
              <Link href="/guests/list">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Guests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Check-ins, check-outs, and important events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Check-ins (8)
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• John Smith - Room 205 (3:00 PM)</p>
                <p>• Sarah Johnson - Room 301 (4:30 PM)</p>
                <p>• Michael Brown - Room 102 (6:00 PM)</p>
                <p>+ 5 more...</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Check-outs (5)
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Emily Davis - Room 150 (11:00 AM)</p>
                <p>• Robert Wilson - Room 203 (11:30 AM)</p>
                <p>• Lisa Chen - Room 304 (12:00 PM)</p>
                <p>+ 2 more...</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Maintenance (3)
              </h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Room 205 - AC repair (2:00 PM)</p>
                <p>• Room 301 - Plumbing check (3:30 PM)</p>
                <p>• Room 102 - TV replacement (5:00 PM)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
