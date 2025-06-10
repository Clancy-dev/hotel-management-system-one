"use server"



import { RoomCategoryProps } from "@/components/CategoriesFormPopUp"
import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

type CreateCategoryInput = {
  name: string;
};


export async function getCategories() {
  try {
    const categories = await db.roomCategory.findMany({
      orderBy: {
        name: "desc",
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
    // Check if any rooms are using this category
    // const roomsUsingCategory = await db.room.findFirst({
    //   where: {
    //     categoryId: id,
    //   },
    // })

    // if (roomsUsingCategory) {
    //   return {
    //     success: false,
    //     error: "Cannot delete category because it is being used by one or more rooms",
    //   }
    // }

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
