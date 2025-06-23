"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Download, MessageSquare, ThumbsUp, AlertTriangle } from "lucide-react"
import { generatePDF } from "@/lib/pdf-utils"

export default function GuestSatisfactionPage() {
  const satisfactionData = [
    { month: "Jan", rating: 4.2, reviews: 145, nps: 68 },
    { month: "Feb", rating: 4.3, reviews: 162, nps: 72 },
    { month: "Mar", rating: 4.4, reviews: 178, nps: 75 },
    { month: "Apr", rating: 4.5, reviews: 195, nps: 78 },
    { month: "May", rating: 4.6, reviews: 210, nps: 82 },
    { month: "Jun", rating: 4.7, reviews: 225, nps: 85 },
  ]

  const categoryRatings = [
    { category: "Room Quality", rating: 4.6, trend: "+0.2" },
    { category: "Service", rating: 4.5, trend: "+0.1" },
    { category: "Cleanliness", rating: 4.8, trend: "+0.3" },
    { category: "Location", rating: 4.4, trend: "0.0" },
    { category: "Value for Money", rating: 4.2, trend: "-0.1" },
    { category: "Amenities", rating: 4.3, trend: "+0.2" },
  ]

  const recentReviews = [
    {
      id: 1,
      guest: "John Smith",
      rating: 5,
      comment: "Excellent service and beautiful rooms. The staff went above and beyond to make our stay memorable.",
      date: "2024-01-14",
      room: "205",
    },
    {
      id: 2,
      guest: "Sarah Johnson",
      rating: 4,
      comment: "Great location and clean facilities. The breakfast was delicious. Minor issue with room temperature.",
      date: "2024-01-13",
      room: "301",
    },
    {
      id: 3,
      guest: "Mike Wilson",
      rating: 5,
      comment: "Outstanding experience! The concierge was incredibly helpful and the spa services were top-notch.",
      date: "2024-01-12",
      room: "Executive Suite",
    },
    {
      id: 4,
      guest: "Emily Davis",
      rating: 3,
      comment: "Decent stay overall. Room was comfortable but check-in process took longer than expected.",
      date: "2024-01-11",
      room: "102",
    },
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600"
    if (rating >= 4.0) return "text-yellow-600"
    if (rating >= 3.5) return "text-orange-600"
    return "text-red-600"
  }

  const getTrendColor = (trend: string) => {
    if (trend.startsWith("+")) return "text-green-600"
    if (trend.startsWith("-")) return "text-red-600"
    return "text-gray-600"
  }

  const exportToPDF = () => {
    const monthlyData = satisfactionData.map((data) => ({
      month: data.month,
      rating: data.rating,
      reviews: data.reviews,
      nps: data.nps,
    }))

    const categoryData = categoryRatings.map((category) => ({
      category: category.category,
      rating: category.rating,
      trend: category.trend,
    }))

    const reviewData = recentReviews.map((review) => ({
      guest: review.guest,
      room: review.room,
      rating: review.rating,
      date: review.date,
      comment: review.comment.substring(0, 100) + "...", // Truncate for PDF
    }))

    generatePDF({
      title: "Guest Satisfaction Report",
      subtitle: "Guest feedback and satisfaction metrics analysis",
      columns: [
        { header: "Month", dataKey: "month", width: 20 },
        { header: "Rating", dataKey: "rating", width: 20 },
        { header: "Reviews", dataKey: "reviews", width: 20 },
        { header: "NPS Score", dataKey: "nps", width: 20 },
      ],
      data: monthlyData,
      filename: "guest-satisfaction-report",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guest Satisfaction Report</h1>
          <p className="text-muted-foreground">Monitor guest feedback and satisfaction metrics</p>
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

      {/* Key Satisfaction Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7/5</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +0.3 from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">225</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +15 from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +3 from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              +5% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Satisfaction Trends</CardTitle>
          <CardDescription>Monthly satisfaction metrics over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {satisfactionData.map((data) => (
                <div key={data.month} className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold">{data.month}</div>
                  <div className="flex items-center justify-center mb-2">{renderStars(data.rating)}</div>
                  <div className="text-lg sm:text-xl font-bold text-primary">{data.rating}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{data.reviews} reviews</div>
                  <div className="text-xs text-muted-foreground">NPS: {data.nps}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Ratings by Category</CardTitle>
            <CardDescription>Detailed breakdown of satisfaction by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryRatings.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getTrendColor(category.trend)}`}>{category.trend}</span>
                      <span className={`font-bold ${getRatingColor(category.rating)}`}>{category.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(category.rating)}
                    <span className="text-sm text-muted-foreground">({category.rating}/5)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(category.rating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest guest feedback and comments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{review.guest}</p>
                      <p className="text-sm text-muted-foreground">
                        Room {review.room} • {review.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>Breakdown of guest ratings for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { stars: 5, count: 142, percentage: 63.1 },
              { stars: 4, count: 58, percentage: 25.8 },
              { stars: 3, count: 18, percentage: 8.0 },
              { stars: 2, count: 5, percentage: 2.2 },
              { stars: 1, count: 2, percentage: 0.9 },
            ].map((rating) => (
              <div key={rating.stars} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 w-16 sm:w-20">
                  <span className="text-sm font-medium">{rating.stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-primary h-3 rounded-full" style={{ width: `${rating.percentage}%` }}></div>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground w-20 sm:w-24 text-right">
                  {rating.count} ({rating.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Opportunities</CardTitle>
          <CardDescription>Areas identified for service enhancement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Check-in Process</h4>
                <p className="text-sm text-muted-foreground">
                  Multiple guests mentioned longer wait times during check-in. Consider adding more staff during peak
                  hours.
                </p>
                <Badge variant="outline" className="mt-2">
                  Priority: Medium
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Room Temperature Control</h4>
                <p className="text-sm text-muted-foreground">
                  Some guests reported difficulty adjusting room temperature. HVAC system may need maintenance.
                </p>
                <Badge variant="outline" className="mt-2">
                  Priority: High
                </Badge>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">WiFi Speed</h4>
                <p className="text-sm text-muted-foreground">
                  Business travelers mentioned slow internet speeds in some areas. Consider upgrading network
                  infrastructure.
                </p>
                <Badge variant="outline" className="mt-2">
                  Priority: Low
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
