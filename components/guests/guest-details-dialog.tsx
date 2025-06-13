"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Car,
  Building,
  FileText,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { getGuestById, deleteGuest } from "@/actions/guest-edit"
import { toast } from "react-hot-toast"
import { useCurrency } from "@/hooks/use-currency"
import { EditGuestDialog } from "./edit-guest-dialog"

interface GuestDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guestId: string | null
  onGuestDeleted?: () => void
  onGuestUpdated?: () => void
}

interface DetailedGuest {
  id: string
  firstName: string
  lastName: string
  nationality: string
  gender: string
  dateOfBirth?: Date | null
  phoneNumber: string
  email?: string | null
  address?: string | null
  nextOfKin?: string | null
  ninNumber?: string | null
  passportNumber?: string | null
  visaType?: string | null
  visaNumber?: string | null
  drivingPermit?: string | null
  emergencyContact?: string | null
  createdAt: Date
  updatedAt: Date
  bookings: Array<{
    id: string
    checkInDate: Date
    checkOutDate: Date
    actualCheckIn?: Date
    actualCheckOut?: Date
    numberOfGuests: number
    purposeOfStay: string
    purposeDetails?: string
    vehicleRegistration?: string
    vehicleType?: string
    parkingRequired: boolean
    company?: string
    status: string
    room: {
      roomNumber: string
      category: {
        name: string
      }
    }
    payments: Array<{
      id: string
      amount: number
      totalBill: number
      balanceRemaining: number
      status: string
      paymentMode: string
      paymentDate: Date
    }>
    additionalGuests: Array<{
      guest: {
        firstName: string
        lastName: string
      }
    }>
  }>
}

export function GuestDetailsDialog({
  open,
  onOpenChange,
  guestId,
  onGuestDeleted,
  onGuestUpdated,
}: GuestDetailsDialogProps) {
  const { formatPrice } = useCurrency()
  const [guest, setGuest] = useState<DetailedGuest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch guest details when dialog opens
  useEffect(() => {
    if (open && guestId) {
      fetchGuestDetails()
    }
  }, [open, guestId])

  const fetchGuestDetails = async () => {
    if (!guestId) return

    setIsLoading(true)
    try {
      const result = await getGuestById(guestId)
      if (result.success && result.data) {
        const mappedData = {
          ...result.data,
          bookings: result.data.bookings.map((booking: any) => ({
            ...booking,
            actualCheckIn: booking.actualCheckIn === null ? undefined : booking.actualCheckIn,
            actualCheckOut: booking.actualCheckOut === null ? undefined : booking.actualCheckOut,
          })),
          dateOfBirth: result.data.dateOfBirth === null ? undefined : result.data.dateOfBirth,
          updatedAt: result.data.updatedAt,
        }
        setGuest(mappedData)
        setGuest(mappedData)
      } else {
        toast.error(result.error || "Failed to load guest details")
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to fetch guest details:", error)
      toast.error("Failed to load guest details")
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!guest) return

    setIsDeleting(true)
    try {
      const result = await deleteGuest(guest.id)
      if (result.success) {
        toast.success("Guest deleted successfully!")
        onOpenChange(false)
        if (onGuestDeleted) {
          onGuestDeleted()
        }
      } else {
        toast.error(result.error || "Failed to delete guest")
      }
    } catch (error) {
      console.error("Failed to delete guest:", error)
      toast.error("Failed to delete guest")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleEdit = () => {
    setIsEditOpen(true)
  }

  const handleGuestUpdated = (updatedGuest: any) => {
    setGuest(updatedGuest)
    if (onGuestUpdated) {
      onGuestUpdated()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>
      case "checked_out":
        return <Badge variant="secondary">Checked Out</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>
      case "partial":
        return <Badge className="bg-yellow-600 text-white">Partial</Badge>
      case "pending":
        return <Badge variant="destructive">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!guest && !isLoading) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Guest Details
              </span>
              {guest && (
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline" onClick={handleEdit}>
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
              {guest
                ? `Complete information and booking history for ${guest.firstName} ${guest.lastName}`
                : "Loading guest information..."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading guest details...</span>
              </div>
            ) : guest ? (
              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="font-medium">
                          {guest.firstName} {guest.lastName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                        <p>{guest.nationality}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <p className="capitalize">{guest.gender}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p>{guest.dateOfBirth ? format(new Date(guest.dateOfBirth), "PPP") : "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <p className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {guest.phoneNumber}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {guest.email || "Not provided"}
                        </p>
                      </div>
                      {guest.address && (
                        <div className="space-y-1 md:col-span-2 lg:col-span-3">
                          <label className="text-sm font-medium text-muted-foreground">Address</label>
                          <p className="flex items-start">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                            {guest.address}
                          </p>
                        </div>
                      )}
                      {guest.nextOfKin && (
                        <div className="space-y-1 md:col-span-2 lg:col-span-3">
                          <label className="text-sm font-medium text-muted-foreground">Next of Kin</label>
                          <p>{guest.nextOfKin}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                        <p className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(guest.createdAt), "PPP")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Identification Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Identification Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guest.ninNumber && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">National ID (NIN)</label>
                          <p>{guest.ninNumber}</p>
                        </div>
                      )}
                      {guest.passportNumber && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Passport Number</label>
                          <p>{guest.passportNumber}</p>
                        </div>
                      )}
                      {guest.visaType && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Visa Type</label>
                          <p>{guest.visaType}</p>
                        </div>
                      )}
                      {guest.visaNumber && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Visa Number</label>
                          <p>{guest.visaNumber}</p>
                        </div>
                      )}
                      {guest.drivingPermit && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Driving Permit</label>
                          <p>{guest.drivingPermit}</p>
                        </div>
                      )}
                      {guest.emergencyContact && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                          <p>{guest.emergencyContact}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Booking History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Booking History
                      </span>
                      <Badge variant="secondary">{guest.bookings.length} booking(s)</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {guest.bookings.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No bookings found</p>
                    ) : (
                      <div className="space-y-4">
                        {guest.bookings.map((booking, index) => (
                          <div key={booking.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">
                                Room {booking.room.roomNumber} ({booking.room.category.name})
                              </h4>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <label className="font-medium text-muted-foreground">Check-in Date</label>
                                <p>{format(new Date(booking.checkInDate), "PPP")}</p>
                                {booking.actualCheckIn && (
                                  <p className="text-xs text-muted-foreground">
                                    Actual: {format(new Date(booking.actualCheckIn), "PPP p")}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="font-medium text-muted-foreground">Check-out Date</label>
                                <p>{format(new Date(booking.checkOutDate), "PPP")}</p>
                                {booking.actualCheckOut && (
                                  <p className="text-xs text-muted-foreground">
                                    Actual: {format(new Date(booking.actualCheckOut), "PPP p")}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="font-medium text-muted-foreground">Guests</label>
                                <p>{booking.numberOfGuests}</p>
                              </div>
                              <div>
                                <label className="font-medium text-muted-foreground">Purpose</label>
                                <p className="capitalize">{booking.purposeOfStay.replace("_", " ")}</p>
                              </div>
                              {booking.company && (
                                <div>
                                  <label className="font-medium text-muted-foreground">Company</label>
                                  <p className="flex items-center">
                                    <Building className="h-3 w-3 mr-1" />
                                    {booking.company}
                                  </p>
                                </div>
                              )}
                              {booking.vehicleRegistration && (
                                <div>
                                  <label className="font-medium text-muted-foreground">Vehicle</label>
                                  <p className="flex items-center">
                                    <Car className="h-3 w-3 mr-1" />
                                    {booking.vehicleRegistration}
                                    {booking.vehicleType && ` (${booking.vehicleType})`}
                                  </p>
                                </div>
                              )}
                            </div>

                            {booking.purposeDetails && (
                              <div className="mt-3">
                                <label className="font-medium text-muted-foreground text-sm">Purpose Details</label>
                                <p className="text-sm">{booking.purposeDetails}</p>
                              </div>
                            )}

                            {booking.additionalGuests.length > 0 && (
                              <div className="mt-3">
                                <label className="font-medium text-muted-foreground text-sm">Additional Guests</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {booking.additionalGuests.map((additionalGuest, idx) => (
                                    <Badge key={idx} variant="outline">
                                      {additionalGuest.guest.firstName} {additionalGuest.guest.lastName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Payment Information */}
                            {booking.payments.length > 0 && (
                              <div className="mt-4 pt-4 border-t">
                                <h5 className="font-medium mb-2 flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Payment History
                                </h5>
                                <div className="space-y-2">
                                  {booking.payments.map((payment, paymentIdx) => (
                                    <div key={payment.id} className="flex items-center justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <span>{format(new Date(payment.paymentDate), "MMM dd, yyyy")}</span>
                                        <span className="capitalize">{payment.paymentMode.replace("_", " ")}</span>
                                        {getPaymentStatusBadge(payment.status)}
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium">{formatPrice(payment.amount)}</div>
                                        {payment.balanceRemaining > 0 && (
                                          <div className="text-xs text-orange-600">
                                            Balance: {formatPrice(payment.balanceRemaining)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
                  Are you sure you want to delete this guest? This action cannot be undone.
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
                      "Delete Guest"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Guest Dialog */}
      <EditGuestDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        guest={guest}
        onGuestUpdated={handleGuestUpdated}
      />
    </>
  )
}
