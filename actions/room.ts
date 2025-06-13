"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

interface RoomData {
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images?: string[]
  policyType?: "standard" | "custom" | "mixed"
  standardPolicy?: any
  customPolicy?: any
  mixedPolicy?: any
}

export async function getRooms() {
  try {
    const rooms = await db.room.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return { success: true, data: rooms }
  } catch (error) {
    console.error("Failed to get rooms:", error)
    return { success: false, error: "Failed to get rooms" }
  }
}

export async function getRoomById(id: string) {
  try {
    const room = await db.room.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!room) {
      return { success: false, error: "Room not found" }
    }

    return { success: true, data: room }
  } catch (error) {
    console.error(`Failed to get room with id ${id}:`, error)
    return { success: false, error: "Failed to get room" }
  }
}

export async function createRoom(data: RoomData) {
  try {
    // Check if room number already exists
    const existingRoom = await db.room.findFirst({
      where: {
        roomNumber: {
          equals: data.roomNumber,
          mode: "insensitive", // Case insensitive
        },
      },
    })

    if (existingRoom) {
      return { success: false, error: `Room number ${data.roomNumber} already exists` }
    }

    // Create the room with policy data
    const roomData: any = {
      roomNumber: data.roomNumber,
      categoryId: data.categoryId,
      price: data.price,
      description: data.description,
      images: data.images || [],
    }

    // Add policy-specific data based on policy type
    if (data.policyType === "standard" && data.standardPolicy) {
      roomData.standardPolicy = data.standardPolicy
    } else if (data.policyType === "custom" && data.customPolicy) {
      roomData.customPolicy = data.customPolicy
    } else if (data.policyType === "mixed" && data.mixedPolicy) {
      roomData.mixedPolicy = data.mixedPolicy
    }

    const newRoom = await db.room.create({
      data: roomData,
    })

    revalidatePath("/rooms")
    return { success: true, data: newRoom }
  } catch (error) {
    console.error("Failed to create room:", error)
    return { success: false, error: "Failed to create room" }
  }
}

export async function updateRoom(id: string, data: RoomData) {
  try {
    // Check if room number already exists (excluding the current room)
    if (data.roomNumber) {
      const existingRoom = await db.room.findFirst({
        where: {
          roomNumber: {
            equals: data.roomNumber,
            mode: "insensitive", // Case insensitive
          },
          NOT: {
            id: id,
          },
        },
      })

      if (existingRoom) {
        return { success: false, error: `Room number ${data.roomNumber} already exists` }
      }
    }

    // Update the room with policy data
    const roomData: any = {
      roomNumber: data.roomNumber,
      categoryId: data.categoryId,
      price: data.price,
      description: data.description,
      images: data.images || [],
    }

    // Add policy-specific data based on policy type
    if (data.policyType === "standard" && data.standardPolicy) {
      roomData.standardPolicy = data.standardPolicy
      roomData.customPolicy = null
      roomData.mixedPolicy = null
    } else if (data.policyType === "custom" && data.customPolicy) {
      roomData.customPolicy = data.customPolicy
      roomData.standardPolicy = null
      roomData.mixedPolicy = null
    } else if (data.policyType === "mixed" && data.mixedPolicy) {
      roomData.mixedPolicy = data.mixedPolicy
      roomData.standardPolicy = null
      roomData.customPolicy = null
    }

    const updatedRoom = await db.room.update({
      where: { id },
      data: roomData,
    })

    revalidatePath("/rooms")
    return { success: true, data: updatedRoom }
  } catch (error) {
    console.error(`Failed to update room with id ${id}:`, error)
    return { success: false, error: "Failed to update room" }
  }
}

export async function deleteRoom(id: string) {
  try {
    await db.room.delete({
      where: { id },
    })

    revalidatePath("/rooms")
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete room with id ${id}:`, error)
    return { success: false, error: "Failed to delete room" }
  }
}

// Additional functions for room status management
export async function getRoomWithStatusHistory(id: string) {
  try {
    const room = await db.room.findUnique({
      where: { id },
      include: {
        category: true,
        currentStatus: true,
        statusHistory: {
          include: {
            status: true,
            booking: {
              include: {
                guest: true,
              },
            },
          },
          orderBy: {
            changedAt: "desc",
          },
        },
      },
    })

    if (!room) {
      return { success: false, error: "Room not found" }
    }

    return { success: true, data: room }
  } catch (error) {
    console.error(`Failed to get room with status history for id ${id}:`, error)
    return { success: false, error: "Failed to get room with status history" }
  }
}

export async function getRoomsWithStatus() {
  try {
    const rooms = await db.room.findMany({
      include: {
        category: true,
        currentStatus: true,
      },
      orderBy: {
        roomNumber: "asc",
      },
    })
    return { success: true, data: rooms }
  } catch (error) {
    console.error("Failed to get rooms with status:", error)
    return { success: false, error: "Failed to get rooms with status" }
  }
}

export async function updateRoomStatus(
  roomId: string,
  statusId: string,
  notes = "",
  changedBy = "system",
  bookingId?: string,
) {
  try {
    // Get the current status of the room
    const room = await db.room.findUnique({
      where: { id: roomId },
      select: { currentStatusId: true },
    })

    // Update room's current status
    await db.room.update({
      where: { id: roomId },
      data: { currentStatusId: statusId },
    })

    // Create status history entry
    await db.roomStatusHistory.create({
      data: {
        roomId,
        statusId,
        previousStatusId: room?.currentStatusId,
        notes,
        changedBy,
        bookingId,
      },
    })

    revalidatePath("/room-status")
    revalidatePath("/room-status/history")
    revalidatePath("/days")
    return { success: true }
  } catch (error) {
    console.error("Failed to update room status:", error)
    return { success: false, error: "Failed to update room status" }
  }
}

export async function getRoomStatusHistory(roomId?: string) {
  try {
    const where = roomId ? { roomId } : {}

    const statusHistory = await db.roomStatusHistory.findMany({
      where,
      include: {
        room: {
          include: {
            category: true,
          },
        },
        status: true,
        booking: {
          include: {
            guest: true,
          },
        },
      },
      orderBy: {
        changedAt: "desc",
      },
    })

    return { success: true, data: statusHistory }
  } catch (error) {
    console.error("Failed to get room status history:", error)
    return { success: false, error: "Failed to get room status history" }
  }
}

export async function getRoomStatuses() {
  try {
    const statuses = await db.roomStatus.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, data: statuses }
  } catch (error) {
    console.error("Failed to get room statuses:", error)
    return { success: false, error: "Failed to get room statuses" }
  }
}

export async function createRoomStatus(data: {
  name: string
  color: string
  description?: string
  isDefault?: boolean
}) {
  try {
    // If this is set as default, unset any existing default
    if (data.isDefault) {
      await db.roomStatus.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      })
    }

    const status = await db.roomStatus.create({
      data: {
        name: data.name,
        color: data.color,
        description: data.description,
        isDefault: data.isDefault || false,
      },
    })

    revalidatePath("/room-status")
    return {
      success: true,
      data: status,
    }
  } catch (error) {
    console.error("Error creating room status:", error)
    return {
      success: false,
      error: "Failed to create room status",
    }
  }
}

export async function updateRoomStatusStatus(
  id: string,
  data: {
    name?: string
    color?: string
    description?: string
    isDefault?: boolean
    isActive?: boolean
  },
) {
  try {
    // If this is set as default, unset any existing default
    if (data.isDefault) {
      await db.roomStatus.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const status = await db.roomStatus.update({
      where: { id },
      data,
    })

    revalidatePath("/room-status")
    return {
      success: true,
      data: status,
    }
  } catch (error) {
    console.error("Error updating room status:", error)
    return {
      success: false,
      error: "Failed to update room status",
    }
  }
}

export async function deleteRoomStatus(id: string) {
  try {
    // Check if status is in use
    const roomsUsingStatus = await db.room.count({
      where: { currentStatusId: id },
    })

    if (roomsUsingStatus > 0) {
      return {
        success: false,
        error: "Cannot delete status that is currently in use",
      }
    }

    await db.roomStatus.delete({
      where: { id },
    })

    revalidatePath("/room-status")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting room status:", error)
    return {
      success: false,
      error: "Failed to delete room status",
    }
  }
}
