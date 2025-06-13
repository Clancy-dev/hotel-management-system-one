"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard, User, Building, Calendar, Phone, Edit, Trash2, Loader2, Receipt, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { getPaymentById, deletePayment } from "@/actions/payment-edit"
import { toast } from "react-hot-toast"
import { useCurrency } from "@/hooks/use-currency"
import { EditPaymentDialog } from "./edit-payment-dialog"

interface PaymentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentId: string | null
  onPaymentDeleted?: () => void
  onPaymentUpdated?: () => void
}

interface DetailedPayment {
  id: string
  amount: number
  paymentMode: string
  receiptNumber?: string | null
  depositPaid?: number | null
  roomRate: number
  discountType?: string | null
  discountAmount?: number | null
  totalBill: number
  balanceRemaining: number
  status: string
  mobileMoneyProvider?: string | null
  mobileMoneyNumber?: string | null
  paymentDate: Date
  createdAt: Date
  booking: {
    id: string
    checkInDate: Date
    checkOutDate: Date
    numberOfGuests: number
    purposeOfStay: string
    company?: string | null
    guest: {
      firstName: string
      lastName: string
      phoneNumber: string
      email?: string | null
      nationality: string
    }
    room: {
      roomNumber: string
      category: {
        name: string
      }
    }
  }
}

export function PaymentDetailsDialog({
  open,
  onOpenChange,
  paymentId,
  onPaymentDeleted,
  onPaymentUpdated,
}: PaymentDetailsDialogProps) {
  const { formatPrice } = useCurrency()
  const [payment, setPayment] = useState<DetailedPayment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch payment details when dialog opens
  useEffect(() => {
    if (open && paymentId) {
      fetchPaymentDetails()
    }
  }, [open, paymentId])

  const fetchPaymentDetails = async () => {
    if (!paymentId) return

    setIsLoading(true)
    try {
      const result = await getPaymentById(paymentId)
      if (result.success && result.data) {
        // Transform the data to match the DetailedPayment interface
        const transformedData: DetailedPayment = {
          ...result.data,
          receiptNumber: result.data.receiptNumber || null,
          depositPaid: result.data.depositPaid || null,
          discountType: result.data.discountType || null,
          discountAmount: result.data.discountAmount || null,
          mobileMoneyProvider: result.data.mobileMoneyProvider || null,
          mobileMoneyNumber: result.data.mobileMoneyNumber || null,
          booking: {
            ...result.data.booking,
            company: result.data.booking.company || null,
            guest: {
              ...result.data.booking.guest,
              email: result.data.booking.guest.email || null,
            },
            room: {
              ...result.data.booking.room,
              category: result.data.booking.room.category
                ? { name: result.data.booking.room.category.name }
                : { name: "Unknown" },
            },
          },
        }
        setPayment(transformedData)
      } else {
        toast.error(result.error || "Failed to load payment details")
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to fetch payment details:", error)
      toast.error("Failed to load payment details")
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!payment) return

    setIsDeleting(true)
    try {
      const result = await deletePayment(payment.id)
      if (result.success) {
        toast.success("Payment deleted successfully!")
        onOpenChange(false)
        if (onPaymentDeleted) {
          onPaymentDeleted()
        }
      } else {
        toast.error(result.error || "Failed to delete payment")
      }
    } catch (error) {
      console.error("Failed to delete payment:", error)
      toast.error("Failed to delete payment")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleEdit = () => {
    setIsEditOpen(true)
  }

  const handlePaymentUpdated = (updatedPayment: any) => {
    setPayment(updatedPayment)
    if (onPaymentUpdated) {
      onPaymentUpdated()
    }
  }

  const getStatusBadge = (status: string) => {
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

  if (!payment && !isLoading) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </span>
              {payment && (
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
              {payment
                ? `Complete payment information for ${payment.booking.guest.firstName} ${payment.booking.guest.lastName}`
                : "Loading payment information..."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading payment details...</span>
              </div>
            ) : payment ? (
              <div className="space-y-6">
                {/* Payment Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Payment Summary
                      </span>
                      {getStatusBadge(payment.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                        <p className="font-medium">{format(new Date(payment.paymentDate), "PPP p")}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Amount Paid</label>
                        <p className="font-bold text-lg text-green-600">{formatPrice(payment.amount)}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Balance Remaining</label>
                        <p
                          className={`font-bold text-lg ${
                            payment.balanceRemaining > 0 ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          {payment.balanceRemaining > 0 ? formatPrice(payment.balanceRemaining) : "Fully Paid"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Payment Mode</label>
                        <p className="capitalize">{payment.paymentMode.replace("_", " ")}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Receipt Number</label>
                        <p className="flex items-center">
                          <Receipt className="h-4 w-4 mr-2" />
                          {payment.receiptNumber || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Record Created</label>
                        <p>{format(new Date(payment.createdAt), "PPP")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Billing Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Room Rate:</span>
                        <span>{formatPrice(payment.roomRate)}</span>
                      </div>
                      {payment.discountAmount && payment.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({payment.discountType}):</span>
                          <span>-{formatPrice(payment.discountAmount)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Bill:</span>
                        <span>{formatPrice(payment.totalBill)}</span>
                      </div>
                      {payment.depositPaid && payment.depositPaid > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>Deposit Paid:</span>
                          <span>{formatPrice(payment.depositPaid)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-green-600">
                        <span>Amount Paid:</span>
                        <span>{formatPrice(payment.amount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Balance Remaining:</span>
                        <span className={payment.balanceRemaining > 0 ? "text-orange-600" : "text-green-600"}>
                          {payment.balanceRemaining > 0 ? formatPrice(payment.balanceRemaining) : "Fully Paid"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Guest Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Guest Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Guest Name</label>
                        <p className="font-medium">
                          {payment.booking.guest.firstName} {payment.booking.guest.lastName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                        <p>{payment.booking.guest.nationality}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <p className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {payment.booking.guest.phoneNumber}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p>{payment.booking.guest.email || "Not provided"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Booking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Room</label>
                        <p className="font-medium">
                          {payment.booking.room.roomNumber} ({payment.booking.room.category.name})
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Number of Guests</label>
                        <p>{payment.booking.numberOfGuests}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Check-in Date</label>
                        <p>{format(new Date(payment.booking.checkInDate), "PPP")}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Check-out Date</label>
                        <p>{format(new Date(payment.booking.checkOutDate), "PPP")}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">Purpose of Stay</label>
                        <p className="capitalize">{payment.booking.purposeOfStay.replace("_", " ")}</p>
                      </div>
                      {payment.booking.company && (
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Company</label>
                          <p className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            {payment.booking.company}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Money Details */}
                {payment.mobileMoneyProvider && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mobile Money Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Provider</label>
                          <p>{payment.mobileMoneyProvider.replace("_", " ")}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                          <p>{payment.mobileMoneyNumber || "Not provided"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : null}
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
                <p className="text-muted-foreground mb-4">
                  Are you sure you want to delete this payment record? This action cannot be undone.
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
                      "Delete Payment"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <EditPaymentDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        payment={
          payment
            ? {
                ...payment,
                receiptNumber: payment.receiptNumber ?? undefined,
                depositPaid: payment.depositPaid ?? undefined,
                discountType: payment.discountType ?? undefined,
                discountAmount: payment.discountAmount ?? undefined,
                mobileMoneyProvider: payment.mobileMoneyProvider ?? undefined,
                mobileMoneyNumber: payment.mobileMoneyNumber ?? undefined,
              }
            : null
        }
        onPaymentUpdated={handlePaymentUpdated}
      />
    </>
  )
}
