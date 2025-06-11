"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  Trash,
  Eye,
  MoreHorizontal,
  Users,
  Search,
} from "lucide-react"
import { Button } from "./ui/button"
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  getCategoryWithRooms,
  deleteAllRoomsInCategory,
} from "@/actions/category"
import { deleteRoom } from "@/actions/room"
import { Alert, AlertDescription } from "./ui/alert"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

import type { RoomCategory } from "@prisma/client"
import { toast } from "react-hot-toast"
import { useCurrency } from "@/hooks/use-currency"
import { useLanguage } from "@/hooks/use-language"

export type RoomCategoryProps = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

type CategoryWithCount = RoomCategory & {
  _count: {
    rooms: number
  }
}

type CategoryWithRooms = RoomCategory & {
  rooms: Array<{
    id: string
    roomNumber: string
    price: number
    description: string
    images: string[]
    createdAt: Date
  }>
  _count: {
    rooms: number
  }
}

type CategoriesFormPopUpProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCategories?: RoomCategory[]
  onCategoriesChanged?: () => void
}

export default function CategoriesFormPopUp({
  open,
  onOpenChange,
  initialCategories = [],
  onCategoriesChanged,
}: CategoriesFormPopUpProps) {
  const { formatPrice } = useCurrency()
  const { t } = useLanguage()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithCount[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [customCategoryName, setCustomCategoryName] = useState("")
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Category details modal state
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithRooms | null>(null)
  const [isCategoryDetailsOpen, setIsCategoryDetailsOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isDeletingAllRooms, setIsDeletingAllRooms] = useState(false)
  const [isDeletingRoom, setIsDeletingRoom] = useState(false)
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null)
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; roomNumber: string } | null>(null)

  // New states for delete all rooms confirmation
  const [isDeleteAllRoomsDialogOpen, setIsDeleteAllRoomsDialogOpen] = useState(false)
  const [categoryToDeleteAllRooms, setCategoryToDeleteAllRooms] = useState<CategoryWithRooms | null>(null)

  // Pagination for rooms in category details
  const [roomsCurrentPage, setRoomsCurrentPage] = useState(1)
  const roomsPerPage = 5

  const categoriesPerPage = 5

  // Predefined category options with translations
  const categoryOptions = [
    { value: "Single", label: "Single (One Person)" },
    { value: "Double", label: "Double (One Large Bed)" },
    { value: "Twin", label: "Twin (Two Separate Beds)" },
    { value: "Standard", label: "Standard (Basic Room)" },
    { value: "Deluxe", label: "Deluxe (Upgraded Comfort)" },
    { value: "Suite", label: "Suite (Luxury Room)" },
    { value: "Family Room", label: "Family Room (For Families)" },
    { value: "Executive", label: "Executive (Business Travelers)" },
    { value: "Studio", label: "Studio (With Kitchenette)" },
    { value: "Cottage / Bungalow", label: "Cottage / Bungalow (Standalone Unit)" },
    { value: "custom", label: t("category.custom") },
  ]

  useEffect(() => {
    if (open) {
      fetchCategories()
      setCurrentPage(1)
      setSearchTerm("")
      setError(null)
      setEditError(null)
    }
  }, [open])

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase().trim()),
      )
      setFilteredCategories(filtered)
    }
    setCurrentPage(1)
  }, [categories, searchTerm])

  const fetchCategories = async () => {
    try {
      const result = await getCategories()
      if (result.success) {
        setCategories(result.data ?? [])
      } else {
        toast.error("Failed to show Categories")
      }
    } catch (error) {
      toast.error("An unexpected error occurred while showing categories")
      console.error("Error fetching categories:", error)
      setError("An unexpected error occurred while fetching categories")
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    let categoryName = newCategoryName
    if (isCustomCategory && customCategoryName.trim()) {
      categoryName = customCategoryName.trim()
    }

    if (!categoryName) {
      setError(t("category.name.required"))
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createCategory({ name: categoryName })

      if (result.success) {
        await fetchCategories()
        setNewCategoryName("")
        setCustomCategoryName("")
        setIsCustomCategory(false)
        toast.success(t("message.categoryCreated"))
        if (onCategoriesChanged) {
          onCategoriesChanged()
        }
      } else {
        toast.error("Failed to create category")
        setError(result.error || "Failed to add category")
      }
    } catch (error) {
      setError(t("message.error.unexpected"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategoryClick = (id: string) => {
    setDeletingCategoryId(id)
  }

  const handleDeleteCategory = async (id: string) => {
    setIsDeleting(true)
    try {
      const result = await deleteCategory(id)
      if (result.success) {
        setCategories(categories.filter((category) => category.id !== id))
        toast.success(t("message.categoryDeleted"))
        if (onCategoriesChanged) {
          onCategoriesChanged()
        }
      } else {
        toast.error(result.error || "Failed to delete category")
      }
    } catch (error) {
      toast.error(t("message.error.unexpected"))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditCategory = (category: CategoryWithCount) => {
    setEditingCategory(category)
    setCustomCategoryName(category.name)
    setEditError(null)
  }

  const handleUpdateCategory = async () => {
    setEditError(null)

    if (!editingCategory || !customCategoryName.trim()) {
      setEditError(t("category.name.required"))
      return
    }

    setIsEditing(true)

    try {
      const result = await updateCategory(editingCategory.id, {
        id: editingCategory.id,
        name: customCategoryName.trim(),
        createdAt: editingCategory.createdAt,
        updatedAt: editingCategory.updatedAt,
      })

      if (result.success && result.data) {
        await fetchCategories()
        setEditingCategory(null)
        setCustomCategoryName("")
        toast.success(t("message.categoryUpdated"))
        if (onCategoriesChanged) {
          onCategoriesChanged()
        }
      } else {
        setEditError(result.error || "Failed to update category")
      }
    } catch (error) {
      setEditError(t("message.error.unexpected"))
    } finally {
      setIsEditing(false)
    }
  }

  const handleViewCategoryDetails = async (category: CategoryWithCount) => {
    setIsLoadingDetails(true)
    setIsCategoryDetailsOpen(true)
    setRoomsCurrentPage(1)

    try {
      const result = await getCategoryWithRooms(category.id)
      if (result.success) {
        setSelectedCategory(result.data ?? null)
      } else {
        toast.error("Failed to load category details")
        setIsCategoryDetailsOpen(false)
      }
    } catch (error) {
      toast.error(t("message.error.unexpected"))
      setIsCategoryDetailsOpen(false)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleDeleteAllRooms = async (categoryId: string) => {
    setIsDeletingAllRooms(true)
    try {
      const result = await deleteAllRoomsInCategory(categoryId)
      if (result.success) {
        toast.success(`Successfully deleted ${result.data?.deletedCount || 0} rooms`)
        setIsDeleteAllRoomsDialogOpen(false)
        setCategoryToDeleteAllRooms(null)
        await handleViewCategoryDetails(selectedCategory as CategoryWithCount)
        await fetchCategories()
        if (onCategoriesChanged) {
          onCategoriesChanged()
        }
      } else {
        toast.error(result.error || "Failed to delete rooms")
      }
    } catch (error) {
      toast.error(t("message.error.unexpected"))
    } finally {
      setIsDeletingAllRooms(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    setIsDeletingRoom(true)
    try {
      const result = await deleteRoom(roomId)
      if (result.success) {
        toast.success(t("message.roomDeleted"))
        await handleViewCategoryDetails(selectedCategory as CategoryWithCount)
        await fetchCategories()
        if (onCategoriesChanged) {
          onCategoriesChanged()
        }
      } else {
        toast.error("Failed to delete room")
      }
    } catch (error) {
      toast.error(t("message.error.unexpected"))
    } finally {
      setIsDeletingRoom(false)
      setRoomToDelete(null)
    }
  }

  const handleCategorySelect = (value: string) => {
    if (value === "custom") {
      setIsCustomCategory(true)
      setNewCategoryName("")
    } else {
      setIsCustomCategory(false)
      setNewCategoryName(value)
      setCustomCategoryName("")
    }
    setShowCategoryDropdown(false)
  }

  // Pagination logic for categories
  const indexOfLastCategory = currentPage * categoriesPerPage
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory)
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage)

  // Pagination logic for rooms in category details
  const indexOfLastRoom = roomsCurrentPage * roomsPerPage
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage
  const currentRooms = selectedCategory?.rooms.slice(indexOfFirstRoom, indexOfLastRoom) || []
  const totalRoomsPages = Math.ceil((selectedCategory?.rooms.length || 0) / roomsPerPage)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="text-lg sm:text-xl">{t("dialog.categories.title")}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">{t("dialog.categories.description")}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-1">
              <div className="space-y-4 sm:space-y-6">
                <form onSubmit={handleAddCategory} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="categoryName" className="text-sm font-medium">
                      {t("category.name")}
                    </Label>
                    <div>
                      {!isCustomCategory ? (
                        <div className="relative">
                          <button
                            type="button"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            disabled={isSubmitting}
                          >
                            <span className="truncate">
                              {newCategoryName
                                ? categoryOptions.find((opt) => opt.value === newCategoryName)?.label
                                : t("category.select")}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`h-4 w-4 transition-transform flex-shrink-0 ml-2 ${
                                showCategoryDropdown ? "rotate-180" : ""
                              }`}
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>

                          {showCategoryDropdown && (
                            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                              <div className="p-1">
                                {categoryOptions.map((option) => (
                                  <div
                                    key={option.value}
                                    className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                                      newCategoryName === option.value ? "bg-accent text-accent-foreground" : ""
                                    }`}
                                    onClick={() => handleCategorySelect(option.value)}
                                  >
                                    <span className="truncate">{option.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Input
                            value={customCategoryName}
                            onChange={(e) => setCustomCategoryName(e.target.value)}
                            placeholder={t("category.name.placeholder")}
                            className="flex-1"
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCustomCategory(false)}
                            disabled={isSubmitting}
                            className="w-full"
                          >
                            {t("action.cancel")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("action.saving")}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("category.add")}
                      </>
                    )}
                  </Button>
                </form>

                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm sm:text-base">{t("category.existing")}</h3>

                    {/* Search Bar for Categories */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("language.search")}
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      {searchTerm.trim() !== ""
                        ? `${t("category.noResults")} "${searchTerm}"`
                        : t("category.noCategories")}
                    </p>
                  ) : (
                    <div className="space-y-3 mt-4">
                      <div className="space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto">
                        {currentCategories.map((category) => (
                          <div key={category.id} className="rounded-md border p-3">
                            {editingCategory?.id === category.id ? (
                              <div className="space-y-3">
                                {editError && (
                                  <Alert variant="destructive" className="py-2">
                                    <AlertCircle className="h-3 w-3" />
                                    <AlertDescription className="text-xs">{editError}</AlertDescription>
                                  </Alert>
                                )}
                                <Input
                                  value={customCategoryName}
                                  onChange={(e) => setCustomCategoryName(e.target.value)}
                                  disabled={isEditing}
                                  placeholder={t("category.name.placeholder")}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={handleUpdateCategory}
                                    className="flex-1"
                                    disabled={isEditing}
                                  >
                                    {isEditing ? (
                                      <>
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                        {t("action.saving")}
                                      </>
                                    ) : (
                                      t("action.save")
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingCategory(null)
                                      setCustomCategoryName("")
                                      setEditError(null)
                                    }}
                                    className="flex-1"
                                    disabled={isEditing}
                                  >
                                    {t("action.cancel")}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <p className="font-medium truncate text-sm sm:text-base">{category.name}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    <Users className="h-3 w-3 mr-1" />
                                    {category._count.rooms}
                                  </Badge>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewCategoryDetails(category)}
                                    className="h-8 w-8"
                                    title={t("category.view")}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">{t("category.view")}</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditCategory(category)}
                                    disabled={isDeleting}
                                    className="h-8 w-8"
                                    title={t("category.edit")}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">{t("category.edit")}</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCategoryClick(category.id)}
                                    disabled={isDeleting}
                                    className="h-8 w-8"
                                    title={t("category.delete")}
                                  >
                                    {isDeleting ? (
                                      <Loader2 className="h-4 w-4 text-destructive animate-spin" />
                                    ) : (
                                      <Trash className="h-4 w-4 text-destructive" />
                                    )}
                                    <span className="sr-only">{t("category.delete")}</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Results info */}
                      <div className="text-xs text-muted-foreground text-center">
                        {searchTerm.trim() !== "" && (
                          <>
                            {t("table.showing")} {filteredCategories.length} {t("table.of")} {categories.length}{" "}
                            categories
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Pagination at bottom */}
            {totalPages > 1 && (
              <div className="flex-shrink-0 border-t pt-4 mt-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">{t("action.previous")}</span>
                  </Button>
                  <span className="text-sm px-2">
                    {t("table.page")} {currentPage} {t("table.of")} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <span className="hidden sm:inline mr-1">{t("action.next")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Delete confirmation dialog */}
          {deletingCategoryId && (
            <Dialog open={true} onOpenChange={() => setDeletingCategoryId(null)}>
              <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
                <DialogHeader>
                  <DialogTitle>
                    {t("action.confirm")} {t("category.delete")}
                  </DialogTitle>
                  <DialogDescription>{t("category.deleteConfirm")}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDeletingCategoryId(null)} className="w-full sm:w-auto">
                    {t("action.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await handleDeleteCategory(deletingCategoryId)
                      setDeletingCategoryId(null)
                    }}
                    className="w-full sm:w-auto"
                  >
                    {t("action.delete")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </DialogContent>
      </Dialog>

      {/* Category Details Dialog - Continue with translations for the rest of the component */}
      <Dialog open={isCategoryDetailsOpen} onOpenChange={setIsCategoryDetailsOpen}>
        <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-4">
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="truncate">
                {selectedCategory?.name} {t("category.view")}
              </span>
              <Badge variant="secondary" className="w-fit">
                <Users className="h-3 w-3 mr-1" />
                {selectedCategory?._count.rooms || 0} {t("category.rooms")}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {t("category.view")} and manage all rooms in this category.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {isLoadingDetails ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : selectedCategory ? (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedCategory.rooms.length > 0 && (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h4 className="font-medium text-sm sm:text-base">Rooms in this category</h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setCategoryToDeleteAllRooms(selectedCategory)
                            setIsDeleteAllRoomsDialogOpen(true)
                          }}
                          disabled={isDeletingAllRooms}
                          className="w-full sm:w-auto"
                        >
                          {isDeletingAllRooms ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              {t("action.deleting")}
                            </>
                          ) : (
                            <>
                              <Trash className="mr-2 h-3 w-3" />
                              Delete All Rooms
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {selectedCategory.rooms.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">No rooms in this category yet.</div>
                    ) : (
                      <div className="space-y-2">
                        {currentRooms.map((room) => (
                          <div key={room.id} className="border rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <h5 className="font-medium text-sm sm:text-base">
                                    {t("rooms.title")} {room.roomNumber}
                                  </h5>
                                  <Badge variant="outline" className="w-fit text-xs">
                                    {formatPrice(room.price)}
                                  </Badge>
                                </div>
                                {room.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1 mb-1">
                                    {room.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {t("time.created")}: {new Date(room.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex justify-end sm:justify-start">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Room actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => setRoomToDelete({ id: room.id, roomNumber: room.roomNumber })}
                                      className="text-destructive"
                                      disabled={isDeletingRoom}
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      {t("rooms.delete")}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination for rooms */}
                {totalRoomsPages > 1 && (
                  <div className="flex-shrink-0 border-t pt-4 mt-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground order-2 sm:order-1">
                        {t("table.showing")} {indexOfFirstRoom + 1}-
                        {Math.min(indexOfLastRoom, selectedCategory.rooms.length)} {t("table.of")}{" "}
                        {selectedCategory.rooms.length} {t("category.rooms")}
                      </div>
                      <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRoomsCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={roomsCurrentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline ml-1">{t("action.previous")}</span>
                        </Button>
                        <span className="text-sm px-2">
                          {t("table.page")} {roomsCurrentPage} {t("table.of")} {totalRoomsPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRoomsCurrentPage((prev) => Math.min(prev + 1, totalRoomsPages))}
                          disabled={roomsCurrentPage === totalRoomsPages}
                        >
                          <span className="hidden sm:inline mr-1">{t("action.next")}</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete room confirmation dialog */}
      {roomToDelete && (
        <Dialog open={true} onOpenChange={() => setRoomToDelete(null)}>
          <DialogContent className="sm:max-w-[450px] max-w-[95vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                {t("rooms.delete")}
              </DialogTitle>
              <DialogDescription className="pt-2 space-y-2">
                <p>
                  Are you sure you want to delete {t("rooms.title")} <strong>{roomToDelete.roomNumber}</strong> from the{" "}
                  <strong>{selectedCategory?.name}</strong> category?
                </p>
                <Alert variant="destructive" className="py-2 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This action cannot be undone. All room data including images and pricing will be permanently
                    deleted.
                  </AlertDescription>
                </Alert>
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setRoomToDelete(null)} className="w-full sm:w-auto">
                {t("action.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteRoom(roomToDelete.id)}
                className="w-full sm:w-auto"
                disabled={isDeletingRoom}
              >
                {isDeletingRoom ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("action.deleting")}
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    {t("rooms.delete")}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete All Rooms Confirmation Dialog */}
      {isDeleteAllRoomsDialogOpen && categoryToDeleteAllRooms && (
        <Dialog
          open={true}
          onOpenChange={() => {
            if (!isDeletingAllRooms) {
              setIsDeleteAllRoomsDialogOpen(false)
              setCategoryToDeleteAllRooms(null)
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Delete All Rooms - Permanent Action
              </DialogTitle>
              <DialogDescription className="space-y-3 pt-2">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="font-medium text-destructive mb-2">⚠️ WARNING: This action cannot be undone!</p>
                  <p className="text-sm text-muted-foreground">
                    You are about to permanently delete{" "}
                    <strong>
                      ALL {categoryToDeleteAllRooms._count.rooms} {t("category.rooms")}
                    </strong>{" "}
                    in the "<strong>{categoryToDeleteAllRooms.name}</strong>" category.
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>What will happen:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>
                      All {categoryToDeleteAllRooms._count.rooms} {t("category.rooms")} will be permanently deleted
                    </li>
                    <li>All room data including images, descriptions, and pricing will be lost</li>
                    <li>This action cannot be reversed or undone</li>
                    <li>The category "{categoryToDeleteAllRooms.name}" will remain but will be empty</li>
                  </ul>
                </div>

                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Are you absolutely sure you want to continue?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consider deleting rooms individually if you only want to remove specific ones.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteAllRoomsDialogOpen(false)
                  setCategoryToDeleteAllRooms(null)
                }}
                className="w-full sm:w-auto"
                disabled={isDeletingAllRooms}
              >
                {t("action.cancel")} - Keep Rooms Safe
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteAllRooms(categoryToDeleteAllRooms.id)}
                className="w-full sm:w-auto"
                disabled={isDeletingAllRooms}
              >
                {isDeletingAllRooms ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting All Rooms...
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Yes, Delete All {categoryToDeleteAllRooms._count.rooms} {t("category.rooms")}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
