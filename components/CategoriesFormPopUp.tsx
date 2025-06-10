"use client"
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { AlertCircle, ChevronLeft, ChevronRight, Edit, Loader2, Plus, Trash } from 'lucide-react'
import { Button } from './ui/button'
import { createCategory, deleteCategory, getCategories, updateCategory } from '@/actions/category'
import { Alert, AlertDescription } from './ui/alert'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useToast } from '@/hooks/use-toast'
import { RoomCategory } from '@prisma/client'

export type RoomCategoryProps = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

type CategoriesFormPopUpProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCategories?: RoomCategory[]
  onCategoriesChanged?: () => void
}

export default function CategoriesFormPopUp({open,onOpenChange,initialCategories=[],onCategoriesChanged}: CategoriesFormPopUpProps) {
    const [categories, setCategories] = useState<RoomCategory[]>(initialCategories)
      const [newCategoryName, setNewCategoryName] = useState("")
      const [customCategoryName, setCustomCategoryName] = useState("")
      const [isCustomCategory, setIsCustomCategory] = useState(false)
      const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
      const [currentPage, setCurrentPage] = useState(1)
      const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null)
      const [error, setError] = useState<string | null>(null)
      const [editError, setEditError] = useState<string | null>(null)
      const [isSubmitting, setIsSubmitting] = useState(false)
      const [isDeleting, setIsDeleting] = useState(false)
      const [isEditing, setIsEditing] = useState(false)
      const { toast } = useToast()
      const categoriesPerPage = 5
    
      // Predefined category options
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
        { value: "custom", label: "Custom Category..." },
      ]
    
      useEffect(() => {
        if (open) {
          fetchCategories()
          setCurrentPage(1)
          setError(null)
          setEditError(null)
        }
      }, [open])
    
      const fetchCategories = async () => {
        try {
          const result = await getCategories()
          if (result.success) {
            setCategories(result.data ?? [])
          } else {
            toast({
              title: "Error",
              description: result.error || "Failed to fetch categories",
              variant: "destructive",
            })
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "An unexpected error occurred",
            variant: "destructive",
          })
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
          setError("Please enter a category name")
          return
        }
    
        setIsSubmitting(true)
    
        try {
          const result = await createCategory({ name: categoryName })
    
          if (result.success) {
            if (result.data) {
              setCategories([...categories, result.data])
            }
            setNewCategoryName("")
            setCustomCategoryName("")
            setIsCustomCategory(false)
            toast({
              title: "Category added",
              description: "The category has been successfully added",
            })
            if (onCategoriesChanged) {
              onCategoriesChanged()
            }
          } else {
            setError(result.error || "Failed to add category")
          }
        } catch (error) {
          setError("An unexpected error occurred")
        } finally {
          setIsSubmitting(false)
        }
      }
    
      const handleDeleteCategory = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
          setIsDeleting(true)
          try {
            const result = await deleteCategory(id)
    
            if (result.success) {
              setCategories(categories.filter((category) => category.id !== id))
              toast({
                title: "Category deleted",
                description: "The category has been successfully deleted",
              })
              if (onCategoriesChanged) {
                onCategoriesChanged()
              }
            } else {
              toast({
                title: "Error",
                description: result.error || "Failed to delete category",
                variant: "destructive",
              })
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "An unexpected error occurred",
              variant: "destructive",
            })
          } finally {
            setIsDeleting(false)
          }
        }
      }
    
      const handleEditCategory = (category: RoomCategory) => {
        setEditingCategory(category)
        setCustomCategoryName(category.name)
        setEditError(null)
      }
    
      const handleUpdateCategory = async () => {
        setEditError(null)
    
        if (!editingCategory || !customCategoryName.trim()) {
          setEditError("Please enter a category name")
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
            setCategories(categories.map((cat) => (cat.id === result.data.id ? result.data : cat)))
            setEditingCategory(null)
            setCustomCategoryName("")
            toast({
              title: "Category updated",
              description: "The category has been successfully updated",
            })
            if (onCategoriesChanged) {
              onCategoriesChanged()
            }
          } else {
            setEditError(result.error || "Failed to update category")
          }
        } catch (error) {
          setEditError("An unexpected error occurred")
        } finally {
          setIsEditing(false)
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
    
      // Pagination logic
      const indexOfLastCategory = currentPage * categoriesPerPage
      const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage
      const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory)
      const totalPages = Math.ceil(categories.length / categoriesPerPage)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[500px] max-w-[90vw] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Manage Room Categories</DialogTitle>
              <DialogDescription>Add or remove room categories for your hotel.</DialogDescription>
            </DialogHeader>
    
            <div className="space-y-4 py-4 overflow-y-auto pr-1">
              <form onSubmit={handleAddCategory} className="grid gap-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
    
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <Label htmlFor="categoryName" className="sm:text-right">
                    Category Name
                  </Label>
                  <div className="sm:col-span-3">
                    {!isCustomCategory ? (
                      <div className="relative">
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                          disabled={isSubmitting}
                        >
                          <span>
                            {newCategoryName
                              ? categoryOptions.find((opt) => opt.value === newCategoryName)?.label
                              : "Select a category type"}
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
                            className={`h-4 w-4 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
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
                                  {option.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={customCategoryName}
                          onChange={(e) => setCustomCategoryName(e.target.value)}
                          placeholder="Enter custom category name"
                          className="flex-1"
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCustomCategory(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" className="ml-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </>
                  )}
                </Button>
              </form>
    
              <div className="border-t pt-4">
                <h3 className="mb-2 font-medium">Existing Categories</h3>
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories added yet.</p>
                ) : (
                  <>
                    <div className="space-y-2 min-h-[200px] max-h-[250px] overflow-y-auto pr-1">
                      {currentCategories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between rounded-md border p-3">
                          {editingCategory?.id === category.id ? (
                            <div className="flex flex-1 flex-col sm:flex-row items-center gap-2">
                              <div className="w-full">
                                {editError && (
                                  <Alert variant="destructive" className="mb-2 py-2 text-sm">
                                    <AlertCircle className="h-3 w-3" />
                                    <AlertDescription className="text-xs">{editError}</AlertDescription>
                                  </Alert>
                                )}
                                <Input
                                  value={customCategoryName}
                                  onChange={(e) => setCustomCategoryName(e.target.value)}
                                  className="flex-1"
                                  disabled={isEditing}
                                />
                              </div>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  size="sm"
                                  onClick={handleUpdateCategory}
                                  className="flex-1 sm:flex-none"
                                  disabled={isEditing}
                                >
                                  {isEditing ? (
                                    <>
                                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save"
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
                                  className="flex-1 sm:flex-none"
                                  disabled={isEditing}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="font-medium">{category.name}</p>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditCategory(category)}
                                  disabled={isDeleting}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit category</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCategory(category.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <Loader2 className="h-4 w-4 text-destructive animate-spin" />
                                  ) : (
                                    <Trash className="h-4 w-4 text-destructive" />
                                  )}
                                  <span className="sr-only">Delete category</span>
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
  )
}
