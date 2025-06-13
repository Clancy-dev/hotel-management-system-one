"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, CreditCard } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"

interface PaymentStatisticsProps {
  statistics: {
    totalPayments: number
    completedPayments: number
    partialPayments: number
    pendingPayments: number
    totalRevenue: number
    totalOutstanding: number
  }
}

export function PaymentStatistics({ statistics }: PaymentStatisticsProps) {
  const { formatPrice } = useCurrency()

  const completionRate =
    statistics.totalPayments > 0 ? Math.round((statistics.completedPayments / statistics.totalPayments) * 100) : 0

  const outstandingRate =
    statistics.totalRevenue > 0
      ? Math.round((statistics.totalOutstanding / (statistics.totalRevenue + statistics.totalOutstanding)) * 100)
      : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatPrice(statistics.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            From {statistics.totalPayments} payment{statistics.totalPayments !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Balance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{formatPrice(statistics.totalOutstanding)}</div>
          <p className="text-xs text-muted-foreground">{outstandingRate}% of total expected revenue</p>
        </CardContent>
      </Card>

      {/* Payment Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {statistics.completedPayments} of {statistics.totalPayments} payments completed
          </p>
        </CardContent>
      </Card>

      {/* Payment Status Breakdown */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Payment Status Breakdown</CardTitle>
          <CardDescription>Overview of all payment statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Completed Payments */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{statistics.completedPayments}</span>
                  <Badge variant="default" className="bg-green-600">
                    Completed
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Fully paid bookings</p>
              </div>
            </div>

            {/* Partial Payments */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{statistics.partialPayments}</span>
                  <Badge variant="secondary" className="bg-yellow-600 text-white">
                    Partial
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Partially paid bookings</p>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{statistics.pendingPayments}</span>
                  <Badge variant="destructive">Pending</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Unpaid bookings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
