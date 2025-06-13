"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

interface UpdatePaymentInput {
  id: string
  amount?: number
  paymentMode?: string
  receiptNumber?: string
  depositPaid?: number
  discountType?: string
  discountAmount?: number
  mobileMoneyProvider?: string
  mobileMoneyNumber?: string
  status?: string
}

// Get payment by ID with all related data
export async function getPaymentById(id: string) {
  try {
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            guest: true,
            room: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return { success: false, error: "Payment not found" }
    }

    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to get payment:", error)
    return { success: false, error: "Failed to get payment" }
  }
}

// Update payment information
export async function updatePayment(data: UpdatePaymentInput) {
  try {
    // Get current payment to calculate new balance
    const currentPayment = await db.payment.findUnique({
      where: { id: data.id },
    })

    if (!currentPayment) {
      return { success: false, error: "Payment not found" }
    }

    // Calculate new balance if amount changed
    let balanceRemaining = currentPayment.balanceRemaining
    let status = currentPayment.status

    if (data.amount !== undefined) {
      const totalBill = currentPayment.totalBill
      const depositPaid = data.depositPaid ?? currentPayment.depositPaid ?? 0
      balanceRemaining = totalBill - data.amount - depositPaid

      // Update status based on balance
      if (balanceRemaining <= 0) {
        status = "completed"
        balanceRemaining = 0
      } else if (balanceRemaining < totalBill) {
        status = "partial"
      } else {
        status = "pending"
      }
    }

    const payment = await db.payment.update({
      where: { id: data.id },
      data: {
        amount: data.amount,
        paymentMode: data.paymentMode,
        receiptNumber: data.receiptNumber,
        depositPaid: data.depositPaid,
        discountType: data.discountType,
        discountAmount: data.discountAmount,
        mobileMoneyProvider: data.mobileMoneyProvider,
        mobileMoneyNumber: data.mobileMoneyNumber,
        status: data.status ?? status,
        balanceRemaining: Math.max(0, balanceRemaining),
      },
    })

    revalidatePath("/payments")
    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to update payment:", error)
    return { success: false, error: "Failed to update payment" }
  }
}

// Delete payment (only if no dependencies)
export async function deletePayment(id: string) {
  try {
    // Check if this is the only payment for a booking
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            payments: true,
          },
        },
      },
    })

    if (!payment) {
      return { success: false, error: "Payment not found" }
    }

    if (payment.booking.payments.length === 1) {
      return {
        success: false,
        error: "Cannot delete the only payment record for a booking. Edit it instead.",
      }
    }

    await db.payment.delete({
      where: { id },
    })

    revalidatePath("/payments")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete payment:", error)
    return { success: false, error: "Failed to delete payment" }
  }
}

// Add additional payment to existing booking
export async function addAdditionalPayment(bookingId: string, paymentData: any) {
  try {
    // Get current booking and payments
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        payments: true,
      },
    })

    if (!booking) {
      return { success: false, error: "Booking not found" }
    }

    // Calculate remaining balance from previous payments
    const totalPaid = booking.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalBill = booking.payments[0]?.totalBill || 0
    const newBalance = Math.max(0, totalBill - totalPaid - paymentData.amount)

    const newStatus = newBalance <= 0 ? "completed" : newBalance < totalBill ? "partial" : "pending"

    const payment = await db.payment.create({
      data: {
        bookingId,
        amount: paymentData.amount,
        paymentMode: paymentData.paymentMode,
        receiptNumber: paymentData.receiptNumber,
        roomRate: booking.payments[0]?.roomRate || 0,
        totalBill,
        balanceRemaining: newBalance,
        status: newStatus,
        mobileMoneyProvider: paymentData.mobileMoneyProvider,
        mobileMoneyNumber: paymentData.mobileMoneyNumber,
      },
    })

    revalidatePath("/payments")
    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to add additional payment:", error)
    return { success: false, error: "Failed to add additional payment" }
  }
}
