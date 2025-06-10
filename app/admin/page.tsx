"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Building2, Users, DollarSign, UserCheck, FileText, TrendingUp } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const revenueData = [
  { day: "Mon", revenue: 2400 },
  { day: "Tue", revenue: 1398 },
  { day: "Wed", revenue: 9800 },
  { day: "Thu", revenue: 3908 },
  { day: "Fri", revenue: 4800 },
  { day: "Sat", revenue: 3800 },
  { day: "Sun", revenue: 4300 },
]

const occupancyData = [
  { month: "Jan", occupancy: 65 },
  { month: "Feb", occupancy: 72 },
  { month: "Mar", occupancy: 78 },
  { month: "Apr", occupancy: 85 },
  { month: "May", occupancy: 92 },
  { month: "Jun", occupancy: 88 },
]

const bookingSourceData = [
  { name: "Direct", value: 45, color: "#0088FE" },
  { name: "Online", value: 35, color: "#00C49F" },
  { name: "Walk-in", value: 20, color: "#FFBB28" },
]

const roomStatusData = [
  { number: "101", status: "occupied", guest: "John Doe" },
  { number: "102", status: "available", guest: null },
  { number: "103", status: "dirty", guest: null },
  { number: "104", status: "booked", guest: "Jane Smith" },
  { number: "105", status: "maintenance", guest: null },
  { number: "106", status: "occupied", guest: "Bob Wilson" },
  { number: "107", status: "available", guest: null },
  { number: "108", status: "out-of-order", guest: null },
  { number: "201", status: "occupied", guest: "Alice Brown" },
  { number: "202", status: "available", guest: null },
  { number: "203", status: "dirty", guest: null },
  { number: "204", status: "booked", guest: "Mike Davis" },
]

const staffActivity = [
  { name: "Rose Martinez", role: "Receptionist", checkins: 8, checkouts: 5, shift: "Morning" },
  { name: "Mike Johnson", role: "Receptionist", checkins: 6, checkouts: 7, shift: "Evening" },
  { name: "Sarah Chen", role: "Housekeeping", rooms: 12, shift: "Day" },
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

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header userRole="admin" userName="Clancy Johnson" />

      <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rooms Occupied</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42</div>
              <p className="text-xs text-muted-foreground">84% occupancy rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,320</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +12% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 shifts covered</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue for the past week</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[200px] sm:h-[250px] max-w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Booking Sources */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>Booking Sources</CardTitle>
              <CardDescription>Distribution of booking channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  direct: { label: "Direct", color: "#0088FE" },
                  online: { label: "Online", color: "#00C49F" },
                  walkin: { label: "Walk-in", color: "#FFBB28" },
                }}
                className="h-[200px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bookingSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
                {bookingSourceData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                    <span className="text-xs sm:text-sm">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          {/* Room Status Grid */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Room Status Overview</CardTitle>
              <CardDescription>Real-time room status monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {roomStatusData.map((room) => (
                  <div
                    key={room.number}
                    className="p-2 sm:p-3 border rounded-lg text-center hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="font-semibold text-sm sm:text-base">{room.number}</div>
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full mx-auto my-1 ${getStatusColor(room.status)}`} />
                    <div className="text-xs text-muted-foreground">{getStatusText(room.status)}</div>
                    {room.guest && <div className="text-xs mt-1 truncate">{room.guest}</div>}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 text-xs sm:text-sm">
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

          {/* Staff Activity */}
          <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
              <CardTitle>Staff Activity</CardTitle>
              <CardDescription>Current shift performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {staffActivity.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{staff.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {staff.role} - {staff.shift}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      {staff.role === "Receptionist" ? (
                        <div className="text-xs sm:text-sm">
                          <div>In: {staff.checkins}</div>
                          <div>Out: {staff.checkouts}</div>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm">
                          <div>Rooms: {staff.rooms}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Shortcuts</CardTitle>
            <CardDescription>Quick access to management functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Button variant="outline" className="h-16 sm:h-20 flex-col">
                <Building2 className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">Manage Rooms</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">Staff Accounts</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col">
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">Pricing & Rates</span>
              </Button>
              <Button variant="outline" className="h-16 sm:h-20 flex-col">
                <FileText className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">System Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
