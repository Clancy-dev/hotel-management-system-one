export interface RoomStatusHistoryEntry {
  id: string
  roomId: string
  roomNumber: string
  action: "status-changed"
  timestamp: Date
  changes: {
    field: "status"
    oldValue: string
    newValue: string
  }[]
  data: {
    status: string
    guest?: string | null
    checkOut?: string | null
    nextReservation: string
  }
}

export const addRoomStatusHistory = (
  roomId: string,
  roomNumber: string,
  oldStatus: string,
  newStatus: string,
  roomData: any,
) => {
  const historyKey = "hotel-room-status-history"
  const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]")

  const historyEntry: RoomStatusHistoryEntry = {
    id: Date.now().toString(),
    roomId,
    roomNumber,
    action: "status-changed",
    timestamp: new Date(),
    changes: [
      {
        field: "status",
        oldValue: oldStatus,
        newValue: newStatus,
      },
    ],
    data: {
      status: newStatus,
      guest: roomData.guest,
      checkOut: roomData.checkOut,
      nextReservation: roomData.nextReservation,
    },
  }

  existingHistory.push(historyEntry)
  localStorage.setItem(historyKey, JSON.stringify(existingHistory))
}

export const getRoomStatusHistory = (roomId: string): RoomStatusHistoryEntry[] => {
  const historyKey = "hotel-room-status-history"
  const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]")

  return existingHistory
    .filter((entry: RoomStatusHistoryEntry) => entry.roomId === roomId)
    .map((entry: RoomStatusHistoryEntry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }))
    .sort((a: RoomStatusHistoryEntry, b: RoomStatusHistoryEntry) => b.timestamp.getTime() - a.timestamp.getTime())
}

export const getRoomStatusHistoryByDate = (roomId: string, date: Date): RoomStatusHistoryEntry[] => {
  const allHistory = getRoomStatusHistory(roomId)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  const nextDate = new Date(targetDate)
  nextDate.setDate(nextDate.getDate() + 1)

  return allHistory.filter((entry) => {
    const entryDate = new Date(entry.timestamp)
    return entryDate >= targetDate && entryDate < nextDate
  })
}
