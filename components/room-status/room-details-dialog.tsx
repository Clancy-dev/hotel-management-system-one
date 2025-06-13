"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { ImageIcon, Calendar } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"
import { useState } from "react"
import { ImageGallery } from "../rooms/image-gallery"


interface RoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
}

interface RoomCategory {
  id: string
  name: string
}

interface Room {
  id: string
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images: string[]
  createdAt: Date
  category?: RoomCategory
  currentStatus?: RoomStatus
}

interface RoomDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  statusHistory: any[]
}

export function RoomDetailsDialog({ open, onOpenChange, room, statusHistory }: RoomDetailsDialogProps) {
  const { formatPrice } = useCurrency()
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  if (!room) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Room {room.roomNumber} Details</DialogTitle>
            <DialogDescription>
              {room.category?.name} - {formatPrice(room.price)}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Room Details</TabsTrigger>
              <TabsTrigger value="history">Status History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Room Images */}
                <div
                  className="aspect-video w-full overflow-hidden rounded-md bg-muted cursor-pointer"
                  onClick={() => setIsGalleryOpen(true)}
                >
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0] || "/placeholder.svg"}
                      alt={`Room ${room.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Room Status */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Current Status</h3>
                  {room.currentStatus ? (
                    <Badge
                      variant="secondary"
                      className="text-white"
                      style={{ backgroundColor: room.currentStatus.color }}
                    >
                      {room.currentStatus.name}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">No Status</Badge>
                  )}
                </div>

                {/* Room Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Room Number</h3>
                    <p className="font-medium">{room.roomNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                    <p>{room.category?.name || "Unknown Category"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                    <p className="font-medium">{formatPrice(room.price)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                    <p className="font-mono">{format(new Date(room.createdAt), "PPP")}</p>
                  </div>
                </div>

                {/* Room Description */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  {room.description ? (
                    <div className="bg-muted p-3 rounded-md whitespace-pre-wrap text-sm">{room.description}</div>
                  ) : (
                    <p className="text-muted-foreground">No description provided</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-y-auto">
              {statusHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mb-4 opacity-50" />
                  <p>No status history available for this room</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {statusHistory.map((item: any) => (
                    <div key={item.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge
                          variant="secondary"
                          className="text-white"
                          style={{ backgroundColor: item.status?.color || "#888888" }}
                        >
                          {item.status?.name || "Unknown Status"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(item.changedAt), "PPP p")}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>
                          <span className="text-muted-foreground">Changed by: </span>
                          {item.changedBy || "System"}
                        </p>
                        {item.booking && (
                          <p>
                            <span className="text-muted-foreground">Guest: </span>
                            {item.booking.guest.firstName} {item.booking.guest.lastName}
                          </p>
                        )}
                        {item.notes && (
                          <div className="mt-2">
                            <p className="text-muted-foreground mb-1">Notes:</p>
                            <p className="italic bg-muted p-2 rounded-md">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Image Gallery */}
      <ImageGallery images={room.images || []} open={isGalleryOpen} onOpenChange={setIsGalleryOpen} />
    </>
  )
}
