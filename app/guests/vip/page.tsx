"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Crown, Gift, Calendar, Phone, Mail, TrendingUp, Download } from "lucide-react"
import { generatePDF } from "@/lib/pdf-utils"

export default function VIPGuestsPage() {
  const vipGuests = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      tier: "platinum",
      totalStays: 15,
      totalSpent: "$12,450",
      lastVisit: "2024-01-10",
      currentStay: "Presidential Suite",
      preferences: ["Late checkout", "Extra pillows", "Room service"],
      loyaltyPoints: 2450,
    },
    {
      id: 2,
      name: "Michael Brown",
      email: "m.brown@email.com",
      phone: "+1 (555) 456-7890",
      tier: "gold",
      totalStays: 8,
      totalSpent: "$6,200",
      lastVisit: "2024-01-12",
      currentStay: "Executive Suite",
      preferences: ["Ocean view", "Champagne on arrival", "Spa access"],
      loyaltyPoints: 1850,
    },
    {
      id: 3,
      name: "Elizabeth Wilson",
      email: "e.wilson@email.com",
      phone: "+1 (555) 789-0123",
      tier: "platinum",
      totalStays: 22,
      totalSpent: "$18,900",
      lastVisit: "2023-12-28",
      currentStay: null,
      preferences: ["Quiet room", "Hypoallergenic bedding", "Early breakfast"],
      loyaltyPoints: 3200,
    },
  ]

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "platinum":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "gold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "silver":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "platinum":
        return <Crown className="w-3 h-3" />
      case "gold":
        return <Star className="w-3 h-3" />
      default:
        return <Gift className="w-3 h-3" />
    }
  }

  const exportToPDF = () => {
    const pdfData = vipGuests.map((guest) => ({
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      tier: guest.tier,
      totalStays: guest.totalStays,
      totalSpent: guest.totalSpent,
      lastVisit: guest.lastVisit,
      currentStay: guest.currentStay || "Not staying",
      loyaltyPoints: guest.loyaltyPoints,
      preferences: guest.preferences.join(", "),
    }))

    generatePDF({
      title: "VIP Guests Report",
      subtitle: "Premium guests and their special requirements",
      columns: [
        { header: "Name", dataKey: "name", width: 25 },
        { header: "Email", dataKey: "email", width: 35 },
        { header: "Phone", dataKey: "phone", width: 25 },
        { header: "Tier", dataKey: "tier", width: 15 },
        { header: "Total Stays", dataKey: "totalStays", width: 15 },
        { header: "Total Spent", dataKey: "totalSpent", width: 20 },
        { header: "Loyalty Points", dataKey: "loyaltyPoints", width: 20 },
        { header: "Current Stay", dataKey: "currentStay", width: 20 },
      ],
      data: pdfData,
      filename: "vip-guests-report",
      orientation: "landscape",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">VIP Guests</h1>
          <p className="text-muted-foreground">Manage premium guests and their special requirements</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button variant="outline" onClick={exportToPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button className="w-full sm:w-auto">
            <Crown className="mr-2 h-4 w-4" />
            Add VIP Guest
          </Button>
        </div>
      </div>

      {/* VIP Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VIP Guests</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Premium members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platinum Members</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Highest tier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$285K</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Staying</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">VIP guests checked in</p>
          </CardContent>
        </Card>
      </div>

      {/* VIP Guest Cards */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {vipGuests.map((guest) => (
          <Card key={guest.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg" alt={guest.name} />
                    <AvatarFallback>
                      {guest.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{guest.name}</CardTitle>
                    <Badge className={`${getTierColor(guest.tier)} flex items-center gap-1 w-fit`}>
                      {getTierIcon(guest.tier)}
                      {guest.tier}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{guest.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{guest.phone}</span>
                </div>
              </div>

              {/* Current Stay */}
              {guest.currentStay && (
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium text-primary">Currently Staying</p>
                  <p className="text-sm text-muted-foreground">{guest.currentStay}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold">{guest.totalStays}</p>
                  <p className="text-xs text-muted-foreground">Total Stays</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">{guest.totalSpent}</p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>

              {/* Loyalty Points */}
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold">{guest.loyaltyPoints}</span>
                </div>
                <p className="text-xs text-muted-foreground">Loyalty Points</p>
              </div>

              {/* Preferences */}
              <div>
                <p className="text-sm font-medium mb-2">Preferences</p>
                <div className="flex flex-wrap gap-1">
                  {guest.preferences.map((pref, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Profile
                </Button>
                <Button size="sm" className="flex-1">
                  Special Service
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* VIP Services */}
      <Card>
        <CardHeader>
          <CardTitle>VIP Services & Benefits</CardTitle>
          <CardDescription>Special services available for VIP guests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium">Platinum Benefits</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complimentary room upgrades</li>
                <li>• 24/7 concierge service</li>
                <li>• Free airport transfers</li>
                <li>• Late checkout (2 PM)</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <h4 className="font-medium">Gold Benefits</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Priority check-in/out</li>
                <li>• Complimentary breakfast</li>
                <li>• Room service discount</li>
                <li>• Late checkout (1 PM)</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">Special Services</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personal butler service</li>
                <li>• Spa & wellness access</li>
                <li>• Private dining options</li>
                <li>• Custom room amenities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
