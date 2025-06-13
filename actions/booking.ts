"use server"

import { db } from "@/prisma/db"

export async function getAllBookings() {
  try {
    const bookings = await db.booking.findMany({
      include: {
        room: {
          include: {
            category: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        checkInDate: "desc",
      },
    })

    return {
      success: true,
      data: bookings,
    }
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return {
      success: false,
      error: "Failed to fetch bookings",
    }
  }
}

export async function getBookingsByDate(date: Date) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const bookings = await db.booking.findMany({
      where: {
        OR: [
          {
            // Check-in date is on the selected date
            checkInDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            // Check-out date is on the selected date
            checkOutDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            // Stay spans over the selected date
            AND: [
              {
                checkInDate: {
                  lt: startOfDay,
                },
              },
              {
                checkOutDate: {
                  gt: endOfDay,
                },
              },
            ],
          },
        ],
      },
      include: {
        room: {
          include: {
            category: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        checkInDate: "desc",
      },
    })

    return {
      success: true,
      data: bookings,
    }
  } catch (error) {
    console.error("Error fetching bookings by date:", error)
    return {
      success: false,
      error: "Failed to fetch bookings by date",
    }
  }
}

export async function getBookingById(id: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            category: true,
          },
        },
        guest: true,
        payments: true,
      },
    })

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      }
    }

    return {
      success: true,
      data: booking,
    }
  } catch (error) {
    console.error("Error fetching booking:", error)
    return {
      success: false,
      error: "Failed to fetch booking",
    }
  }
}
