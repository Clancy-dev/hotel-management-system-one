"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit } from "lucide-react"
import { toast } from "react-hot-toast"

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

interface EditOutOfOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  onUpdate: (updatedRoom: Room) => void
}

export function EditOutOfOrderDialog({ open, onOpenChange, room, onUpdate }: EditOutOfOrderDialogProps) {
  const [formData, setFormData] = useState({
    reason: "",
    details: "",
  })

  // Load room data when dialog opens
  useEffect(() => {
    if (room && open) {
      setFormData({
        reason: room.outOfOrderReason || "",
        details: room.outOfOrderDetails || "",
      })
    }
  }, [room, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!room || !formData.reason || !formData.details) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const updatedRoom: Room = {
        ...room,
        outOfOrderReason: formData.reason,
        outOfOrderDetails: formData.details,
      }

      // Update room in localStorage
      const savedRooms = localStorage.getItem("hotel-rooms")
      if (savedRooms) {
        const allRooms = JSON.parse(savedRooms)
        const updatedRooms = allRooms.map((r: Room) => (r.id === room.id ? updatedRoom : r))
        localStorage.setItem("hotel-rooms", JSON.stringify(updatedRooms))
      }

      onUpdate(updatedRoom)
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update room. Please try again.")
    }
  }

  const handleClearForm = () => {
    setFormData({
      reason: "",
      details: "",
    })
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Out of Order Details</DialogTitle>
          <DialogDescription>Update the reason and details for Room {room.number}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-reason">Reason *</Label>
            <Input
              id="edit-reason"
              placeholder="Brief reason for being out of order"
              value={formData.reason}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-details">Detailed Explanation *</Label>
            <Textarea
              id="edit-details"
              placeholder="Provide detailed explanation..."
              value={formData.details}
              onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
              rows={4}
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClearForm} className="flex-1 bg-transparent">
              Clear Form
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Update Details
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
