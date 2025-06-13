"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

interface CreatePaymentInput {
  bookingId: string
  amount: number
  paymentMode: string
  depositPaid?: number
  roomRate: number
  discountType?: string
  discountAmount?: number
  totalBill: number
  mobileMoneyProvider?: string
  mobileMoneyNumber?: string
}

export async function createPayment(data: CreatePaymentInput) {
  try {
    // Calculate balance remaining
    const balanceRemaining = Math.max(0, data.totalBill - data.amount)

    // Determine payment status
    let status = "pending"
    if (data.amount >= data.totalBill) {
      status = "completed"
    } else if (data.amount > 0) {
      status = "partial"
    }

    const payment = await db.payment.create({
      data: {
        id: uuidv4(),
        bookingId: data.bookingId,
        amount: data.amount,
        paymentMode: data.paymentMode,
        depositPaid: data.depositPaid,
        roomRate: data.roomRate,
        discountType: data.discountType,
        discountAmount: data.discountAmount,
        totalBill: data.totalBill,
        balanceRemaining,
        status,
        mobileMoneyProvider: data.mobileMoneyProvider,
        mobileMoneyNumber: data.mobileMoneyNumber,
      },
    })

    revalidatePath("/payments")
    return {
      success: true,
      data: payment,
    }
  } catch (error) {
    console.error("Error creating payment:", error)
    return {
      success: false,
      error: "Failed to create payment",
    }
  }
}

export async function getAllPayments() {
  try {
    const payments = await db.payment.findMany({
      include: {
        booking: {
          include: {
            room: true,
            guest: true,
          },
        },
      },
      orderBy: {
        paymentDate: "desc",
      },
    })

    return {
      success: true,
      data: payments,
    }
  } catch (error) {
    console.error("Error fetching payments:", error)
    return {
      success: false,
      error: "Failed to fetch payments",
    }
  }
}

export async function getPaymentById(id: string) {
  try {
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            room: {
              include: {
                category: true,
              },
            },
            guest: true,
          },
        },
      },
    })

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      }
    }

    return {
      success: true,
      data: payment,
    }
  } catch (error) {
    console.error("Error fetching payment:", error)
    return {
      success: false,
      error: "Failed to fetch payment",
    }
  }
}

export async function updatePayment(
  id: string,
  data: {
    amount?: number
    paymentMode?: string
    discountType?: string
    discountAmount?: number
    totalBill?: number
    status?: string
    mobileMoneyProvider?: string
    mobileMoneyNumber?: string
  },
) {
  try {
    // Get current payment
    const currentPayment = await db.payment.findUnique({
      where: { id },
    })

    if (!currentPayment) {
      return {
        success: false,
        error: "Payment not found",
      }
    }

    // Calculate new balance remaining if amount or total bill changed
    let balanceRemaining = currentPayment.balanceRemaining
    if (data.amount !== undefined || data.totalBill !== undefined) {
      const newAmount = data.amount !== undefined ? data.amount : currentPayment.amount
      const newTotalBill = data.totalBill !== undefined ? data.totalBill : currentPayment.totalBill
      balanceRemaining = Math.max(0, newTotalBill - newAmount)
    }

    // Determine payment status if not explicitly provided
    let status = data.status
    if (!status && (data.amount !== undefined || data.totalBill !== undefined)) {
      const newAmount = data.amount !== undefined ? data.amount : currentPayment.amount
      const newTotalBill = data.totalBill !== undefined ? data.totalBill : currentPayment.totalBill

      if (newAmount >= newTotalBill) {
        status = "completed"
      } else if (newAmount > 0) {
        status = "partial"
      } else {
        status = "pending"
      }
    }

    const payment = await db.payment.update({
      where: { id },
      data: {
        ...data,
        balanceRemaining,
        status: status || currentPayment.status,
      },
    })

    revalidatePath("/payments")
    return {
      success: true,
      data: payment,
    }
  } catch (error) {
    console.error("Error updating payment:", error)
    return {
      success: false,
      error: "Failed to update payment",
    }
  }
}

export async function deletePayment(id: string) {
  try {
    await db.payment.delete({
      where: { id },
    })

    revalidatePath("/payments")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting payment:", error)
    return {
      success: false,
      error: "Failed to delete payment",
    }
  }
}

export async function getPaymentStatistics() {
  try {
    // Get total payments
    const totalPayments = await db.payment.aggregate({
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get payments by status
    const paymentsByStatus = await db.payment.groupBy({
      by: ["status"],
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get payments by mode
    const paymentsByMode = await db.payment.groupBy({
      by: ["paymentMode"],
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get recent payments
    const recentPayments = await db.payment.findMany({
      take: 5,
      orderBy: {
        paymentDate: "desc",
      },
      include: {
        booking: {
          include: {
            guest: true,
            room: true,
          },
        },
      },
    })

    return {
      success: true,
      data: {
        totalAmount: totalPayments._sum.amount || 0,
        totalCount: totalPayments._count,
        byStatus: paymentsByStatus,
        byMode: paymentsByMode,
        recent: recentPayments,
      },
    }
  } catch (error) {
    console.error("Error fetching payment statistics:", error)
    return {
      success: false,
      error: "Failed to fetch payment statistics",
    }
  }
}
