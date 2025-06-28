"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCheck,
  Building,
  History,
  ChevronDown,
  Trash,
  RotateCcw,
  CalendarIcon,
  TrendingDown,
} from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

interface StatusHistoryEntry {
  status: "pending" | "in-progress" | "worked-on"
  timestamp: number
  assignedTo?: string
  note?: string
}

interface MaintenanceRequest {
  id: string
  room: string
  issueType: string
  issue: string
  priority: "low" | "medium" | "urgent"
  status: "pending" | "in-progress" | "worked-on"
  reportedBy: string
  assignedTo: string
  reportedDate: string
  estimatedCompletion: string
  description: string
  createdAt: number
  statusHistory: StatusHistoryEntry[]
  deletedAt?: number
  deletedBy?: string
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [topRoomsPopoverOpen, setTopRoomsPopoverOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Add refresh key for force re-render

  const itemsPerPageOptions = [5, 10, 15, 20, 50, 100]
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false)
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false)
  const [editRequestDialogOpen, setEditRequestDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [maintenanceHistoryDialogOpen, setMaintenanceHistoryDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [requestToDelete, setRequestToDelete] = useState<MaintenanceRequest | null>(null)

  const [deletedRequests, setDeletedRequests] = useState<MaintenanceRequest[]>([])
  const [recycleBinDialogOpen, setRecycleBinDialogOpen] = useState(false)
  const [recycleBinSearchTerm, setRecycleBinSearchTerm] = useState("")
  const [recycleBinDateFilter, setRecycleBinDateFilter] = useState<Date | undefined>(undefined)
  const [recycleBinTimeFilter, setRecycleBinTimeFilter] = useState("")
  const [recycleBinCurrentPage, setRecycleBinCurrentPage] = useState(1)
  const [recycleBinItemsPerPage, setRecycleBinItemsPerPage] = useState(5)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // Form state - persisted across dialog closes
  const [formData, setFormData] = useState(() => ({
    room: "",
    issueType: "",
    priority: "",
    description: "",
    reportedBy: "",
    assignedTo: "",
  }))
useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = window.localStorage.getItem("maintenance-form-data")
      if (saved) setFormData(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [])
  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("maintenance-form-data", JSON.stringify(formData))
  }, [formData])

  // Helper function to format duration
  const formatDuration = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years} year${years > 1 ? "s" : ""}`
    if (months > 0) return `${months} month${months > 1 ? "s" : ""}`
    if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""}`
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""}`
    return `${seconds} second${seconds !== 1 ? "s" : ""}`
  }

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // Load requests from localStorage
  useEffect(() => {
    const savedRequests = localStorage.getItem("maintenance-requests")
    if (savedRequests) {
      try {
        const parsedRequests = JSON.parse(savedRequests)
        setRequests(parsedRequests)
      } catch (error) {
        console.error("Error parsing saved requests:", error)
        // Initialize with sample data if parsing fails
        initializeSampleData()
      }
    } else {
      initializeSampleData()
    }
  }, [refreshKey]) // Add refreshKey as dependency

  const initializeSampleData = () => {
    const now = Date.now()
    const sampleRequests: MaintenanceRequest[] = [
      {
        id: "MNT001",
        room: "205",
        issueType: "HVAC",
        issue: "Air conditioning not working",
        priority: "urgent",
        status: "pending",
        reportedBy: "Housekeeping",
        assignedTo: "John Doe",
        reportedDate: "2024-01-15",
        estimatedCompletion: "2024-01-16",
        description: "The AC unit in room 205 is not cooling properly. Guests have complained about the temperature.",
        createdAt: now - 86400000, // 1 day ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 86400000,
            assignedTo: "John Doe",
            note: "Request created and assigned",
          },
        ],
      },
      {
        id: "MNT002",
        room: "301",
        issueType: "Plumbing",
        issue: "Leaky faucet in bathroom",
        priority: "medium",
        status: "in-progress",
        reportedBy: "Guest",
        assignedTo: "Mike Wilson",
        reportedDate: "2024-01-14",
        estimatedCompletion: "2024-01-17",
        description: "Bathroom faucet is dripping continuously, causing water waste.",
        createdAt: now - 172800000, // 2 days ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 172800000,
            assignedTo: "Mike Wilson",
            note: "Request created and assigned",
          },
          {
            status: "in-progress",
            timestamp: now - 86400000, // Started work 1 day ago
            assignedTo: "Mike Wilson",
            note: "Started working on the issue",
          },
        ],
      },
      {
        id: "MNT003",
        room: "102",
        issueType: "Electronics",
        issue: "TV remote not working",
        priority: "low",
        status: "worked-on",
        reportedBy: "Front Desk",
        assignedTo: "Sarah Johnson",
        reportedDate: "2024-01-13",
        estimatedCompletion: "2024-01-14",
        description: "TV remote control is unresponsive. Batteries have been checked.",
        createdAt: now - 259200000, // 3 days ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 259200000,
            assignedTo: "Sarah Johnson",
            note: "Request created and assigned",
          },
          {
            status: "in-progress",
            timestamp: now - 172800000, // Started work 2 days ago
            assignedTo: "Sarah Johnson",
            note: "Started troubleshooting the remote",
          },
          {
            status: "worked-on",
            timestamp: now - 86400000, // Completed 1 day ago
            assignedTo: "Sarah Johnson",
            note: "Replaced batteries and tested functionality",
          },
        ],
      },
      {
        id: "MNT004",
        room: "205",
        issueType: "Electrical",
        issue: "Flickering lights",
        priority: "medium",
        status: "in-progress",
        reportedBy: "Housekeeping",
        assignedTo: "John Doe",
        reportedDate: "2024-01-16",
        estimatedCompletion: "2024-01-18",
        description: "Lights in the main room area are flickering intermittently.",
        createdAt: now - 43200000, // 12 hours ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 43200000,
            assignedTo: "John Doe",
            note: "Request created and assigned",
          },
          {
            status: "in-progress",
            timestamp: now - 21600000, // Started work 6 hours ago
            assignedTo: "John Doe",
            note: "Investigating electrical connections",
          },
        ],
      },
    ]

    // Add more sample data to demonstrate pagination
    const additionalSampleRequests: MaintenanceRequest[] = [
      {
        id: "MNT005",
        room: "105",
        issueType: "Plumbing",
        issue: "Shower not draining properly",
        priority: "medium",
        status: "pending",
        reportedBy: "Housekeeping",
        assignedTo: "Mike Wilson",
        reportedDate: "2024-01-17",
        estimatedCompletion: "2024-01-19",
        description: "Water is pooling in the shower area, drain appears to be clogged.",
        createdAt: now - 21600000, // 6 hours ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 21600000,
            assignedTo: "Mike Wilson",
            note: "Request created and assigned",
          },
        ],
      },
      {
        id: "MNT006",
        room: "302",
        issueType: "Furniture",
        issue: "Broken chair in room",
        priority: "low",
        status: "pending",
        reportedBy: "Guest",
        assignedTo: "Unassigned",
        reportedDate: "2024-01-17",
        estimatedCompletion: "2024-01-20",
        description: "One of the chairs has a broken leg and is unsafe to use.",
        createdAt: now - 10800000, // 3 hours ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 10800000,
            note: "Request created, awaiting assignment",
          },
        ],
      },
      {
        id: "MNT007",
        room: "201",
        issueType: "Electronics",
        issue: "WiFi not working",
        priority: "urgent",
        status: "worked-on",
        reportedBy: "Front Desk",
        assignedTo: "IT Support",
        reportedDate: "2024-01-17",
        estimatedCompletion: "2024-01-18",
        description: "Guest cannot connect to WiFi, appears to be a router issue in this section.",
        createdAt: now - 7200000, // 2 hours ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 7200000,
            assignedTo: "IT Support",
            note: "Urgent WiFi issue reported",
          },
          {
            status: "in-progress",
            timestamp: now - 5400000, // Started work 1.5 hours ago
            assignedTo: "IT Support",
            note: "Investigating network connectivity",
          },
          {
            status: "worked-on",
            timestamp: now - 3600000, // Completed 1 hour ago
            assignedTo: "IT Support",
            note: "Router reset and configuration updated",
          },
        ],
      },
      {
        id: "MNT008",
        room: "103",
        issueType: "Cleaning",
        issue: "Carpet stain needs attention",
        priority: "low",
        status: "worked-on",
        reportedBy: "Housekeeping",
        assignedTo: "Cleaning Crew",
        reportedDate: "2024-01-16",
        estimatedCompletion: "2024-01-17",
        description: "Large stain on carpet near the window, requires professional cleaning.",
        createdAt: now - 32400000, // 9 hours ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 32400000,
            assignedTo: "Cleaning Crew",
            note: "Carpet cleaning request assigned",
          },
          {
            status: "in-progress",
            timestamp: now - 18000000, // Started work 5 hours ago
            assignedTo: "Cleaning Crew",
            note: "Professional cleaning in progress",
          },
          {
            status: "worked-on",
            timestamp: now - 14400000, // Completed 4 hours ago
            assignedTo: "Cleaning Crew",
            note: "Stain removed and carpet dried",
          },
        ],
      },
      // Add more rooms to show variety
      {
        id: "MNT009",
        room: "401",
        issueType: "HVAC",
        issue: "Heating not working",
        priority: "urgent",
        status: "pending",
        reportedBy: "Guest",
        assignedTo: "John Doe",
        reportedDate: "2024-01-17",
        estimatedCompletion: "2024-01-18",
        description: "Room is too cold, heating system not responding.",
        createdAt: now - 1800000, // 30 minutes ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 1800000,
            assignedTo: "John Doe",
            note: "Urgent heating issue reported",
          },
        ],
      },
      {
        id: "MNT010",
        room: "205",
        issueType: "Plumbing",
        issue: "Toilet not flushing",
        priority: "urgent",
        status: "pending",
        reportedBy: "Housekeeping",
        assignedTo: "Mike Wilson",
        reportedDate: "2024-01-17",
        estimatedCompletion: "2024-01-18",
        description: "Toilet mechanism appears to be broken.",
        createdAt: now - 900000, // 15 minutes ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 900000,
            assignedTo: "Mike Wilson",
            note: "Urgent plumbing issue reported",
          },
        ],
      },
      {
        id: "MNT011",
        room: "304",
        issueType: "Electronics",
        issue: "TV not turning on",
        priority: "medium",
        status: "pending",
        reportedBy: "Guest",
        assignedTo: "Sarah Johnson",
        reportedDate: "2024-01-17",
        estimatedCompletion: "2024-01-19",
        description: "Television does not respond to power button or remote.",
        createdAt: now - 600000, // 10 minutes ago
        statusHistory: [
          {
            status: "pending",
            timestamp: now - 600000,
            assignedTo: "Sarah Johnson",
            note: "TV issue reported",
          },
        ],
      },
    ]

    const allSampleRequests = [...sampleRequests, ...additionalSampleRequests]
    setRequests(allSampleRequests)
    localStorage.setItem("maintenance-requests", JSON.stringify(allSampleRequests))
  }

  // Save requests to localStorage with error handling
  const saveRequestsToStorage = useCallback((arr: MaintenanceRequest[]) => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem("maintenance-requests", JSON.stringify(arr))
    } catch (err) {
      console.error(err)
      toast.error("Failed to save requests")
    }
  }, [])


  // Save deleted requests to localStorage with error handling
  const saveDeletedRequestsToStorage = useCallback((deletedRequestsToSave: MaintenanceRequest[]) => {
    try {
      localStorage.setItem("deleted-maintenance-requests", JSON.stringify(deletedRequestsToSave))
    } catch (error) {
      console.error("Error saving deleted requests to localStorage:", error)
      toast.error("Failed to save deleted data to local storage")
    }
  }, [])

  // Save requests to localStorage when requests change
  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("maintenance-form-data", JSON.stringify(formData))
  }, [formData])

  // Load deleted requests from localStorage
  useEffect(() => {
    const savedDeletedRequests = localStorage.getItem("deleted-maintenance-requests")
    if (savedDeletedRequests) {
      try {
        const parsedDeletedRequests = JSON.parse(savedDeletedRequests)
        setDeletedRequests(parsedDeletedRequests)
      } catch (error) {
        console.error("Error parsing deleted requests:", error)
        setDeletedRequests([])
      }
    }
  }, [])

  // Save deleted requests to localStorage when they change
  useEffect(() => {
    if (deletedRequests.length >= 0) {
      saveDeletedRequestsToStorage(deletedRequests)
    }
  }, [deletedRequests, saveDeletedRequestsToStorage])

  // Filter and search requests
  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch =
        request.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter

      return matchesSearch && matchesPriority
    })
    .sort((a, b) => b.createdAt - a.createdAt) // Most recent first

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage)

  // Calculate stats
  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in-progress").length,
    urgent: requests.filter((r) => r.priority === "urgent").length,
    medium: requests.filter((r) => r.priority === "medium").length,
    low: requests.filter((r) => r.priority === "low").length,
    completed: requests.filter((r) => r.status === "worked-on").length,
    lostRevenue: requests.reduce((total, request) => {
      if (request.status === "in-progress") {
        const inProgressEntry = request.statusHistory.find((entry) => entry.status === "in-progress")
        if (inProgressEntry) {
          const daysInProgress = Math.ceil((Date.now() - inProgressEntry.timestamp) / (1000 * 60 * 60 * 24))
          // Assume average room rate of 200,000 UGX per night
          return total + daysInProgress * 200000
        }
      }
      return total
    }, 0),
  }

  // Get rooms with most requests
  const roomRequestCounts = requests.reduce(
    (acc, request) => {
      acc[request.room] = (acc[request.room] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topRooms = Object.entries(roomRequestCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Get all rooms with their request details for the popover
  const allRoomsWithDetails = Object.entries(roomRequestCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([room, count]) => {
      const roomRequests = requests.filter((r) => r.room === room)
      const latestRequest = roomRequests.sort((a, b) => b.createdAt - a.createdAt)[0]
      const pendingCount = roomRequests.filter((r) => r.status === "pending").length
      const inProgressCount = roomRequests.filter((r) => r.status === "in-progress").length
      const completedCount = roomRequests.filter((r) => r.status === "worked-on").length

      return {
        room,
        totalRequests: count,
        pendingCount,
        inProgressCount,
        completedCount,
        latestRequest,
        latestIssueType: latestRequest?.issueType,
        latestPriority: latestRequest?.priority,
      }
    })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "worked-on":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "worked-on":
        return <CheckCircle className="h-3 w-3" />
      case "in-progress":
        return <Wrench className="h-3 w-3" />
      case "pending":
        return <Clock className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  const addStatusHistoryEntry = (
    request: MaintenanceRequest,
    newStatus: "pending" | "in-progress" | "worked-on",
    note?: string,
  ) => {
    const historyEntry: StatusHistoryEntry = {
      status: newStatus,
      timestamp: Date.now(),
      assignedTo: request.assignedTo,
      note: note || `Status changed to ${newStatus.replace("-", " ")}`,
    }

    return {
      ...request,
      status: newStatus,
      statusHistory: [...request.statusHistory, historyEntry],
    }
  }

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.room || !formData.issueType || !formData.priority || !formData.description || !formData.reportedBy) {
      toast.error("Please fill in all required fields")
      return
    }

    const newRequest: MaintenanceRequest = {
      id: `MNT${String(requests.length + 1).padStart(3, "0")}`,
      room: formData.room,
      issueType: formData.issueType,
      issue: `${formData.issueType} issue in room ${formData.room}`,
      priority: formData.priority as "low" | "medium" | "urgent",
      status: "pending",
      reportedBy: formData.reportedBy,
      assignedTo: formData.assignedTo || "Unassigned",
      reportedDate: new Date().toISOString().split("T")[0],
      estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: formData.description,
      createdAt: Date.now(),
      statusHistory: [
        {
          status: "pending",
          timestamp: Date.now(),
          assignedTo: formData.assignedTo || "Unassigned",
          note: "Request created and assigned",
        },
      ],
    }

    setRequests((prev) => [newRequest, ...prev])

    // Clear form data after successful submission
    handleClearForm()

    setNewRequestDialogOpen(false)
    toast.success("Maintenance request submitted successfully!")
  }

  const handleEditRequest = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !selectedRequest ||
      !formData.room ||
      !formData.issueType ||
      !formData.priority ||
      !formData.description ||
      !formData.reportedBy
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    const updatedRequest: MaintenanceRequest = {
      ...selectedRequest,
      room: formData.room,
      issueType: formData.issueType,
      issue: `${formData.issueType} issue in room ${formData.room}`,
      priority: formData.priority as "low" | "medium" | "urgent",
      reportedBy: formData.reportedBy,
      assignedTo: formData.assignedTo || "Unassigned",
      description: formData.description,
    }

    setRequests((prev) => prev.map((req) => (req.id === selectedRequest.id ? updatedRequest : req)))
    setEditRequestDialogOpen(false)
    setSelectedRequest(null)
    toast.success("Maintenance request updated successfully!")
  }

  const handleViewDetails = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setViewDetailsDialogOpen(true)
  }

  const handleViewMaintenanceHistory = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setMaintenanceHistoryDialogOpen(true)
  }

  const handleEditClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setFormData({
      room: request.room,
      issueType: request.issueType,
      priority: request.priority,
      description: request.description,
      reportedBy: request.reportedBy,
      assignedTo: request.assignedTo,
    })
    setEditRequestDialogOpen(true)
  }

  const handleWorkedOn = (request: MaintenanceRequest) => {
    const updatedRequest = addStatusHistoryEntry(request, "worked-on", "Request marked as completed")
    setRequests((prev) => prev.map((req) => (req.id === request.id ? updatedRequest : req)))
    toast.success(`Request ${request.id} marked as worked on!`)
  }

  const handleDeleteClick = (request: MaintenanceRequest) => {
    setRequestToDelete(request)
    setDeleteConfirmOpen(true)
  }

  // FIXED: Completely rewritten delete function to prevent freezing
   const handleConfirmDelete = useCallback(() => {
    if (!requestToDelete) return
    const delReq = { ...requestToDelete, deletedAt: Date.now(), deletedBy: "Current User" }
    setRequests((prev) => prev.filter((r) => r.id !== requestToDelete.id))
    setDeletedRequests((prev) => [delReq, ...prev])
    toast.success(`Request ${delReq.id} moved to recycle bin!`)
  }, [requestToDelete])
  const handleClearForm = () => {
    const cleared = { room: "", issueType: "", priority: "", description: "", reportedBy: "", assignedTo: "" }
    setFormData(cleared)
    if (typeof window !== "undefined") window.localStorage.setItem("maintenance-form-data", JSON.stringify(cleared))
  }

  // Filter deleted requests based on search, date, and time
  const filteredDeletedRequests = deletedRequests
    .filter((request) => {
      const matchesSearch =
        !recycleBinSearchTerm ||
        request.room.toLowerCase().includes(recycleBinSearchTerm.toLowerCase()) ||
        request.issueType.toLowerCase().includes(recycleBinSearchTerm.toLowerCase()) ||
        request.issue.toLowerCase().includes(recycleBinSearchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(recycleBinSearchTerm.toLowerCase()) ||
        request.reportedBy.toLowerCase().includes(recycleBinSearchTerm.toLowerCase())

      const matchesDate =
        !recycleBinDateFilter ||
        format(new Date(request.deletedAt || 0), "yyyy-MM-dd") === format(recycleBinDateFilter, "yyyy-MM-dd")

      const matchesTime = (() => {
        if (!recycleBinTimeFilter) return true

        const requestTime = format(new Date(request.deletedAt || 0), "h:mm a")

        if (recycleBinTimeFilter.includes("-")) {
          const [fromTime, toTime] = recycleBinTimeFilter.split("-")
          if (fromTime && toTime) {
            // Convert times to 24-hour format for comparison
            const parseTime = (timeStr: string) => {
              const [time, period] = timeStr.trim().split(/\s+/)
              const [hours, minutes] = time.split(":").map(Number)
              let hour24 = hours
              if (period?.toLowerCase() === "pm" && hours !== 12) hour24 += 12
              if (period?.toLowerCase() === "am" && hours === 12) hour24 = 0
              return hour24 * 60 + (minutes || 0)
            }

            try {
              const requestMinutes = parseTime(requestTime)
              const fromMinutes = parseTime(fromTime)
              const toMinutes = parseTime(toTime)

              return requestMinutes >= fromMinutes && requestMinutes <= toMinutes
            } catch {
              return true // If parsing fails, don't filter
            }
          }
        }

        // Single time search (original behavior)
        return requestTime.toLowerCase().includes(recycleBinTimeFilter.toLowerCase())
      })()

      return matchesSearch && matchesDate && matchesTime
    })
    .sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0))

  // Pagination for recycle bin
  const recycleBinTotalPages = Math.ceil(filteredDeletedRequests.length / recycleBinItemsPerPage)
  const recycleBinStartIndex = (recycleBinCurrentPage - 1) * recycleBinItemsPerPage
  const paginatedDeletedRequests = filteredDeletedRequests.slice(
    recycleBinStartIndex,
    recycleBinStartIndex + recycleBinItemsPerPage,
  )

  // Restore deleted request
  const handleRestoreRequest = useCallback(
    (request: MaintenanceRequest) => {
      try {
        // Remove deletedAt and deletedBy properties when restoring
        const { deletedAt, deletedBy, ...restoredRequest } = request

        const updatedRequests = [restoredRequest, ...requests]
        const updatedDeletedRequests = deletedRequests.filter((req) => req.id !== request.id)

        setRequests(updatedRequests)
        setDeletedRequests(updatedDeletedRequests)

        // Save to localStorage
        saveRequestsToStorage(updatedRequests)
        saveDeletedRequestsToStorage(updatedDeletedRequests)

        toast.success(`Request ${request.id} restored successfully!`)
      } catch (error) {
        console.error("Error restoring request:", error)
        toast.error("Failed to restore request. Please try again.")
      }
    },
    [requests, deletedRequests, saveRequestsToStorage, saveDeletedRequestsToStorage],
  )

  

  // Permanently delete request
  const handlePermanentDelete = useCallback(
    (request: MaintenanceRequest) => {
      try {
        const updatedDeletedRequests = deletedRequests.filter((req) => req.id !== request.id)
        setDeletedRequests(updatedDeletedRequests)
        saveDeletedRequestsToStorage(updatedDeletedRequests)
        toast.success(`Request ${request.id} permanently deleted!`)
      } catch (error) {
        console.error("Error permanently deleting request:", error)
        toast.error("Failed to permanently delete request. Please try again.")
      }
    },
    [deletedRequests, saveDeletedRequestsToStorage],
  )

  const handleMarkInProgress = (request: MaintenanceRequest) => {
    const updatedRequest = addStatusHistoryEntry(request, "in-progress", "Work started on this request")
    setRequests((prev) => prev.map((req) => (req.id === request.id ? updatedRequest : req)))
    toast.success(`Request ${request.id} marked as in progress!`)
  }

  return (
    <div className="space-y-6" key={refreshKey}>
      <Toaster />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Room Maintenance</h1>
          <p className="text-muted-foreground">Track and manage room maintenance requests</p>
        </div>
        <Dialog open={newRequestDialogOpen} onOpenChange={setNewRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Maintenance Request</DialogTitle>
              <DialogDescription>Report a new maintenance issue for a room</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-number">Room Number *</Label>
                <Input
                  id="room-number"
                  placeholder="e.g., 205"
                  value={formData.room}
                  onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, room: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue-type">Issue Type *</Label>
                <Select
                  value={formData.issueType}
                  onValueChange={(value) => setFormData((prev: typeof formData) => ({ ...prev, issueType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData((prev: typeof formData) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reported-by">Reported By *</Label>
                <Input
                  id="reported-by"
                  placeholder="Your name"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, reportedBy: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned-to">Assigned To</Label>
                <Input
                  id="assigned-to"
                  placeholder="Technician name (optional)"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, assignedTo: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClearForm} className="flex-1 bg-transparent">
                  Clear Form
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewRequestDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Submit Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active repairs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Worked Upon</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost Revenue</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">
              {new Intl.NumberFormat("en-UG", {
                style: "currency",
                currency: "UGX",
                minimumFractionDigits: 0,
              }).format(stats.lostRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">From in-progress rooms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-600">Urgent</span>
                <span className="font-medium">{stats.urgent}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600">Medium</span>
                <span className="font-medium">{stats.medium}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Low</span>
                <span className="font-medium">{stats.low}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Popover open={topRoomsPopoverOpen} onOpenChange={setTopRoomsPopoverOpen}>
          <PopoverTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Rooms</CardTitle>
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {topRooms.slice(0, 2).map(([room, count]) => (
                    <div key={room} className="flex justify-between text-xs">
                      <span>Room {room}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                  {topRooms.length > 2 && <p className="text-xs text-muted-foreground">+{topRooms.length - 2} more</p>}
                </div>
              </CardContent>
            </Card>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <h4 className="font-medium">All Rooms - Maintenance Requests</h4>
              <p className="text-sm text-muted-foreground">Sorted by number of requests</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {allRoomsWithDetails.map(
                ({
                  room,
                  totalRequests,
                  pendingCount,
                  inProgressCount,
                  completedCount,
                  latestIssueType,
                  latestPriority,
                }) => (
                  <div key={room} className="p-3 border-b last:border-b-0 hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Room {room}</span>
                        {latestPriority && (
                          <Badge className={getPriorityColor(latestPriority)} variant="outline">
                            {latestPriority}
                          </Badge>
                        )}
                      </div>
                      <span className="text-lg font-bold text-primary">{totalRequests}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-orange-600 font-medium">{pendingCount}</div>
                        <div className="text-muted-foreground">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-600 font-medium">{inProgressCount}</div>
                        <div className="text-muted-foreground">In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-600 font-medium">{completedCount}</div>
                        <div className="text-muted-foreground">Completed</div>
                      </div>
                    </div>
                    {latestIssueType && (
                      <div className="mt-2 text-xs text-muted-foreground">Latest: {latestIssueType}</div>
                    )}
                  </div>
                ),
              )}
            </div>
            {allRoomsWithDetails.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">No rooms with maintenance requests</div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by room, issue type, priority, description, or reporter..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <Select
          value={priorityFilter}
          onValueChange={(value) => {
            setPriorityFilter(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Maintenance Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""} found
            {searchTerm && ` matching "${searchTerm}"`}
            {priorityFilter !== "all" && ` with ${priorityFilter} priority`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-medium">Room {request.room}</h4>
                      <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                      <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                        {getStatusIcon(request.status)}
                        {request.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{request.issue}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewMaintenanceHistory(request)}>
                        <History className="mr-2 h-4 w-4" />
                        Maintenance History
                      </DropdownMenuItem>
                      {request.status === "pending" && (
                        <DropdownMenuItem onClick={() => handleMarkInProgress(request)}>
                          <Wrench className="mr-2 h-4 w-4" />
                          Mark in Progress
                        </DropdownMenuItem>
                      )}
                      {(request.status === "pending" || request.status === "in-progress") && (
                        <DropdownMenuItem onClick={() => handleWorkedOn(request)}>
                          <CheckCheck className="mr-2 h-4 w-4" />
                          Mark as Worked On
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEditClick(request)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(request)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Reported by:</span> {request.reportedBy}
                  </div>
                  <div>
                    <span className="font-medium">Assigned to:</span> {request.assignedTo}
                  </div>
                  <div>
                    <span className="font-medium">Reported:</span> {request.reportedDate}
                  </div>
                  <div>
                    <span className="font-medium">Est. completion:</span> {request.estimatedCompletion}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No maintenance requests found.</p>
            </div>
          )}

          {/* Pagination - Always show */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredRequests.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page" className="text-sm whitespace-nowrap">
                  Show:
                </Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsPerPageOptions.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecycleBinDialogOpen(true)}
                className="mr-2"
                title="Recycle Bin"
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || filteredRequests.length === 0}
              >
                Previous
              </Button>
              <span className="text-sm px-2">
                Page {filteredRequests.length === 0 ? 0 : currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || filteredRequests.length === 0 || totalPages <= 1}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance History Dialog */}
      <Dialog open={maintenanceHistoryDialogOpen} onOpenChange={setMaintenanceHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Maintenance History - {selectedRequest?.id}</DialogTitle>
            <DialogDescription>Complete timeline and status history for Room {selectedRequest?.room}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Room</Label>
                    <p className="text-sm text-muted-foreground">Room {selectedRequest.room}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Issue Type</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequest.issueType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={getPriorityColor(selectedRequest.priority)}>{selectedRequest.priority}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Status</Label>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status.replace("-", " ")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="font-medium mb-4">Status Timeline</h4>
                <div className="space-y-4">
                  {selectedRequest.statusHistory.map((entry, index) => {
                    const nextEntry = selectedRequest.statusHistory[index + 1]
                    const duration = nextEntry
                      ? formatDuration(entry.timestamp, nextEntry.timestamp)
                      : entry.status !== "worked-on"
                        ? formatDuration(entry.timestamp)
                        : "Completed"

                    return (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(entry.status)}`}
                          >
                            {getStatusIcon(entry.status)}
                          </div>
                          {index < selectedRequest.statusHistory.length - 1 && (
                            <div className="w-0.5 h-8 bg-border mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getStatusColor(entry.status)} variant="outline">
                              {entry.status.replace("-", " ")}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
                          </div>
                          {entry.assignedTo && (
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Assigned to:</span> {entry.assignedTo}
                            </p>
                          )}
                          {entry.note && <p className="text-sm text-muted-foreground mb-2">{entry.note}</p>}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Duration: {duration}
                              {entry.status !== "worked-on" && nextEntry
                                ? ""
                                : entry.status !== "worked-on"
                                  ? " (ongoing)"
                                  : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Time Pending</span>
                  </div>
                  <p className="text-lg font-bold text-orange-900">
                    {(() => {
                      const pendingEntry = selectedRequest.statusHistory.find((entry) => entry.status === "pending")
                      const nextEntry = selectedRequest.statusHistory.find(
                        (entry, index) =>
                          selectedRequest.statusHistory[index - 1]?.status === "pending" && entry.status !== "pending",
                      )
                      if (pendingEntry) {
                        return formatDuration(
                          pendingEntry.timestamp,
                          nextEntry
                            ? nextEntry.timestamp
                            : selectedRequest.status === "pending"
                              ? undefined
                              : Date.now(),
                        )
                      }
                      return "N/A"
                    })()}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Time in Progress</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {(() => {
                      const inProgressEntry = selectedRequest.statusHistory.find(
                        (entry) => entry.status === "in-progress",
                      )
                      const nextEntry = selectedRequest.statusHistory.find(
                        (entry, index) =>
                          selectedRequest.statusHistory[index - 1]?.status === "in-progress" &&
                          entry.status !== "in-progress",
                      )
                      if (inProgressEntry) {
                        return formatDuration(
                          inProgressEntry.timestamp,
                          nextEntry
                            ? nextEntry.timestamp
                            : selectedRequest.status === "in-progress"
                              ? undefined
                              : Date.now(),
                        )
                      }
                      return "N/A"
                    })()}
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Total Time</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatDuration(
                      selectedRequest.createdAt,
                      selectedRequest.status === "worked-on"
                        ? selectedRequest.statusHistory[selectedRequest.statusHistory.length - 1]?.timestamp
                        : undefined,
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Details - {selectedRequest?.id}</DialogTitle>
            <DialogDescription>Complete information about this maintenance request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Room Number</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.room}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Issue Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.issueType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedRequest.priority)}>{selectedRequest.priority}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status.replace("-", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reported By</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.reportedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.assignedTo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reported Date</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.reportedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Est. Completion</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.estimatedCompletion}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedRequest.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={editRequestDialogOpen} onOpenChange={setEditRequestDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Request</DialogTitle>
            <DialogDescription>Update the maintenance request details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-room-number">Room Number *</Label>
              <Input
                id="edit-room-number"
                placeholder="e.g., 205"
                value={formData.room}
                onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, room: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-issue-type">Issue Type *</Label>
              <Select
                value={formData.issueType}
                onValueChange={(value) => setFormData((prev: typeof formData) => ({ ...prev, issueType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev: typeof formData) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reported-by">Reported By *</Label>
              <Input
                id="edit-reported-by"
                placeholder="Reporter name"
                value={formData.reportedBy}
                onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, reportedBy: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-assigned-to">Assigned To</Label>
              <Input
                id="edit-assigned-to"
                placeholder="Technician name (optional)"
                value={formData.assignedTo}
                onChange={(e) => setFormData((prev: typeof formData) => ({ ...prev, assignedTo: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClearForm} className="flex-1 bg-transparent">
                Clear Form
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditRequestDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Update Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the maintenance request
              {requestToDelete && ` for Room ${requestToDelete.room} (${requestToDelete.id})`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recycle Bin Dialog */}
      <Dialog open={recycleBinDialogOpen} onOpenChange={setRecycleBinDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash className="h-5 w-5" />
              Recycle Bin
            </DialogTitle>
            <DialogDescription>
              Deleted maintenance requests - {filteredDeletedRequests.length} item
              {filteredDeletedRequests.length !== 1 ? "s" : ""} found
            </DialogDescription>
          </DialogHeader>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 py-4 border-b">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deleted requests..."
                className="pl-8"
                value={recycleBinSearchTerm}
                onChange={(e) => {
                  setRecycleBinSearchTerm(e.target.value)
                  setRecycleBinCurrentPage(1)
                }}
              />
            </div>

            {/* Date Filter */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[200px] justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {recycleBinDateFilter ? format(recycleBinDateFilter, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={recycleBinDateFilter}
                  onSelect={(date) => {
                    setRecycleBinDateFilter(date)
                    setRecycleBinCurrentPage(1)
                    setDatePickerOpen(false)
                  }}
                  initialFocus
                />
                {recycleBinDateFilter && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRecycleBinDateFilter(undefined)
                        setRecycleBinCurrentPage(1)
                        setDatePickerOpen(false)
                      }}
                      className="w-full"
                    >
                      Clear Date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Time Range Filter */}
            <div className="flex items-center gap-2 w-full sm:w-[300px]">
              <Input
                placeholder="From (e.g., 9:00 AM)"
                className="flex-1"
                value={recycleBinTimeFilter.split("-")[0] || ""}
                onChange={(e) => {
                  const fromTime = e.target.value
                  const toTime = recycleBinTimeFilter.split("-")[1] || ""
                  setRecycleBinTimeFilter(fromTime + (toTime ? `-${toTime}` : ""))
                  setRecycleBinCurrentPage(1)
                }}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                placeholder="To (e.g., 5:00 PM)"
                className="flex-1"
                value={recycleBinTimeFilter.split("-")[1] || ""}
                onChange={(e) => {
                  const fromTime = recycleBinTimeFilter.split("-")[0] || ""
                  const toTime = e.target.value
                  setRecycleBinTimeFilter((fromTime ? `${fromTime}-` : "") + toTime)
                  setRecycleBinCurrentPage(1)
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {paginatedDeletedRequests.length > 0 ? (
              <div className="space-y-4">
                {paginatedDeletedRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-medium">Room {request.room}</h4>
                          <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                          <Badge variant="destructive">Deleted</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.issue}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{request.description}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreRequest(request)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePermanentDelete(request)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Deleted:</span> {format(new Date(request.deletedAt || 0), "PPp")}
                      </div>
                      <div>
                        <span className="font-medium">Originally reported:</span> {request.reportedDate}
                      </div>
                      <div>
                        <span className="font-medium">Reported by:</span> {request.reportedBy}
                      </div>
                      <div>
                        <span className="font-medium">Assigned to:</span> {request.assignedTo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {deletedRequests.length === 0 ? "No deleted requests found." : "No requests match your filters."}
                </p>
              </div>
            )}
          </div>

          {/* Recycle Bin Pagination */}
          {filteredDeletedRequests.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {recycleBinStartIndex + 1} to{" "}
                  {Math.min(recycleBinStartIndex + recycleBinItemsPerPage, filteredDeletedRequests.length)} of{" "}
                  {filteredDeletedRequests.length} deleted requests
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor="recycle-items-per-page" className="text-sm whitespace-nowrap">
                    Show:
                  </Label>
                  <Select
                    value={recycleBinItemsPerPage.toString()}
                    onValueChange={(value) => {
                      setRecycleBinItemsPerPage(Number(value))
                      setRecycleBinCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {itemsPerPageOptions.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecycleBinCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={recycleBinCurrentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm px-2">
                  Page {recycleBinCurrentPage} of {recycleBinTotalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecycleBinCurrentPage((prev) => Math.min(recycleBinTotalPages, prev + 1))}
                  disabled={recycleBinCurrentPage === recycleBinTotalPages || recycleBinTotalPages <= 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
