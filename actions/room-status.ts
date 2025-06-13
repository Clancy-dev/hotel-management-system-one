"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

interface CreateRoomStatusInput {
  name: string
  color: string
  description?: string
  isDefault?: boolean
}

interface UpdateRoomStatusInput {
  id: string
  name?: string
  color?: string
  description?: string
  isDefault?: boolean
  isActive?: boolean
}

interface UpdateRoomStatusHistoryInput {
  roomId: string
  statusId: string
  notes?: string
  changedBy?: string
  bookingId?: string
}

// Get all room statuses
export async function getRoomStatuses() {
  try {
    const statuses = await db.roomStatus.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    })
    return { success: true, data: statuses }
  } catch (error) {
    console.error("Failed to get room statuses:", error)
    return { success: false, error: "Failed to get room statuses" }
  }
}

// Create room status
export async function createRoomStatus(data: CreateRoomStatusInput) {
  try {
    // If this is set as default, remove default from others
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
    return { success: true, data: status }
  } catch (error) {
    console.error("Failed to create room status:", error)
    return { success: false, error: "Failed to create room status" }
  }
}

// Update room status
export async function updateRoomStatus(data: UpdateRoomStatusInput) {
  try {
    // If this is set as default, remove default from others
    if (data.isDefault) {
      await db.roomStatus.updateMany({
        where: { isDefault: true, NOT: { id: data.id } },
        data: { isDefault: false },
      })
    }

    const status = await db.roomStatus.update({
      where: { id: data.id },
      data: {
        name: data.name,
        color: data.color,
        description: data.description,
        isDefault: data.isDefault,
        isActive: data.isActive,
      },
    })

    revalidatePath("/room-status")
    return { success: true, data: status }
  } catch (error) {
    console.error("Failed to update room status:", error)
    return { success: false, error: "Failed to update room status" }
  }
}

// Delete room status
export async function deleteRoomStatus(id: string) {
  try {
    // Check if any rooms are using this status
    const roomsWithStatus = await db.room.count({
      where: { currentStatusId: id },
    })

    if (roomsWithStatus > 0) {
      return {
        success: false,
        error: `Cannot delete status. ${roomsWithStatus} room(s) are currently using this status.`,
      }
    }

    await db.roomStatus.update({
      where: { id },
      data: { isActive: false },
    })

    revalidatePath("/room-status")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete room status:", error)
    return { success: false, error: "Failed to delete room status" }
  }
}

// Get rooms with their current status
export async function getRoomsWithStatus() {
  try {
    const rooms = await db.room.findMany({
      include: {
        category: true,
        currentStatus: true,
      },
      orderBy: { roomNumber: "asc" },
    })
    return { success: true, data: rooms }
  } catch (error) {
    console.error("Failed to get rooms with status:", error)
    return { success: false, error: "Failed to get rooms with status" }
  }
}

// Update room status
export async function updateRoomCurrentStatus(
  roomId: string,
  statusId: string,
  notes?: string,
  changedBy?: string,
  bookingId?: string,
) {
  try {
    // Get current status for history
    const currentRoom = await db.room.findUnique({
      where: { id: roomId },
      select: { currentStatusId: true },
    })

    // Update room status
    await db.room.update({
      where: { id: roomId },
      data: { currentStatusId: statusId },
    })

    // Create status history entry
    await db.roomStatusHistory.create({
      data: {
        roomId,
        statusId,
        previousStatusId: currentRoom?.currentStatusId,
        notes,
        changedBy,
        bookingId,
      },
    })

    revalidatePath("/room-status")
    return { success: true }
  } catch (error) {
    console.error("Failed to update room status:", error)
    return { success: false, error: "Failed to update room status" }
  }
}

// Get room status history
export async function getRoomStatusHistory(roomId?: string, startDate?: Date, endDate?: Date) {
  try {
    const where: any = {}

    if (roomId) {
      where.roomId = roomId
    }

    if (startDate || endDate) {
      where.changedAt = {}
      if (startDate) where.changedAt.gte = startDate
      if (endDate) where.changedAt.lte = endDate
    }

    const history = await db.roomStatusHistory.findMany({
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
      orderBy: { changedAt: "desc" },
    })

    return { success: true, data: history }
  } catch (error) {
    console.error("Failed to get room status history:", error)
    return { success: false, error: "Failed to get room status history" }
  }
}

// Initialize default room statuses
export async function initializeDefaultStatuses() {
  try {
    const defaultStatuses = [
      { name: "Available", color: "#22c55e", description: "Room is available for booking", isDefault: true },
      { name: "Booked", color: "#ef4444", description: "Room is currently booked" },
      { name: "Dirty", color: "#eab308", description: "Room needs cleaning" },
      { name: "Maintenance", color: "#3b82f6", description: "Room is under maintenance" },
      { name: "Fully Closed", color: "#000000", description: "Room is closed and unavailable" },
    ]

    for (const status of defaultStatuses) {
      const existing = await db.roomStatus.findFirst({
        where: { name: status.name },
      })

      if (!existing) {
        await db.roomStatus.create({
          data: status,
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to initialize default statuses:", error)
    return { success: false, error: "Failed to initialize default statuses" }
  }
}
