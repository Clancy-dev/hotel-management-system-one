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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { updatePayment } from "@/actions/payment-edit"
import { toast } from "react-hot-toast"
import { useCurrency } from "@/hooks/use-currency"

interface Payment {
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
  paymentDate: Date | string
  booking: {
    id: string
    checkInDate: Date | string
    checkOutDate: Date | string
    guest: {
      firstName: string
      lastName: string
      phoneNumber: string
    }
    room: {
      roomNumber: string
      category: {
        name: string
      } | null
    }
  }
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface EditPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment | null
  onPaymentUpdated?: (payment: Payment) => void
}

interface FormData {
  amount: number
  paymentMode: string
  receiptNumber?: string
  depositPaid?: number
  discountType?: string
  discountAmount?: number
  mobileMoneyProvider?: string
  mobileMoneyNumber?: string
  status: string
}

const paymentModeOptions = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
]

const mobileMoneyProviders = [
  { value: "MTN_MoMo", label: "MTN Mobile Money" },
  { value: "Airtel_Money", label: "Airtel Money" },
]

const discountTypes = [
  { value: "none", label: "No Discount" },
  { value: "corporate", label: "Corporate Discount" },
  { value: "promo", label: "Promotional Discount" },
]

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "completed", label: "Completed" },
]

export function EditPaymentDialog({ open, onOpenChange, payment, onPaymentUpdated }: EditPaymentDialogProps) {
  const { formatPrice } = useCurrency()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>()

  const watchedValues = watch()

  // Reset form when payment changes
  useEffect(() => {
    if (payment) {
      setValue("amount", payment.amount)
      setValue("paymentMode", payment.paymentMode)
      setValue("receiptNumber", payment.receiptNumber || "")
      setValue("depositPaid", payment.depositPaid || 0)
      setValue("discountType", payment.discountType || "none")
      setValue("discountAmount", payment.discountAmount || 0)
      setValue("mobileMoneyProvider", payment.mobileMoneyProvider || "")
      setValue("mobileMoneyNumber", payment.mobileMoneyNumber || "")
      setValue("status", payment.status)
    }
  }, [payment, setValue])

  // Calculate new balance when amount changes
  const calculateNewBalance = () => {
    if (!payment || !watchedValues.amount) return 0
    const totalBill = payment.totalBill
    const depositPaid = watchedValues.depositPaid || 0
    const discountAmount = watchedValues.discountAmount || 0
    const adjustedTotal = totalBill - discountAmount
    return Math.max(0, adjustedTotal - watchedValues.amount - depositPaid)
  }

  const newBalance = calculateNewBalance()

  const onSubmit = async (data: FormData) => {
    if (!payment) return

    setIsSubmitting(true)
    try {
      const result = await updatePayment({
        id: payment.id,
        ...data,
      })

      if (result.success) {
        toast.success("Payment updated successfully!")
        onOpenChange(false)
        if (onPaymentUpdated && result.data) {
          onPaymentUpdated(result.data as unknown as Payment)
        }
      } else {
        toast.error(result.error || "Failed to update payment")
      }
    } catch (error) {
      console.error("Payment update error:", error)
      toast.error("Failed to update payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>Update payment information and recalculate balances automatically.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-1 space-y-6">
            {/* Payment Amount */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Paid *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("amount", { required: "Amount is required", min: 0 })}
                    className={errors.amount ? "border-red-500" : ""}
                  />
                  {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptNumber">Receipt Number</Label>
                  <Input id="receiptNumber" {...register("receiptNumber")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositPaid">Deposit Paid</Label>
                  <Input id="depositPaid" type="number" step="0.01" min="0" {...register("depositPaid", { min: 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select value={watchedValues.status} onValueChange={(value) => setValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Payment Mode */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <div className="space-y-3">
                <Label>Payment Mode *</Label>
                <RadioGroup
                  value={watchedValues.paymentMode}
                  onValueChange={(value) => setValue("paymentMode", value)}
                  className="grid grid-cols-2 gap-4"
                >
                  {paymentModeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`edit-${option.value}`} />
                      <Label htmlFor={`edit-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Mobile Money Details */}
              {watchedValues.paymentMode === "mobile_money" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mobile Money Provider</Label>
                    <RadioGroup
                      value={watchedValues.mobileMoneyProvider}
                      onValueChange={(value) => setValue("mobileMoneyProvider", value)}
                      className="flex flex-col space-y-2"
                    >
                      {mobileMoneyProviders.map((provider) => (
                        <div key={provider.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={provider.value} id={`edit-${provider.value}`} />
                          <Label htmlFor={`edit-${provider.value}`}>{provider.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileMoneyNumber">Mobile Money Number</Label>
                    <Input id="mobileMoneyNumber" {...register("mobileMoneyNumber")} />
                  </div>
                </div>
              )}
            </div>

            {/* Discount Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Discount & Billing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <RadioGroup
                    value={watchedValues.discountType}
                    onValueChange={(value) => setValue("discountType", value)}
                    className="flex flex-col space-y-2"
                  >
                    {discountTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={type.value} id={`edit-discount-${type.value}`} />
                        <Label htmlFor={`edit-discount-${type.value}`}>{type.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                {watchedValues.discountType !== "none" && (
                  <div className="space-y-2">
                    <Label htmlFor="discountAmount">Discount Amount</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("discountAmount", { min: 0 })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Billing Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Billing Summary</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Original Total:</span>
                  <span>{formatPrice(payment.totalBill)}</span>
                </div>
                {watchedValues.discountAmount && watchedValues.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(watchedValues.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span>{formatPrice(watchedValues.amount || 0)}</span>
                </div>
                {watchedValues.depositPaid && watchedValues.depositPaid > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Deposit:</span>
                    <span>{formatPrice(watchedValues.depositPaid)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>New Balance:</span>
                  <span className={newBalance > 0 ? "text-orange-600" : "text-green-600"}>
                    {newBalance > 0 ? formatPrice(newBalance) : "Fully Paid"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
