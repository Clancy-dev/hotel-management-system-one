"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, UserPlus, UserCheck, UserX, Search, Calendar, Clock, Phone, Printer } from "lucide-react"
import { useState } from "react"

const todayActivity = [
  { guest: "Jane Doe", room: "101", status: "Checked-in", time: "10:00 AM", phone: "+1-555-0123" },
  { guest: "Paul Smith", room: "203", status: "Due Check-out", time: "12:00 PM", phone: "+1-555-0456" },
  { guest: "Mary Johnson", room: "305", status: "Checked-in", time: "2:30 PM", phone: "+1-555-0789" },
  { guest: "Robert Wilson", room: "102", status: "Checked-out", time: "11:15 AM", phone: "+1-555-0321" },
  { guest: "Lisa Brown", room: "204", status: "Due Check-out", time: "1:00 PM", phone: "+1-555-0654" },
]

const roomStatusData = [
  { number: "101", status: "occupied", guest: "Jane Doe", checkout: "Tomorrow" },
  { number: "102", status: "available", guest: null, checkout: null },
  { number: "103", status: "dirty", guest: null, checkout: null },
  { number: "104", status: "booked", guest: "Mike Chen", checkout: "Today 3PM" },
  { number: "105", status: "maintenance", guest: null, checkout: null },
  { number: "106", status: "occupied", guest: "Sarah Davis", checkout: "Today 11AM" },
  { number: "107", status: "available", guest: null, checkout: null },
  { number: "108", status: "out-of-order", guest: null, checkout: null },
  { number: "201", status: "occupied", guest: "Paul Smith", checkout: "Today 12PM" },
  { number: "202", status: "available", guest: null, checkout: null },
  { number: "203", status: "dirty", guest: null, checkout: null },
  { number: "204", status: "occupied", guest: "Lisa Brown", checkout: "Today 1PM" },
]

const upcomingBookings = [
  { date: "Today", guest: "Mike Chen", room: "104", time: "3:00 PM" },
  { date: "Tomorrow", guest: "Anna Wilson", room: "107", time: "2:00 PM" },
  { date: "Tomorrow", guest: "David Lee", room: "203", time: "4:30 PM" },
]

const notifications = [
  { type: "warning", message: "Room 203 needs cleaning", time: "5 min ago" },
  { type: "info", message: "Guest in 106 requested extra towels", time: "15 min ago" },
  { type: "urgent", message: "Check-out overdue: Room 201", time: "30 min ago" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "occupied":
      return "bg-red-500"
    case "available":
      return "bg-green-500"
    case "dirty":
      return "bg-yellow-500"
    case "booked":
      return "bg-blue-500"
    case "maintenance":
      return "bg-gray-500"
    case "out-of-order":
      return "bg-black"
    default:
      return "bg-gray-300"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "occupied":
      return "Occupied"
    case "available":
      return "Available"
    case "dirty":
      return "Dirty"
    case "booked":
      return "Booked"
    case "maintenance":
      return "Maintenance"
    case "out-of-order":
      return "Out of Order"
    default:
      return "Unknown"
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Checked-in":
      return "default"
    case "Due Check-out":
      return "destructive"
    case "Checked-out":
      return "secondary"
    default:
      return "outline"
  }
}

export default function ReceptionistDashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredActivity = todayActivity.filter(
    (activity) => activity.guest.toLowerCase().includes(searchTerm.toLowerCase()) || activity.room.includes(searchTerm),
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole="receptionist" userName="Rose Martinez" />

      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        {/* Quick Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rooms Occupied</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">8 rooms available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins Today</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 pending arrivals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-outs Today</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">2 overdue check-outs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rooms Vacant</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Ready for guests</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          {/* Today's Activity */}
          <Card className="col-span-1 lg:col-span-4">
            <CardHeader>
              <CardTitle>Today's Activity</CardTitle>
              <CardDescription>Guest check-ins, check-outs, and pending actions</CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by guest name or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-sm sm:text-base">{activity.guest}</div>
                            <div className="text-xs text-muted-foreground flex items-center sm:hidden">
                              <Phone className="h-3 w-3 mr-1" />
                              {activity.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{activity.room}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(activity.status)} className="text-xs">
                            {activity.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{activity.time}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <UserCheck className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Printer className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Important alerts and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notification.type === "urgent"
                          ? "bg-red-500"
                          : notification.type === "warning"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">{notification.message}</div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {notification.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Status Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Room Status Grid</CardTitle>
            <CardDescription>Click on any room to view details or update status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
              {roomStatusData.map((room) => (
                <div
                  key={room.number}
                  className="p-2 sm:p-3 border rounded-lg text-center hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="font-semibold text-sm sm:text-lg">{room.number}</div>
                  <div
                    className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full mx-auto my-1 sm:my-2 ${getStatusColor(room.status)}`}
                  />
                  <div className="text-xs text-muted-foreground mb-1">{getStatusText(room.status)}</div>
                  {room.guest && <div className="text-xs font-medium truncate">{room.guest}</div>}
                  {room.checkout && <div className="text-xs text-muted-foreground truncate">{room.checkout}</div>}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6 text-xs sm:text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Dirty</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>Booked</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span>Maintenance</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 rounded-full bg-black" />
                <span>Out of Order</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common front desk operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button className="h-14 sm:h-16 flex-col">
                  <UserPlus className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">New Check-In</span>
                </Button>
                <Button variant="outline" className="h-14 sm:h-16 flex-col">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">New Reservation</span>
                </Button>
                <Button variant="outline" className="h-14 sm:h-16 flex-col">
                  <UserX className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">Check-Out Guest</span>
                </Button>
                <Button variant="outline" className="h-14 sm:h-16 flex-col">
                  <Printer className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">Print Receipt</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Expected arrivals and reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{booking.guest}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Room {booking.room}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-xs sm:text-sm font-medium">{booking.date}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{booking.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
