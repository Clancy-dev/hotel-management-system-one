"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

interface CreatePaymentInput {
  bookingId: string
  amount: number
  paymentMode: string
  receiptNumber?: string
  depositPaid?: number
  roomRate: number
  discountType?: string
  discountAmount?: number
  totalBill: number
  balanceRemaining?: number
  mobileMoneyProvider?: string
  mobileMoneyNumber?: string
}

interface UpdatePaymentInput {
  id: string
  amount?: number
  paymentMode?: string
  receiptNumber?: string
  status?: string
}

// Create payment
export async function createPayment(data: CreatePaymentInput) {
  try {
    const balanceRemaining = data.totalBill - data.amount - (data.depositPaid || 0)
    const status = balanceRemaining <= 0 ? "completed" : balanceRemaining < data.totalBill ? "partial" : "pending"

    const payment = await db.payment.create({
      data: {
        ...data,
        balanceRemaining: Math.max(0, balanceRemaining),
        status,
      },
    })

    revalidatePath("/payments")
    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to create payment:", error)
    return { success: false, error: "Failed to create payment" }
  }
}

// Get all payments
export async function getPayments() {
  try {
    const payments = await db.payment.findMany({
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
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: payments }
  } catch (error) {
    console.error("Failed to get payments:", error)
    return { success: false, error: "Failed to get payments" }
  }
}

// Get payment by booking
export async function getPaymentsByBooking(bookingId: string) {
  try {
    const payments = await db.payment.findMany({
      where: { bookingId },
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
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: payments }
  } catch (error) {
    console.error("Failed to get payments by booking:", error)
    return { success: false, error: "Failed to get payments by booking" }
  }
}

// Update payment
export async function updatePayment(data: UpdatePaymentInput) {
  try {
    const payment = await db.payment.update({
      where: { id: data.id },
      data,
    })

    revalidatePath("/payments")
    return { success: true, data: payment }
  } catch (error) {
    console.error("Failed to update payment:", error)
    return { success: false, error: "Failed to update payment" }
  }
}

// Get payment statistics
export async function getPaymentStatistics() {
  try {
    const totalPayments = await db.payment.count()
    const completedPayments = await db.payment.count({
      where: { status: "completed" },
    })
    const partialPayments = await db.payment.count({
      where: { status: "partial" },
    })
    const pendingPayments = await db.payment.count({
      where: { status: "pending" },
    })

    const totalRevenue = await db.payment.aggregate({
      _sum: { amount: true },
    })

    const totalOutstanding = await db.payment.aggregate({
      _sum: { balanceRemaining: true },
    })

    return {
      success: true,
      data: {
        totalPayments,
        completedPayments,
        partialPayments,
        pendingPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalOutstanding: totalOutstanding._sum.balanceRemaining || 0,
      },
    }
  } catch (error) {
    console.error("Failed to get payment statistics:", error)
    return { success: false, error: "Failed to get payment statistics" }
  }
}

// Search payments by guest
export async function searchPaymentsByGuest(query: string) {
  try {
    const payments = await db.payment.findMany({
      where: {
        booking: {
          guest: {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { phoneNumber: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
        },
      },
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
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: payments }
  } catch (error) {
    console.error("Failed to search payments by guest:", error)
    return { success: false, error: "Failed to search payments by guest" }
  }
}

// Get all payment statistics (for dashboard)
export async function getAllPaymentStatistics() {
  try {
    // Get basic statistics
    const stats = await getPaymentStatistics()
    if (!stats.success) {
      return stats
    }

    // Get payment trends (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyPayments = await db.payment.groupBy({
      by: ["paymentDate"],
      where: {
        paymentDate: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        paymentDate: "asc",
      },
    })

    // Get payment methods distribution
    const paymentMethods = await db.payment.groupBy({
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
        ...stats.data,
        dailyTrends: dailyPayments,
        paymentMethods,
        recentPayments,
      },
    }
  } catch (error) {
    console.error("Failed to get all payment statistics:", error)
    return { success: false, error: "Failed to get payment statistics" }
  }
}
