export interface RoomTypeData {
  id: string
  name: string
  description: string
  basePrice: number
  maxOccupancy: number
  bedType: string
  size: string
  amenities: string[]
  defaultImages: string[]
}

export const roomTypesData: RoomTypeData[] = [
  {
    id: "standard-single",
    name: "Standard Single",
    description: "Comfortable single room with essential amenities perfect for solo travelers",
    basePrice: 150000, // UGX
    maxOccupancy: 1,
    bedType: "Single Bed",
    size: "200 sq ft",
    amenities: ["WiFi", "TV", "AC", "Private Bathroom"],
    defaultImages: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "standard-double",
    name: "Standard Double",
    description: "Spacious double room with comfortable amenities for couples",
    basePrice: 220000, // UGX
    maxOccupancy: 2,
    bedType: "Double Bed",
    size: "250 sq ft",
    amenities: ["WiFi", "TV", "AC", "Private Bathroom", "Mini Bar"],
    defaultImages: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "deluxe-single",
    name: "Deluxe Single",
    description: "Premium single room with enhanced amenities and city view",
    basePrice: 200000, // UGX
    maxOccupancy: 1,
    bedType: "Queen Bed",
    size: "280 sq ft",
    amenities: ["WiFi", "TV", "AC", "Private Bathroom", "Mini Bar", "City View", "Room Service"],
    defaultImages: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "deluxe-double",
    name: "Deluxe Double",
    description: "Spacious double room with premium amenities and beautiful views",
    basePrice: 300000, // UGX
    maxOccupancy: 2,
    bedType: "Queen Bed",
    size: "320 sq ft",
    amenities: ["WiFi", "TV", "AC", "Private Bathroom", "Mini Bar", "City View", "Room Service", "Safe"],
    defaultImages: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "family-suite",
    name: "Family Suite",
    description: "Large suite perfect for families with children and extended stays",
    basePrice: 450000, // UGX
    maxOccupancy: 4,
    bedType: "King Bed + Sofa Bed",
    size: "450 sq ft",
    amenities: ["WiFi", "TV", "AC", "Private Bathroom", "Mini Bar", "Kitchenette", "Balcony", "Room Service", "Safe"],
    defaultImages: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "executive-suite",
    name: "Executive Suite",
    description: "Luxury suite with premium amenities and personalized services",
    basePrice: 650000, // UGX
    maxOccupancy: 2,
    bedType: "King Bed",
    size: "600 sq ft",
    amenities: [
      "WiFi",
      "TV",
      "AC",
      "Private Bathroom",
      "Mini Bar",
      "Jacuzzi",
      "Ocean View",
      "Butler Service",
      "Room Service",
      "Safe",
      "Hair Dryer",
      "Iron",
      "Coffee Maker",
    ],
    defaultImages: ["/placeholder.svg?height=200&width=300"],
  },
  {
    id: "presidential-suite",
    name: "Presidential Suite",
    description: "Ultimate luxury accommodation with exclusive amenities and services",
    basePrice: 1200000, // UGX
    maxOccupancy: 4,
    bedType: "King Bed + Queen Bed",
    size: "1000 sq ft",
    amenities: [
      "WiFi",
      "TV",
      "AC",
      "Private Bathroom",
      "Mini Bar",
      "Jacuzzi",
      "Ocean View",
      "Butler Service",
      "Room Service",
      "Safe",
      "Hair Dryer",
      "Iron",
      "Coffee Maker",
      "Balcony",
      "Kitchenette",
    ],
    defaultImages: ["/placeholder.svg?height=200&width=300"],
  },
]

export const getRoomTypeById = (id: string): RoomTypeData | undefined => {
  return roomTypesData.find((roomType) => roomType.id === id)
}

export const getRoomTypeByName = (name: string): RoomTypeData | undefined => {
  return roomTypesData.find((roomType) => roomType.name === name)
}
