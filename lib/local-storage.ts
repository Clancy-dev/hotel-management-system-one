import type { Room, RoomCategory } from "./types"

// Room functions
export function getRooms(): Room[] {
  if (typeof window === "undefined") return []
  const rooms = localStorage.getItem("rooms")
  return rooms ? JSON.parse(rooms) : []
}

export function addRoom(room: Room): { success: boolean; message?: string } {
  if (typeof window === "undefined") return { success: false, message: "Cannot access storage" }

  const rooms = getRooms()

  // Check if room number already exists
  const roomExists = rooms.some(
    (existingRoom) => existingRoom.roomNumber.toLowerCase() === room.roomNumber.toLowerCase(),
  )

  if (roomExists) {
    return { success: false, message: `Room number ${room.roomNumber} already exists` }
  }

  // Add createdAt timestamp if not provided
  if (!room.createdAt) {
    room.createdAt = Date.now()
  }

  localStorage.setItem("rooms", JSON.stringify([...rooms, room]))
  return { success: true }
}

export function updateRoom(updatedRoom: Room): void {
  if (typeof window === "undefined") return
  const rooms = getRooms()
  const updatedRooms = rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
  localStorage.setItem("rooms", JSON.stringify(updatedRooms))
}

export function deleteRoom(id: string): void {
  if (typeof window === "undefined") return
  const rooms = getRooms()
  localStorage.setItem("rooms", JSON.stringify(rooms.filter((room) => room.id !== id)))
}

// Room Category functions
export function getRoomCategories(): RoomCategory[] {
  if (typeof window === "undefined") return []
  const categories = localStorage.getItem("roomCategories")
  return categories ? JSON.parse(categories) : []
}

export function addRoomCategory(category: RoomCategory): { success: boolean; message?: string } {
  if (typeof window === "undefined") return { success: false, message: "Cannot access storage" }

  const categories = getRoomCategories()

  // Check if category name already exists (case insensitive)
  const categoryExists = categories.some(
    (existingCategory) => existingCategory.name.toLowerCase() === category.name.toLowerCase(),
  )

  if (categoryExists) {
    return { success: false, message: `Category "${category.name}" already exists` }
  }

  // Add createdAt timestamp if not provided
  if (!category.createdAt) {
    category.createdAt = Date.now()
  }

  localStorage.setItem("roomCategories", JSON.stringify([...categories, category]))
  return { success: true }
}

export function updateRoomCategory(updatedCategory: RoomCategory): { success: boolean; message?: string } {
  if (typeof window === "undefined") return { success: false, message: "Cannot access storage" }

  const categories = getRoomCategories()

  // Check if we're trying to rename to a name that already exists (excluding the current category)
  const categoryExists = categories.some(
    (existingCategory) =>
      existingCategory.id !== updatedCategory.id &&
      existingCategory.name.toLowerCase() === updatedCategory.name.toLowerCase(),
  )

  if (categoryExists) {
    return { success: false, message: `Category "${updatedCategory.name}" already exists` }
  }

  const updatedCategories = categories.map((category) =>
    category.id === updatedCategory.id ? updatedCategory : category,
  )
  localStorage.setItem("roomCategories", JSON.stringify(updatedCategories))
  return { success: true }
}

export function deleteRoomCategory(id: string): void {
  if (typeof window === "undefined") return
  const categories = getRoomCategories()
  localStorage.setItem("roomCategories", JSON.stringify(categories.filter((cat) => cat.id !== id)))
}

// Keep the getRoomTypes function for backward compatibility if needed
export function getRoomTypes(): any[] {
  if (typeof window === "undefined") return []
  const types = localStorage.getItem("roomTypes")
  return types ? JSON.parse(types) : []
}
