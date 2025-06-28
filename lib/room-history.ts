export interface RoomHistoryEntry {
  id: string
  roomId: string
  roomNumber: string
  action: "created" | "edited"
  timestamp: Date
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  data: {
    type: string
    price: number
    amenities: string[]
    bedType: string
    size: string
    maxOccupancy: number
    description?: string
    images: string[]
  }
}

export const addRoomHistory = (
  roomId: string,
  roomNumber: string,
  action: "created" | "edited",
  currentData: any,
  previousData?: any,
) => {
  const historyKey = "hotel-room-history"
  const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]")

  const changes: { field: string; oldValue: any; newValue: any }[] = []

  if (action === "edited" && previousData) {
    // Track changes
    const fieldsToTrack = ["type", "price", "amenities", "bedType", "size", "maxOccupancy", "description", "images"]

    fieldsToTrack.forEach((field) => {
      if (JSON.stringify(previousData[field]) !== JSON.stringify(currentData[field])) {
        changes.push({
          field,
          oldValue: previousData[field],
          newValue: currentData[field],
        })
      }
    })
  }

  const historyEntry: RoomHistoryEntry = {
    id: Date.now().toString(),
    roomId,
    roomNumber,
    action,
    timestamp: new Date(),
    changes: action === "edited" ? changes : undefined,
    data: {
      type: currentData.type,
      price: currentData.price,
      amenities: currentData.amenities,
      bedType: currentData.bedType,
      size: currentData.size,
      maxOccupancy: currentData.maxOccupancy,
      description: currentData.description,
      images: currentData.images,
    },
  }

  existingHistory.push(historyEntry)
  localStorage.setItem(historyKey, JSON.stringify(existingHistory))
}

export const getRoomHistory = (roomId: string): RoomHistoryEntry[] => {
  const historyKey = "hotel-room-history"
  const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]")

  return existingHistory
    .filter((entry: RoomHistoryEntry) => entry.roomId === roomId)
    .map((entry: RoomHistoryEntry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }))
    .sort((a: RoomHistoryEntry, b: RoomHistoryEntry) => b.timestamp.getTime() - a.timestamp.getTime())
}

export const getRoomHistoryByDate = (roomId: string, date: Date): RoomHistoryEntry[] => {
  const allHistory = getRoomHistory(roomId)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const nextDate = new Date(targetDate)
  nextDate.setDate(nextDate.getDate() + 1)

  return allHistory.filter((entry) => {
    const entryDate = new Date(entry.timestamp)
    return entryDate >= targetDate && entryDate < nextDate
  })
}
