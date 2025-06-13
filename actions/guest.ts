"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export async function getCurrentGuests() {
  try {
    const guests = await db.guest.findMany({
      where: {
        bookings: {
          some: {
            checkOutDate: {
              gte: new Date(),
            },
            isActive: true,
          },
        },
      },
      include: {
        bookings: {
          where: {
            isActive: true,
            checkOutDate: {
              gte: new Date(),
            },
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: guests,
    }
  } catch (error) {
    console.error("Error fetching current guests:", error)
    return {
      success: false,
      error: "Failed to fetch current guests",
    }
  }
}

export async function getGuestHistory() {
  try {
    const guests = await db.guest.findMany({
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
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: guests,
    }
  } catch (error) {
    console.error("Error fetching guest history:", error)
    return {
      success: false,
      error: "Failed to fetch guest history",
    }
  }
}

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
          },
        },
      },
    })

    if (!guest) {
      return {
        success: false,
        error: "Guest not found",
      }
    }

    return {
      success: true,
      data: guest,
    }
  } catch (error) {
    console.error("Error fetching guest:", error)
    return {
      success: false,
      error: "Failed to fetch guest",
    }
  }
}

export async function createGuest(data: any) {
  try {
    const guest = await db.guest.create({
      data: {
        id: uuidv4(),
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
    return {
      success: true,
      data: guest,
    }
  } catch (error) {
    console.error("Error creating guest:", error)
    return {
      success: false,
      error: "Failed to create guest",
    }
  }
}

export async function updateGuest(id: string, data: any) {
  try {
    const guest = await db.guest.update({
      where: { id },
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
    return {
      success: true,
      data: guest,
    }
  } catch (error) {
    console.error("Error updating guest:", error)
    return {
      success: false,
      error: "Failed to update guest",
    }
  }
}

export async function deleteGuest(id: string) {
  try {
    // Check if guest has active bookings
    const guest = await db.guest.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            isActive: true,
            checkOutDate: {
              gte: new Date(),
            },
          },
        },
      },
    })

    if (guest?.bookings && guest.bookings.length > 0) {
      return {
        success: false,
        error: "Cannot delete guest with active bookings",
      }
    }

    // Delete guest
    await db.guest.delete({
      where: { id },
    })

    revalidatePath("/guests")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting guest:", error)
    return {
      success: false,
      error: "Failed to delete guest",
    }
  }
}

export async function createBooking(data: any) {
  try {
    const booking = await db.booking.create({
      data: {
        id: uuidv4(),
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
        parkingRequired: data.parkingRequired,
        company: data.company,
        isActive: true,
      },
    })

    revalidatePath("/guests")
    revalidatePath("/room-status")
    return {
      success: true,
      data: booking,
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      success: false,
      error: "Failed to create booking",
    }
  }
}

export async function searchGuests(query: string) {
  try {
    const guests = await db.guest.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { phoneNumber: { contains: query } },
          { email: { contains: query, mode: "insensitive" } },
          { ninNumber: { contains: query } },
          { passportNumber: { contains: query } },
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: guests,
    }
  } catch (error) {
    console.error("Error searching guests:", error)
    return {
      success: false,
      error: "Failed to search guests",
    }
  }
}
