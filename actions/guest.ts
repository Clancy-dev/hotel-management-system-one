"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

interface CreateGuestInput {
  firstName: string
  lastName: string
  nationality: string
  gender: string
  dateOfBirth?: Date
  phoneNumber: string
  email?: string
  address?: string
  nextOfKin?: string
  ninNumber?: string
  passportNumber?: string
  visaType?: string
  visaNumber?: string
  drivingPermit?: string
  emergencyContact?: string
}

interface CreateBookingInput {
  roomId: string
  guestId: string
  checkInDate: Date
  checkOutDate: Date
  duration: number
  numberOfGuests: number
  purposeOfStay: string
  purposeDetails?: string
  vehicleRegistration?: string
  vehicleType?: string
  parkingRequired?: boolean
  company?: string
  additionalGuestIds?: string[]
}

// Create guest
export async function createGuest(data: CreateGuestInput) {
  try {
    const guest = await db.guest.create({
      data,
    })

    return { success: true, data: guest }
  } catch (error) {
    console.error("Failed to create guest:", error)
    return { success: false, error: "Failed to create guest" }
  }
}

// Get all guests
export async function getGuests() {
  try {
    const guests = await db.guest.findMany({
      include: {
        bookings: {
          include: {
            room: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: guests }
  } catch (error) {
    console.error("Failed to get guests:", error)
    return { success: false, error: "Failed to get guests" }
  }
}

// Get current guests (with active bookings)
export async function getCurrentGuests() {
  try {
    const guests = await db.guest.findMany({
      where: {
        bookings: {
          some: {
            status: "active",
          },
        },
      },
      include: {
        bookings: {
          where: {
            status: "active",
          },
          include: {
            room: {
              include: {
                category: true,
              },
            },
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: guests }
  } catch (error) {
    console.error("Failed to get current guests:", error)
    return { success: false, error: "Failed to get current guests" }
  }
}

// Get guest history (checked out guests)
export async function getGuestHistory() {
  try {
    const guests = await db.guest.findMany({
      where: {
        bookings: {
          some: {
            status: "checked_out",
          },
        },
      },
      include: {
        bookings: {
          where: {
            status: "checked_out",
          },
          include: {
            room: {
              include: {
                category: true,
              },
            },
            payments: true,
          },
          orderBy: { actualCheckOut: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: guests }
  } catch (error) {
    console.error("Failed to get guest history:", error)
    return { success: false, error: "Failed to get guest history" }
  }
}

async function updateRoomStatus(
  roomId: string,
  statusId: string,
  notes: string,
  changedBy: string,
  bookingId?: string,
) {
  try {
    await db.roomStatusHistory.create({
      data: {
        roomId,
        statusId,
        notes,
        changedBy,
        bookingId,
      },
    })
  } catch (error) {
    console.error("Failed to update room status:", error)
  }
}

// Create booking
export async function createBooking(data: CreateBookingInput) {
  try {
    const booking = await db.booking.create({
      data: {
        roomId: data.roomId,
        guestId: data.guestId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        duration: data.duration,
        numberOfGuests: data.numberOfGuests,
        purposeOfStay: data.purposeOfStay,
        purposeDetails: data.purposeDetails,
        vehicleRegistration: data.vehicleRegistration,
        vehicleType: data.vehicleType,
        parkingRequired: data.parkingRequired || false,
        company: data.company,
      },
    })

    // Add additional guests if provided
    if (data.additionalGuestIds && data.additionalGuestIds.length > 0) {
      await Promise.all(
        data.additionalGuestIds.map((guestId) =>
          db.additionalGuest.create({
            data: {
              bookingId: booking.id,
              guestId,
            },
          }),
        ),
      )
    }

    // Update room status to "Booked"
    const bookedStatus = await db.roomStatus.findFirst({
      where: { name: "Booked" },
    })

    if (bookedStatus) {
      await updateRoomStatus(data.roomId, bookedStatus.id, "Room booked", "system", booking.id)
    }

    revalidatePath("/room-status")
    revalidatePath("/guests")
    return { success: true, data: booking }
  } catch (error) {
    console.error("Failed to create booking:", error)
    return { success: false, error: "Failed to create booking" }
  }
}

// Check out guest
export async function checkOutGuest(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    })

    if (!booking) {
      return { success: false, error: "Booking not found" }
    }

    // Update booking status
    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "checked_out",
        actualCheckOut: new Date(),
      },
    })

    // Update room status to "Dirty" (needs cleaning)
    const dirtyStatus = await db.roomStatus.findFirst({
      where: { name: "Dirty" },
    })

    if (dirtyStatus) {
      await updateRoomStatus(booking.roomId, dirtyStatus.id, "Guest checked out", "system")
    }

    revalidatePath("/room-status")
    revalidatePath("/guests")
    return { success: true }
  } catch (error) {
    console.error("Failed to check out guest:", error)
    return { success: false, error: "Failed to check out guest" }
  }
}

// Search guests
export async function searchGuests(query: string) {
  try {
    const guests = await db.guest.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { phoneNumber: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { ninNumber: { contains: query, mode: "insensitive" } },
          { passportNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        bookings: {
          include: {
            room: {
              include: {
                category: true,
              },
            },
            payments: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: guests }
  } catch (error) {
    console.error("Failed to search guests:", error)
    return { success: false, error: "Failed to search guests" }
  }
}
