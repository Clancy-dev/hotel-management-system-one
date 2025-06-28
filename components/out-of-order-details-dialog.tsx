"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Calendar, Clock, DollarSign, Bed, Users, Maximize, Wifi, Tv, Coffee, Bath } from "lucide-react"
import Image from "next/image"

interface Room {
  id: string
  number: string
  type: string
  status: string
  price: number
  amenities: string[]
  images: string[]
  bedType?: string
  size?: string
  maxOccupancy?: number
  outOfOrderDate?: string
  outOfOrderReason?: string
  outOfOrderDetails?: string
}

interface OutOfOrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
}

export function OutOfOrderDetailsDialog({ open, onOpenChange, room }: OutOfOrderDetailsDialogProps) {
  if (!room) return null

  function getDaysOutOfOrder(dateString: string): number {
    if (!dateString) return 0
    const outOfOrderDate = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - outOfOrderDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  function formatDate(dateString: string): string {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />
      case "tv":
        return <Tv className="w-4 h-4" />
      case "ac":
        return <Coffee className="w-4 h-4" />
      case "mini bar":
        return <Coffee className="w-4 h-4" />
      case "balcony":
        return <Bath className="w-4 h-4" />
      default:
        return <Coffee className="w-4 h-4" />
    }
  }

  const daysOutOfOrder = getDaysOutOfOrder(room.outOfOrderDate || "")
  const lostRevenue = room.price * daysOutOfOrder

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black">
            <AlertTriangle className="h-5 w-5" />
            Room {room.number} - Out of Order Details
          </DialogTitle>
          <DialogDescription>Complete information about this out of order room</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Room Image */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <Image
                src={room.images[0] || "/placeholder.svg?height=300&width=400"}
                alt={`Room ${room.number}`}
                fill
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <Badge className="bg-black text-white text-lg px-4 py-2">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  OUT OF ORDER
                </Badge>
              </div>
            </div>

            {/* Room Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Room Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Bed Type</p>
                      <p className="text-sm text-muted-foreground">{room.bedType || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Size</p>
                      <p className="text-sm text-muted-foreground">{room.size || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Max Occupancy</p>
                      <p className="text-sm text-muted-foreground">{room.maxOccupancy || "N/A"} guests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Daily Rate</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(room.price)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                        {getAmenityIcon(amenity)}
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Out of Order Details */}
          <div className="space-y-4">
            {/* Timeline */}
            <Card className="border-gray-200 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg text-black flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Out of Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-black" />
                    <span className="text-sm font-medium text-black">Marked Out of Order:</span>
                  </div>
                  <Badge variant="outline" className="border-gray-400 text-black">
                    {daysOutOfOrder} days ago
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 pl-6">{formatDate(room.outOfOrderDate || "")}</p>
              </CardContent>
            </Card>

            {/* Revenue Impact */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-700 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-yellow-700">Daily Rate:</span>
                  <span className="text-sm font-medium text-yellow-700">{formatCurrency(room.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-yellow-700">Days Out of Order:</span>
                  <span className="text-sm font-medium text-yellow-700">{daysOutOfOrder} days</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-yellow-700">Total Lost Revenue:</span>
                  <span className="text-lg font-bold text-yellow-700">{formatCurrency(lostRevenue)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Reason Summary */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-700">Reason Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 font-medium">{room.outOfOrderReason || "No reason provided"}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Explanation */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Detailed Explanation</CardTitle>
            <CardDescription>Complete details about why this room is out of order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {room.outOfOrderDetails || "No detailed explanation provided."}
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
