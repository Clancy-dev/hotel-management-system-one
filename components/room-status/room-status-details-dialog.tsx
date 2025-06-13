"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Calendar, Users, Edit, Trash2, Loader2, Home, Palette, FileText } from "lucide-react"
import { format } from "date-fns"
import { getRoomStatuses, deleteRoomStatus } from "@/actions/room-status"
import { toast } from "react-hot-toast"

interface RoomStatusDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  statusId: string | null
  onStatusDeleted?: () => void
  onStatusUpdated?: () => void
}

interface DetailedRoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    rooms: number
    statusHistory: number
  }
}

export function RoomStatusDetailsDialog({
  open,
  onOpenChange,
  statusId,
  onStatusDeleted,
  onStatusUpdated,
}: RoomStatusDetailsDialogProps) {
  const [status, setStatus] = useState<DetailedRoomStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch status details when dialog opens
  useEffect(() => {
    if (open && statusId) {
      fetchStatusDetails()
    }
  }, [open, statusId])

  const fetchStatusDetails = async () => {
    if (!statusId) return

    setIsLoading(true)
    try {
      const result = await getRoomStatuses()
      if (result.success && result.data) {
        const foundStatus = result.data.find((s: any) => s.id === statusId)
        if (foundStatus) {
          setStatus({
                      ...foundStatus,
                      description: foundStatus.description ?? undefined,
                      _count: {
                        rooms: 0, // This would need to be fetched from the database
                        statusHistory: 0, // This would need to be fetched from the database
                      },
                    })
        } else {
          toast.error("Room status not found")
          onOpenChange(false)
        }
      } else {
        toast.error(result.error || "Failed to load room status details")
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to fetch room status details:", error)
      toast.error("Failed to load room status details")
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!status) return

    setIsDeleting(true)
    try {
      const result = await deleteRoomStatus(status.id)
      if (result.success) {
        toast.success("Room status deleted successfully!")
        onOpenChange(false)
        if (onStatusDeleted) {
          onStatusDeleted()
        }
      } else {
        toast.error(result.error || "Failed to delete room status")
      }
    } catch (error) {
      console.error("Failed to delete room status:", error)
      toast.error("Failed to delete room status")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (!status && !isLoading) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Room Status Details
              </span>
              {status && (
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onStatusUpdated?.()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {status
                ? `Complete information about the "${status.name}" room status`
                : "Loading room status information..."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading status details...</span>
              </div>
            ) : status ? (
              <div className="space-y-6">
                {/* Status Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        <Palette className="h-5 w-5 mr-2" />
                        Status Overview
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-white" style={{ backgroundColor: status.color }}>
                          {status.name}
                        </Badge>
                        {status.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Default
                          </Badge>
                        )}
                        {!status.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Status Name</label>
                        <p className="font-medium">{status.name}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Color Code</label>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded border" style={{ backgroundColor: status.color }} />
                          <span className="font-mono text-sm">{status.color}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Status Type</label>
                        <div className="flex items-center space-x-2">
                          {status.isDefault ? (
                            <Badge className="bg-blue-600">Default Status</Badge>
                          ) : (
                            <Badge variant="secondary">Custom Status</Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Active Status</label>
                        <div className="flex items-center space-x-2">
                          {status.isActive ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="flex items-start">
                          <FileText className="h-4 w-4 mr-2 mt-0.5" />
                          {status.description || "No description provided"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Usage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Rooms Currently Using</label>
                        <p className="flex items-center">
                          <Home className="h-4 w-4 mr-2" />
                          <span className="font-medium">{status._count?.rooms || 0} room(s)</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Total Status Changes</label>
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium">{status._count?.statusHistory || 0} change(s)</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                        <p>{format(new Date(status.createdAt), "PPP p")}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                        <p>{format(new Date(status.updatedAt), "PPP p")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Guidelines */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <p className="font-medium text-blue-800">When to use this status:</p>
                        <p className="text-blue-700">
                          {status.description ||
                            "Use this status when rooms meet the specific criteria defined for this category."}
                        </p>
                      </div>

                      {status.isDefault && (
                        <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                          <p className="font-medium text-green-800">Default Status:</p>
                          <p className="text-green-700">
                            This is the default status assigned to new rooms. All new rooms will automatically use this
                            status unless manually changed.
                          </p>
                        </div>
                      )}

                      {!status.isActive && (
                        <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                          <p className="font-medium text-red-800">Inactive Status:</p>
                          <p className="text-red-700">
                            This status is currently inactive and cannot be assigned to rooms. Existing rooms with this
                            status will retain it until changed.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
                <p className="text-muted-foreground mb-4">
                  Are you sure you want to delete this room status? This action cannot be undone and may affect rooms
                  currently using this status.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Status"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
