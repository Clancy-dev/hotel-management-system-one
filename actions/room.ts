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
