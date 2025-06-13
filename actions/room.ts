"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export async function getAllRooms() {
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

    return {
      success: true,
      data: rooms,
    }
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return {
      success: false,
      error: "Failed to fetch rooms",
    }
  }
}

export async function getRoomById(id: string) {
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
      return {
        success: false,
        error: "Room not found",
      }
    }

    return {
      success: true,
      data: room,
    }
  } catch (error) {
    console.error("Error fetching room:", error)
    return {
      success: false,
      error: "Failed to fetch room",
    }
  }
}

export async function updateRoomCurrentStatus(
  roomId: string,
  statusId: string,
  notes: string,
  changedBy: string,
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
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error updating room status:", error)
    return {
      success: false,
      error: "Failed to update room status",
    }
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

    return {
      success: true,
      data: statuses,
    }
  } catch (error) {
    console.error("Error fetching room statuses:", error)
    return {
      success: false,
      error: "Failed to fetch room statuses",
    }
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

export async function updateRoomStatus(
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
