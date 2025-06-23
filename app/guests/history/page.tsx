"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Search, Filter, User, Bed, CreditCard, Star, Download } from "lucide-react"
import { generatePDF } from "@/lib/pdf-utils"

export default function GuestHistoryPage() {
  const guestHistory = [
    {
      id: 1,
      guestName: "John Smith",
      room: "205",
      checkIn: "2024-01-10",
      checkOut: "2024-01-13",
      nights: 3,
      amount: "$450.00",
      status: "completed",
      rating: 5,
      paymentMethod: "Credit Card",
    },
    {
      id: 2,
      guestName: "Sarah Johnson",
      room: "102",
      checkIn: "2023-12-15",
      checkOut: "2023-12-18",
      nights: 3,
      amount: "$360.00",
      status: "completed",
      rating: 4,
      paymentMethod: "Cash",
    },
    {
      id: 3,
      guestName: "Michael Brown",
      room: "301",
      checkIn: "2024-01-12",
      checkOut: "2024-01-15",
      nights: 3,
      amount: "$840.00",
      status: "completed",
      rating: 5,
      paymentMethod: "Credit Card",
    },
    {
      id: 4,
      guestName: "Emily Davis",
      room: "150",
      checkIn: "2023-11-20",
      checkOut: "2023-11-22",
      nights: 2,
      amount: "$320.00",
      status: "completed",
      rating: 3,
      paymentMethod: "Bank Transfer",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "no-show":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const exportToPDF = () => {
    const pdfData = guestHistory.map((stay) => ({
      guestName: stay.guestName,
      room: stay.room,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      nights: stay.nights,
      amount: stay.amount,
      status: stay.status,
      rating: stay.rating,
      paymentMethod: stay.paymentMethod,
    }))

    generatePDF({
      title: "Guest History Report",
      subtitle: "Complete record of all guest stays",
      columns: [
        { header: "Guest Name", dataKey: "guestName", width: 30 },
        { header: "Room", dataKey: "room", width: 15 },
        { header: "Check-in", dataKey: "checkIn", width: 20 },
        { header: "Check-out", dataKey: "checkOut", width: 20 },
        { header: "Nights", dataKey: "nights", width: 15 },
        { header: "Amount", dataKey: "amount", width: 20 },
        { header: "Status", dataKey: "status", width: 15 },
        { header: "Rating", dataKey: "rating", width: 15 },
        { header: "Payment", dataKey: "paymentMethod", width: 20 },
      ],
      data: pdfData,
      filename: "guest-history-report",
      orientation: "landscape",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guest History</h1>
          <p className="text-muted-foreground">View complete guest stay history and records</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by guest or room..." className="pl-8 w-full sm:w-64" />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stays</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stays</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$485,230</div>
            <p className="text-xs text-muted-foreground">From guest stays</p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stay History</CardTitle>
          <CardDescription>Complete record of all guest stays</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guestHistory.map((stay) => (
              <div
                key={stay.id}
                className="flex flex-col lg:flex-row items-start justify-between gap-4 p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{stay.guestName}</p>
                      <Badge className={getStatusColor(stay.status)}>{stay.status}</Badge>
                    </div>
                    <div className="grid gap-1 grid-cols-1 sm:grid-cols-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        Room {stay.room}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {stay.checkIn} to {stay.checkOut}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {stay.paymentMethod}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm w-full lg:w-auto">
                  <div className="text-center">
                    <p className="font-medium">{stay.nights}</p>
                    <p className="text-muted-foreground">Nights</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{stay.amount}</p>
                    <p className="text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 mb-1">{renderStars(stay.rating)}</div>
                    <p className="text-muted-foreground">Rating</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
