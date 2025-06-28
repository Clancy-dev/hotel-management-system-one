"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

interface Room {
  id: string
  number: string
  status: string
  guest: string | null
  checkOut: string | null
  nextReservation: string
  price: number
  images: string[]
}

interface RoomTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomTypeName: string
  rooms: Room[]
  onViewImages: (room: Room) => void
}

export function RoomTypeDialog({ open, onOpenChange, roomTypeName, rooms, onViewImages }: RoomTypeDialogProps) {
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{roomTypeName} Rooms</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Room {room.number}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewImages(room)}>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        View Images
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {room.images.length > 0 && (
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={room.images[0] || "/placeholder.svg"}
                      alt={`Room ${room.number}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <Badge className={getStatusColor(room.status)}>{room.status}</Badge>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-primary">${room.price}</p>
                  <p className="text-xs text-muted-foreground">per night</p>
                </div>

                {room.guest && (
                  <div className="text-center">
                    <p className="text-sm font-medium">{room.guest}</p>
                    <p className="text-xs text-muted-foreground">Current Guest</p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Next Reservation:</p>
                  <p className="text-sm">{room.nextReservation}</p>
                </div>

                {room.images.length > 0 && (
                  <div className="flex justify-center">
                    <Badge variant="outline" className="text-xs">
                      <ImageIcon className="mr-1 h-3 w-3" />
                      {room.images.length} image{room.images.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
