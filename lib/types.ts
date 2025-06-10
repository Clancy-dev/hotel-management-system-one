export interface Room {
  id: string
  roomNumber: string
  categoryId: string
  price: number
  description: string
  images: string[] // Array of image URLs
  createdAt: number // Timestamp for when the room was created
}

export interface RoomCategory {
  id: string
  name: string
  createdAt: number // Timestamp for when the category was created
}

// Keep the RoomType interface for backward compatibility if needed
export interface RoomType {
  id: string
  name: string
  description: string
}
