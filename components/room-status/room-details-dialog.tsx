"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCurrency } from "@/hooks/use-currency"
import { ImageIcon, Calendar, Clock, User, FileText, Images, Trash2, AlertTriangle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "react-hot-toast"
import { ImageGallery } from "../image-gallery"

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

interface StatusHistoryItem {
  id: string
  roomId: string
  statusId: string
  previousStatusId?: string
  notes?: string
  changedBy?: string
  changedAt: Date
  bookingId?: string
  room: Room
  status: RoomStatus
  previousStatus?: RoomStatus
  booking?: {
    id: string
    guestId: string
    guest: {
      id: string
      firstName: string
      lastName: string
    }
  }
}

interface RoomDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  statusHistory: StatusHistoryItem[]
}

export function RoomDetailsDialog({ open, onOpenChange, room, statusHistory }: RoomDetailsDialogProps) {
  const { formatPrice } = useCurrency()
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isDeleteAllAlertOpen, setIsDeleteAllAlertOpen] = useState(false)
  const [historyToDelete, setHistoryToDelete] = useState<string | null>(null)
  const [localStatusHistory, setLocalStatusHistory] = useState<StatusHistoryItem[]>(statusHistory)

  // Update local history when prop changes
  useEffect(() => {
    setLocalStatusHistory(statusHistory)
  }, [statusHistory])

  if (!room) return null

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDeleteHistory = (id: string) => {
    setHistoryToDelete(id)
    setIsDeleteAlertOpen(true)
  }

  const confirmDeleteHistory = () => {
    if (historyToDelete) {
      // In a real app, you would call an API to delete the history item
      // For now, we'll just update the local state
      setLocalStatusHistory((prev) => prev.filter((item) => item.id !== historyToDelete))
      toast.success("Status history item deleted successfully")
    }
    setIsDeleteAlertOpen(false)
    setHistoryToDelete(null)
  }

  const handleDeleteAllHistory = () => {
    setIsDeleteAllAlertOpen(true)
  }

  const confirmDeleteAllHistory = () => {
    // In a real app, you would call an API to delete all history items
    // For now, we'll just update the local state
    setLocalStatusHistory([])
    toast.success("All status history deleted successfully")
    setIsDeleteAllAlertOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Room {room.roomNumber} Details</DialogTitle>
            <DialogDescription>View detailed information about this room and its status history.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="px-6 justify-start border-b rounded-none">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="history">Status History</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="p-6 pt-4">
                <TabsContent value="details" className="mt-0 space-y-4">
                  {/* Room Images */}
                  <div className="aspect-video w-full overflow-hidden rounded-md bg-muted relative group">
                    {room.images && room.images.length > 0 ? (
                      <>
                        <img
                          src={room.images[0] || "/placeholder.svg"}
                          alt={`Room ${room.roomNumber}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-2 right-2 opacity-80 hover:opacity-100"
                          onClick={() => setIsGalleryOpen(true)}
                        >
                          <Images className="h-4 w-4 mr-2" />
                          View All Images ({room.images.length})
                        </Button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                        <p className="text-muted-foreground mt-2">No images available</p>
                      </div>
                    )}
                  </div>

                  {/* Room Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Room Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Room Number:</span>
                          <span className="font-medium">{room.roomNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{room.category?.name || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">{formatPrice(room.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Status:</span>
                          {room.currentStatus ? (
                            <Badge style={{ backgroundColor: room.currentStatus.color }} className="text-white">
                              {room.currentStatus.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No Status</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{room.description || "No description available."}</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Room Images</CardTitle>
                      <CardDescription>View all images for this room</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {room.images && room.images.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {room.images.map((image, index) => (
                            <div
                              key={index}
                              className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                setIsGalleryOpen(true)
                              }}
                            >
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Room ${room.roomNumber} - Image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <ImageIcon className="h-16 w-16 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground mt-4">No images available for this room</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Status History</CardTitle>
                        <CardDescription>Recent status changes for this room</CardDescription>
                      </div>
                      {localStatusHistory.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteAllHistory}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete All
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {localStatusHistory.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No status history available</p>
                      ) : (
                        <div className="space-y-4">
                          {localStatusHistory.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge style={{ backgroundColor: item.status.color }} className="text-white">
                                    {item.status.name}
                                  </Badge>
                                  {item.previousStatus && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">from</span>
                                      <Badge
                                        variant="outline"
                                        style={{
                                          color: item.previousStatus.color,
                                          borderColor: item.previousStatus.color,
                                        }}
                                      >
                                        {item.previousStatus.name}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(item.changedAt)}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive/80"
                                    onClick={() => handleDeleteHistory(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {item.booking && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Booking by{" "}
                                    <span className="font-medium">
                                      {item.booking.guest.firstName} {item.booking.guest.lastName}
                                    </span>
                                  </span>
                                </div>
                              )}

                              {item.changedBy && (
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span>Changed by {item.changedBy}</span>
                                </div>
                              )}

                              {item.notes && (
                                <div className="flex gap-2 text-sm">
                                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <p className="text-muted-foreground">{item.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Image Gallery */}
      <ImageGallery images={room.images || []} open={isGalleryOpen} onOpenChange={setIsGalleryOpen} />

      {/* Delete History Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this status history item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All History Confirmation */}
      <AlertDialog open={isDeleteAllAlertOpen} onOpenChange={setIsDeleteAllAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all status history for this room? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAllHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
