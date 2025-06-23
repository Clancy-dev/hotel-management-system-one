"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Download, CreditCard, PieChart } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { generatePDF } from "@/lib/pdf-utils"

export default function RevenueReportPage() {
  const { formatCurrency } = useCurrency()

  const monthlyRevenue = [
    { month: "Jan", rooms: 125000, food: 35000, services: 15000, total: 175000 },
    { month: "Feb", rooms: 135000, food: 38000, services: 17000, total: 190000 },
    { month: "Mar", rooms: 145000, food: 42000, services: 18000, total: 205000 },
    { month: "Apr", rooms: 155000, food: 45000, services: 20000, total: 220000 },
    { month: "May", rooms: 165000, food: 48000, services: 22000, total: 235000 },
    { month: "Jun", rooms: 175000, food: 52000, services: 25000, total: 252000 },
  ]

  const revenueBySource = [
    { source: "Room Revenue", amount: 175000, percentage: 69.4, trend: "+12%" },
    { source: "Food & Beverage", amount: 52000, percentage: 20.6, trend: "+8%" },
    { source: "Spa & Wellness", amount: 15000, percentage: 5.9, trend: "+15%" },
    { source: "Business Center", amount: 6000, percentage: 2.4, trend: "+5%" },
    { source: "Parking", amount: 4300, percentage: 1.7, trend: "+3%" },
  ]

  const exportToPDF = () => {
    const monthlyData = monthlyRevenue.map((data) => ({
      month: data.month,
      rooms: formatCurrency(data.rooms),
      food: formatCurrency(data.food),
      services: formatCurrency(data.services),
      total: formatCurrency(data.total),
    }))

    const sourceData = revenueBySource.map((item) => ({
      source: item.source,
      amount: formatCurrency(item.amount),
      percentage: `${item.percentage}%`,
      trend: item.trend,
    }))

    generatePDF({
      title: "Revenue Report",
      subtitle: "Revenue performance and financial metrics analysis",
      columns: [
        { header: "Month", dataKey: "month", width: 20 },
        { header: "Room Revenue", dataKey: "rooms", width: 25 },
        { header: "F&B Revenue", dataKey: "food", width: 25 },
        { header: "Services", dataKey: "services", width: 25 },
        { header: "Total Revenue", dataKey: "total", width: 25 },
      ],
      data: monthlyData,
      filename: "revenue-report",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Revenue Report</h1>
          <p className="text-muted-foreground">Track revenue performance and financial metrics</p>
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

      {/* Key Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(252300)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +7.3% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(175000)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +6.1% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(185)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />+{formatCurrency(8)} from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(157)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />+{formatCurrency(12)} from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trends</CardTitle>
          <CardDescription>Revenue breakdown by category over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {monthlyRevenue.map((data) => (
                <div key={data.month} className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold">{data.month}</div>
                  <div className="text-lg sm:text-2xl font-bold text-primary">{formatCurrency(data.total)}</div>
                  <div className="space-y-1 mt-2">
                    <div className="text-xs text-muted-foreground">Rooms: {formatCurrency(data.rooms)}</div>
                    <div className="text-xs text-muted-foreground">F&B: {formatCurrency(data.food)}</div>
                    <div className="text-xs text-muted-foreground">Services: {formatCurrency(data.services)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Breakdown of revenue streams for this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueBySource.map((item) => (
                <div key={item.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.source}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.trend}</Badge>
                      <span className="font-bold">{formatCurrency(item.amount)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{item.percentage}% of total revenue</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue (This Week)</CardTitle>
            <CardDescription>Daily revenue performance for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { day: "Monday", revenue: 8200, rooms: 6500, other: 1700 },
                { day: "Tuesday", revenue: 8800, rooms: 7000, other: 1800 },
                { day: "Wednesday", revenue: 9200, rooms: 7300, other: 1900 },
                { day: "Thursday", revenue: 9800, rooms: 7800, other: 2000 },
                { day: "Friday", revenue: 12500, rooms: 10000, other: 2500 },
                { day: "Saturday", revenue: 14200, rooms: 11500, other: 2700 },
                { day: "Sunday", revenue: 11800, rooms: 9500, other: 2300 },
              ].map((day) => (
                <div key={day.day} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{day.day}</p>
                    <p className="text-sm text-muted-foreground">
                      Rooms: {formatCurrency(day.rooms)} | Other: {formatCurrency(day.other)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatCurrency(day.revenue)}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
          <CardDescription>Projected revenue for the next quarter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="text-center p-4 sm:p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Next Month</div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{formatCurrency(268000)}</div>
              <div className="text-sm text-muted-foreground mt-1">+6.2% projected growth</div>
            </div>
            <div className="text-center p-4 sm:p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Next Quarter</div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{formatCurrency(795000)}</div>
              <div className="text-sm text-muted-foreground mt-1">+5.8% projected growth</div>
            </div>
            <div className="text-center p-4 sm:p-6 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Year Target</div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{formatCurrency(3200000)}</div>
              <div className="text-sm text-muted-foreground mt-1">78% progress to goal</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
