"use server"

import type { RoomCategoryProps } from "@/components/CategoriesFormPopUp"
import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

type CreateCategoryInput = {
  name: string
}

export async function getCategories() {
  try {
    const categories = await db.roomCategory.findMany({
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })
    return { success: true, data: categories }
  } catch (error) {
    console.error("Failed to get categories:", error)
    return { success: false, error: "Failed to get categories" }
  }
}

export async function getCategoryById(id: string) {
  try {
    const category = await db.roomCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    })

    if (!category) {
      return { success: false, error: "Category not found" }
    }

    return { success: true, data: category }
  } catch (error) {
    console.error(`Failed to get category with id ${id}:`, error)
    return { success: false, error: "Failed to get category" }
  }
}

export async function getCategoryWithRooms(id: string) {
  try {
    const category = await db.roomCategory.findUnique({
      where: { id },
      include: {
        rooms: {
          select: {
            id: true,
            roomNumber: true,
            price: true,
            description: true,
            images: true,
            createdAt: true,
          },
          orderBy: {
            roomNumber: "asc",
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    })

    if (!category) {
      return { success: false, error: "Category not found" }
    }

    return { success: true, data: category }
  } catch (error) {
    console.error(`Failed to get category with rooms for id ${id}:`, error)
    return { success: false, error: "Failed to get category details" }
  }
}

export async function createCategory(data: CreateCategoryInput) {
  try {
    // Check if category name already exists
    const existingCategory = await db.roomCategory.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive", // Case insensitive
        },
      },
    })

    if (existingCategory) {
      return { success: false, error: `Category "${data.name}" already exists` }
    }

    // Create the category
    const newCategory = await db.roomCategory.create({
      data: {
        name: data.name,
      },
    })

    revalidatePath("/rooms")
    return { success: true, data: newCategory }
  } catch (error) {
    console.error("Failed to create category:", error)
    return { success: false, error: "Failed to create category" }
  }
}

export async function updateCategory(id: string, data: RoomCategoryProps) {
  try {
    // Check if category name already exists (excluding the current category)
    if (data.name) {
      const existingCategory = await db.roomCategory.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive", // Case insensitive
          },
          NOT: {
            id: id,
          },
        },
      })

      if (existingCategory) {
        return { success: false, error: `Category "${data.name}" already exists` }
      }
    }

    // Update the category
    const updatedCategory = await db.roomCategory.update({
      where: { id },
      data: {
        name: data.name,
      },
    })

    revalidatePath("/rooms")
    return { success: true, data: updatedCategory }
  } catch (error) {
    console.error(`Failed to update category with id ${id}:`, error)
    return { success: false, error: "Failed to update category" }
  }
}

export async function deleteCategory(id: string) {
  try {
    // First check if there are any rooms in this category
    const roomCount = await db.room.count({
      where: { categoryId: id },
    })

    if (roomCount > 0) {
      return {
        success: false,
        error: `Cannot delete category. There are ${roomCount} room${roomCount > 1 ? "s" : ""} in this category. Please delete all rooms in this category first.`,
      }
    }

    await db.roomCategory.delete({
      where: { id },
    })

    revalidatePath("/rooms")
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete category with id ${id}:`, error)
    return { success: false, error: "Failed to delete category" }
  }
}

export async function deleteAllRoomsInCategory(categoryId: string) {
  try {
    const deletedRooms = await db.room.deleteMany({
      where: { categoryId },
    })

    revalidatePath("/rooms")
    return {
      success: true,
      data: { deletedCount: deletedRooms.count },
    }
  } catch (error) {
    console.error(`Failed to delete rooms in category ${categoryId}:`, error)
    return { success: false, error: "Failed to delete rooms in category" }
  }
}
