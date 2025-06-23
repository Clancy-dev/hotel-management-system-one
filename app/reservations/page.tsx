"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Phone, Mail, Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function ReservationsPage() {
  const reservations = [
    {
      id: "RES001",
      guestName: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      room: "101",
      checkIn: "2024-01-15",
      checkOut: "2024-01-18",
      status: "confirmed",
      guests: 2,
      totalAmount: "$450.00",
    },
    {
      id: "RES002",
      guestName: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 987-6543",
      room: "205",
      checkIn: "2024-01-16",
      checkOut: "2024-01-20",
      status: "pending",
      guests: 1,
      totalAmount: "$320.00",
    },
    {
      id: "RES003",
      guestName: "Michael Brown",
      email: "m.brown@email.com",
      phone: "+1 (555) 456-7890",
      room: "301",
      checkIn: "2024-01-14",
      checkOut: "2024-01-16",
      status: "checked-in",
      guests: 3,
      totalAmount: "$280.00",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "checked-in":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage all hotel reservations and bookings</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reservations..." className="pl-10 w-full" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-outs Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Confirmations</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Reservations</CardTitle>
          <CardDescription className="text-sm">Latest bookings and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="border rounded-lg p-4">
                {/* Mobile Layout */}
                <div className="block sm:hidden space-y-3">
                  {/* Guest Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{reservation.guestName}</p>
                          <Badge className={getStatusColor(reservation.status)}>{reservation.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">ID: {reservation.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{reservation.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{reservation.phone}</span>
                    </div>
                  </div>

                  {/* Reservation Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Room {reservation.room}</p>
                      <p className="text-muted-foreground">{reservation.guests} guests</p>
                    </div>
                    <div>
                      <p className="font-medium">{reservation.totalAmount}</p>
                      <p className="text-muted-foreground">Total</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-sm">
                    <p className="font-medium">Check-in: {reservation.checkIn}</p>
                    <p className="text-muted-foreground">Check-out: {reservation.checkOut}</p>
                  </div>

                  {/* Action Button */}
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{reservation.guestName}</p>
                        <Badge className={getStatusColor(reservation.status)}>{reservation.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {reservation.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {reservation.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium">Room {reservation.room}</p>
                      <p className="text-muted-foreground">{reservation.guests} guests</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{reservation.checkIn}</p>
                      <p className="text-muted-foreground">to {reservation.checkOut}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{reservation.totalAmount}</p>
                      <p className="text-muted-foreground">Total</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
