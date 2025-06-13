"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { updateRoomCurrentStatus } from "@/actions/room-status"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/hooks/use-language"

interface RoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
}

interface Room {
  id: string
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images: string[]
  createdAt: Date
  category?: {
    id: string
    name: string
  }
  currentStatus?: RoomStatus
}

interface UpdateRoomStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  roomStatuses: RoomStatus[]
  onStatusUpdated?: (room: Room) => void
}

interface FormData {
  statusId: string
  notes?: string
}

export function UpdateRoomStatusDialog({
  open,
  onOpenChange,
  room,
  roomStatuses,
  onStatusUpdated,
}: UpdateRoomStatusDialogProps) {
  const { t } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      statusId: room?.currentStatus?.id || "",
      notes: "",
    },
  })

  const watchedValues = watch()

  // Reset form when room changes or dialog opens
  useEffect(() => {
    if (room && open) {
      setValue("statusId", room.currentStatus?.id || "")
      setValue("notes", "")
    }
  }, [room, open, setValue])

  const selectedStatus = roomStatuses.find((status) => status.id === watchedValues.statusId)
  const requiresNotes = selectedStatus?.name === "Maintenance" || selectedStatus?.name === "Out of Order"

  const onSubmit = async (data: FormData) => {
    if (!room || !data.statusId) return

    setIsSubmitting(true)
    try {
      const result = await updateRoomCurrentStatus(
        room.id,
        data.statusId,
        data.notes,
        "user", // You might want to get actual user info
      )

      if (result.success) {
        toast.success("Room status updated successfully!")

        // Find the new status object
        const newStatus = roomStatuses.find((s) => s.id === data.statusId)

        // Create updated room object with the new status
        const updatedRoom = {
          ...room,
          currentStatus: newStatus,
        }

        // Call the callback with the updated room
        if (onStatusUpdated) {
          onStatusUpdated(updatedRoom)
        }

        reset()
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to update room status")
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast.error("Failed to update room status")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Update Room Status</DialogTitle>
          <DialogDescription>
            Change the status for Room {room.roomNumber} ({room.category?.name}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Current Status */}
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="p-3 bg-muted rounded-md">
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
            </div>

            {/* New Status Selection */}
            <div className="space-y-3">
              <Label>New Status *</Label>
              <RadioGroup
                value={watchedValues.statusId}
                onValueChange={(value) => setValue("statusId", value)}
                className="grid grid-cols-1 gap-3"
              >
                {roomStatuses.map((status) => (
                  <div key={status.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={status.id} id={status.id} />
                    <Label htmlFor={status.id} className="flex items-center space-x-2 cursor-pointer flex-1">
                      <Badge
                        variant="secondary"
                        className="text-white text-xs"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.name}
                      </Badge>
                      {status.description && (
                        <span className="text-sm text-muted-foreground">- {status.description}</span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.statusId && <p className="text-red-500 text-sm">Please select a status</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes {requiresNotes && <span className="text-red-500">*</span>}</Label>
              <Textarea
                id="notes"
                {...register("notes", {
                  required: requiresNotes ? "Notes are required for this status" : false,
                })}
                placeholder={
                  selectedStatus?.name === "Maintenance"
                    ? "Describe the maintenance work needed..."
                    : selectedStatus?.name === "Out of Order"
                      ? "Explain why the room is out of order..."
                      : "Add any additional notes (optional)..."
                }
                className={errors.notes ? "border-red-500" : ""}
              />
              {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
            </div>

            {/* Status Preview */}
            {selectedStatus && (
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Preview:</span>
                  <Badge variant="secondary" className="text-white" style={{ backgroundColor: selectedStatus.color }}>
                    {selectedStatus.name}
                  </Badge>
                </div>
                {selectedStatus.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedStatus.description}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !watchedValues.statusId}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
