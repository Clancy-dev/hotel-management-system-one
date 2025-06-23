"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Download, Bed, Users, BarChart3 } from "lucide-react"
import { generatePDF } from "@/lib/pdf-utils"

export default function OccupancyReportPage() {
  const occupancyData = [
    { month: "Jan", occupancy: 78, revenue: 125000, adr: 165 },
    { month: "Feb", occupancy: 82, revenue: 135000, adr: 170 },
    { month: "Mar", occupancy: 85, revenue: 145000, adr: 175 },
    { month: "Apr", occupancy: 88, revenue: 155000, adr: 180 },
    { month: "May", occupancy: 92, revenue: 165000, adr: 185 },
    { month: "Jun", occupancy: 95, revenue: 175000, adr: 190 },
  ]

  const exportToPDF = () => {
    const monthlyData = occupancyData.map((data) => ({
      month: data.month,
      occupancy: `${data.occupancy}%`,
      revenue: `$${data.revenue.toLocaleString()}`,
      adr: `$${data.adr}`,
    }))

    const roomTypeData = roomTypeOccupancy.map((room) => ({
      type: room.type,
      total: room.total,
      occupied: room.occupied,
      available: room.total - room.occupied,
      rate: `${room.rate}%`,
    }))

    // Create combined data for PDF
    generatePDF({
      title: "Occupancy Report",
      subtitle: "Room occupancy rates and trends analysis",
      columns: [
        { header: "Month", dataKey: "month", width: 20 },
        { header: "Occupancy Rate", dataKey: "occupancy", width: 25 },
        { header: "Revenue", dataKey: "revenue", width: 25 },
        { header: "ADR", dataKey: "adr", width: 20 },
      ],
      data: monthlyData,
      filename: "occupancy-report",
    })
  }

  const roomTypeOccupancy = [
    { type: "Standard Single", total: 25, occupied: 20, rate: 80 },
    { type: "Deluxe Double", total: 20, occupied: 18, rate: 90 },
    { type: "Family Suite", total: 10, occupied: 8, rate: 80 },
    { type: "Executive Suite", total: 8, occupied: 7, rate: 87.5 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Occupancy Report</h1>
          <p className="text-muted-foreground">Track room occupancy rates and trends</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.7%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +2.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
              -5 from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$185</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +$8 from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$157</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +$12 from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Trends</CardTitle>
          <CardDescription>Monthly occupancy rates and revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {occupancyData.map((data) => (
                <div key={data.month} className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold">{data.month}</div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">{data.occupancy}%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">${data.revenue.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">ADR: ${data.adr}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Room Type Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy by Room Type</CardTitle>
            <CardDescription>Current occupancy rates for each room category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roomTypeOccupancy.map((room) => (
                <div key={room.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{room.type}</span>
                    <Badge variant={room.rate >= 90 ? "default" : room.rate >= 80 ? "secondary" : "destructive"}>
                      {room.rate}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {room.occupied} of {room.total} rooms occupied
                    </span>
                    <span>{room.total - room.occupied} available</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${room.rate}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Occupancy rates for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { day: "Monday", occupancy: 78, rooms: 120 },
                { day: "Tuesday", occupancy: 82, rooms: 126 },
                { day: "Wednesday", occupancy: 85, rooms: 130 },
                { day: "Thursday", occupancy: 88, rooms: 135 },
                { day: "Friday", occupancy: 95, rooms: 146 },
                { day: "Saturday", occupancy: 98, rooms: 150 },
                { day: "Sunday", occupancy: 92, rooms: 141 },
              ].map((day) => (
                <div key={day.day} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{day.day}</p>
                    <p className="text-sm text-muted-foreground">{day.rooms} rooms occupied</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{day.occupancy}%</div>
                    <div className="w-16 bg-muted rounded-full h-2 mt-1">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${day.occupancy}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Forecast</CardTitle>
          <CardDescription>Projected occupancy rates for the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* Forecast cards */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
