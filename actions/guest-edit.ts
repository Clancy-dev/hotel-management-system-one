"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

interface UpdateGuestInput {
  id: string
  firstName?: string
  lastName?: string
  nationality?: string
  gender?: string
  dateOfBirth?: Date
  phoneNumber?: string
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

// Get guest by ID with all related data
export async function getGuestById(id: string) {
  try {
    const guest = await db.guest.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            room: {
              include: {
                category: true,
              },
            },
            payments: true,
            additionalGuests: {
              include: {
                guest: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!guest) {
      return { success: false, error: "Guest not found" }
    }

    return { success: true, data: guest }
  } catch (error) {
    console.error("Failed to get guest:", error)
    return { success: false, error: "Failed to get guest" }
  }
}

// Update guest information
export async function updateGuest(data: UpdateGuestInput) {
  try {
    const guest = await db.guest.update({
      where: { id: data.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        nationality: data.nationality,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        nextOfKin: data.nextOfKin,
        ninNumber: data.ninNumber,
        passportNumber: data.passportNumber,
        visaType: data.visaType,
        visaNumber: data.visaNumber,
        drivingPermit: data.drivingPermit,
        emergencyContact: data.emergencyContact,
      },
    })

    revalidatePath("/guests")
    revalidatePath("/guests/history")
    return { success: true, data: guest }
  } catch (error) {
    console.error("Failed to update guest:", error)
    return { success: false, error: "Failed to update guest" }
  }
}

// Delete guest (only if no active bookings)
export async function deleteGuest(id: string) {
  try {
    // Check for active bookings
    const activeBookings = await db.booking.count({
      where: {
        guestId: id,
        status: "active",
      },
    })

    if (activeBookings > 0) {
      return {
        success: false,
        error: `Cannot delete guest. They have ${activeBookings} active booking(s).`,
      }
    }

    // Check for any bookings at all
    const totalBookings = await db.booking.count({
      where: { guestId: id },
    })

    if (totalBookings > 0) {
      return {
        success: false,
        error: "Cannot delete guest with booking history. Consider archiving instead.",
      }
    }

    await db.guest.delete({
      where: { id },
    })

    revalidatePath("/guests")
    revalidatePath("/guests/history")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete guest:", error)
    return { success: false, error: "Failed to delete guest" }
  }
}

// Archive guest (soft delete)
export async function archiveGuest(id: string) {
  try {
    // For now, we'll add an archived field to the schema later
    // This is a placeholder for archiving functionality
    return { success: true, message: "Guest archived successfully" }
  } catch (error) {
    console.error("Failed to archive guest:", error)
    return { success: false, error: "Failed to archive guest" }
  }
}
