"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Users, Bed, Maximize, Calendar, Clock, ImageIcon } from "lucide-react"
import { formatCurrency } from "@/lib/currency"
import Image from "next/image"

interface Room {
  id: string
  number: string
  type: string
  status: string
  price: number
  amenities: string[]
  lastCleaned: string
  nextReservation: string
  images: string[]
  bedType?: string
  size?: string
  maxOccupancy?: number
  description?: string
}

interface RoomDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
}

export function RoomDetailsDialog({ open, onOpenChange, room }: RoomDetailsDialogProps) {
  if (!room) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "reserved":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "booked":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "dirty":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "maintenance":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "out-of-order":
        return "bg-black text-white"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Room {room.number} Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{room.type}</h3>
              <p className="text-muted-foreground">{room.description || "No description available"}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(room.status)} text-sm px-3 py-1`}>
                {room.status.toUpperCase()}
              </Badge>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{formatCurrency(room.price)}</div>
                <div className="text-sm text-muted-foreground">per night</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Images */}
          {room.images.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Room Images ({room.images.length})
              </h4>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {room.images.map((image, index) => (
                  <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Room ${room.number} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Room Specifications */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Bed Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{room.bedType || "Not specified"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Maximize className="h-4 w-4" />
                  Room Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{room.size || "Not specified"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Max Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{room.maxOccupancy || "Not specified"} guests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Room ID</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold font-mono">{room.id}</p>
              </CardContent>
            </Card>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Amenities</h4>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {room.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Information */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Cleaned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{room.lastCleaned}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Next Reservation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{room.nextReservation}</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Type:</span>
                <span className="font-medium">{room.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per Night:</span>
                <span className="font-medium">{formatCurrency(room.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Images:</span>
                <span className="font-medium">{room.images.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amenities:</span>
                <span className="font-medium">{room.amenities.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
