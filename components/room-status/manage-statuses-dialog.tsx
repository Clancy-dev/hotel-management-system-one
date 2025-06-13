"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Edit, Trash2, Loader2, Save, X, Eye } from "lucide-react"
import { updateRoomStatus, deleteRoomStatus } from "@/actions/room-status"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { RoomStatusDetailsDialog } from "./room-status-details-dialog"
// import { RoomStatusDetailsDialog } from "./room-status-details-dialog"

interface RoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
}

interface ManageStatusesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statuses: RoomStatus[]
}

interface EditFormData {
  name: string
  color: string
  description?: string
  isDefault: boolean
}

export function ManageStatusesDialog({ open, onOpenChange, statuses }: ManageStatusesDialogProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>(null)
  const [isStatusDetailsOpen, setIsStatusDetailsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditFormData>()

  const watchedValues = watch()

  const startEditing = (status: RoomStatus) => {
    setEditingId(status.id)
    setValue("name", status.name)
    setValue("color", status.color)
    setValue("description", status.description || "")
    setValue("isDefault", status.isDefault)
  }

  const cancelEditing = () => {
    setEditingId(null)
    reset()
  }

  const onSubmit = async (data: EditFormData) => {
    if (!editingId) return

    setIsSubmitting(true)
    try {
      const result = await updateRoomStatus({
        id: editingId,
        name: data.name.trim(),
        color: data.color,
        description: data.description?.trim(),
        isDefault: data.isDefault,
      })

      if (result.success) {
        toast.success("Status updated successfully!")
        setEditingId(null)
        reset()
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Status update error:", error)
      toast.error("Failed to update status")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (statusId: string) => {
    setDeletingId(statusId)
    try {
      const result = await deleteRoomStatus(statusId)

      if (result.success) {
        toast.success("Status deleted successfully!")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete status")
      }
    } catch (error) {
      console.error("Status deletion error:", error)
      toast.error("Failed to delete status")
    } finally {
      setDeletingId(null)
    }
  }

  const handleViewDetails = (status: RoomStatus) => {
    setSelectedStatusId(status.id)
    setIsStatusDetailsOpen(true)
  }

  const handleStatusUpdated = () => {
    router.refresh()
  }

  const handleStatusDeleted = () => {
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Manage Room Statuses</DialogTitle>
          <DialogDescription>
            Edit existing room statuses, set default status, or remove unused statuses.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-4">
            {statuses.map((status) => (
              <Card key={status.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="text-white" style={{ backgroundColor: status.color }}>
                        {status.name}
                      </Badge>
                      {status.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingId === status.id ? (
                        <>
                          <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="h-8">
                            {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing} className="h-8">
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => handleViewDetails(status)} className="h-8">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => startEditing(status)} className="h-8">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(status.id)}
                            disabled={deletingId === status.id}
                            className="h-8"
                          >
                            {deletingId === status.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {editingId === status.id ? (
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${status.id}`}>Status Name</Label>
                          <Input
                            id={`name-${status.id}`}
                            {...register("name", { required: "Status name is required" })}
                            className={errors.name ? "border-red-500" : ""}
                          />
                          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`color-${status.id}`}>Color</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              id={`color-${status.id}`}
                              value={watchedValues.color}
                              onChange={(e) => setValue("color", e.target.value)}
                              className="w-10 h-10 rounded border cursor-pointer"
                            />
                            <Input
                              value={watchedValues.color}
                              onChange={(e) => setValue("color", e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${status.id}`}>Description</Label>
                        <Textarea
                          id={`description-${status.id}`}
                          {...register("description")}
                          className="min-h-[60px]"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`default-${status.id}`}
                          checked={watchedValues.isDefault}
                          onCheckedChange={(checked) => setValue("isDefault", !!checked)}
                        />
                        <Label htmlFor={`default-${status.id}`}>Set as default status</Label>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      {status.description && <p className="text-sm text-muted-foreground">{status.description}</p>}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Color: {status.color}</span>
                        <span>Created: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {statuses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No room statuses found.</p>
                <p className="text-sm">Create your first status to get started.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      {/* Room Status Details Dialog */}
      <RoomStatusDetailsDialog
        open={isStatusDetailsOpen}
        onOpenChange={setIsStatusDetailsOpen}
        statusId={selectedStatusId}
        onStatusDeleted={handleStatusDeleted}
        onStatusUpdated={handleStatusUpdated}
      />
    </Dialog>
  )
}
