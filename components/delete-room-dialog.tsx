"use client"

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
import { formatCurrency } from "@/lib/currency"
import { Trash2 } from "lucide-react"
// import { formatCurrency } from "@/lib/currency"

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

interface DeleteRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  onConfirm: () => void
}

export function DeleteRoomDialog({ open, onOpenChange, room, onConfirm }: DeleteRoomDialogProps) {
  if (!room) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Room {room.number}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to delete this room? This action cannot be undone.</p>
            <div className="bg-muted p-3 rounded-lg space-y-1">
              <p className="font-medium">Room Details:</p>
              <p className="text-sm">• Room Number: {room.number}</p>
              <p className="text-sm">• Type: {room.type}</p>
              <p className="text-sm">• Price: {formatCurrency(room.price)} per night</p>
              <p className="text-sm">• Status: {room.status}</p>
              <p className="text-sm">• Images: {room.images.length} image(s)</p>
            </div>
            <p className="text-red-600 font-medium">⚠️ This will permanently remove all room data and history.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Room
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
