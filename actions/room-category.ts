"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

export async function getRoomCategories() {
  try {
    const categories = await db.roomCategory.findMany({
      orderBy: {
        name: "asc",
      },
    })
    return { success: true, data: categories }
  } catch (error) {
    console.error("Failed to get room categories:", error)
    return { success: false, error: "Failed to get room categories" }
  }
}

export async function getRoomCategoryById(id: string) {
  try {
    const category = await db.roomCategory.findUnique({
      where: { id },
    })

    if (!category) {
      return { success: false, error: "Room category not found" }
    }

    return { success: true, data: category }
  } catch (error) {
    console.error(`Failed to get room category with id ${id}:`, error)
    return { success: false, error: "Failed to get room category" }
  }
}

export async function createRoomCategory(name: string) {
  try {
    // Check if category name already exists
    const existingCategory = await db.roomCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case insensitive
        },
      },
    })

    if (existingCategory) {
      return { success: false, error: `Category name "${name}" already exists` }
    }

    const newCategory = await db.roomCategory.create({
      data: {
        name,
      },
    })

    revalidatePath("/rooms")
    return { success: true, data: newCategory }
  } catch (error) {
    console.error("Failed to create room category:", error)
    return { success: false, error: "Failed to create room category" }
  }
}

export async function updateRoomCategory(id: string, name: string) {
  try {
    // Check if category name already exists (excluding the current category)
    const existingCategory = await db.roomCategory.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Case insensitive
        },
        NOT: {
          id: id,
        },
      },
    })

    if (existingCategory) {
      return { success: false, error: `Category name "${name}" already exists` }
    }

    const updatedCategory = await db.roomCategory.update({
      where: { id },
      data: {
        name,
      },
    })

    revalidatePath("/rooms")
    return { success: true, data: updatedCategory }
  } catch (error) {
    console.error(`Failed to update room category with id ${id}:`, error)
    return { success: false, error: "Failed to update room category" }
  }
}

export async function deleteRoomCategory(id: string) {
  try {
    // Check if any rooms are using this category
    const roomsUsingCategory = await db.room.count({
      where: {
        categoryId: id,
      },
    })

    if (roomsUsingCategory > 0) {
      return {
        success: false,
        error: `Cannot delete category because it is being used by ${roomsUsingCategory} room(s)`,
      }
    }

    await db.roomCategory.delete({
      where: { id },
    })

    revalidatePath("/rooms")
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete room category with id ${id}:`, error)
    return { success: false, error: "Failed to delete room category" }
  }
}
