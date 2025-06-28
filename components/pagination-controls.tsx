"use client"

import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationControlsProps {
  totalItems: number
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

const ITEMS_PER_PAGE_KEY = "rooms-items-per-page"

export function PaginationControls({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Load saved items per page preference
  useEffect(() => {
    const savedItemsPerPage = localStorage.getItem(ITEMS_PER_PAGE_KEY)
    if (savedItemsPerPage) {
      onItemsPerPageChange(Number(savedItemsPerPage))
    }
  }, [onItemsPerPageChange])

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = Number(value)
    onItemsPerPageChange(newItemsPerPage)
    localStorage.setItem(ITEMS_PER_PAGE_KEY, value)
    onPageChange(1) // Reset to first page when changing items per page
  }

  const goToFirstPage = () => onPageChange(1)
  const goToLastPage = () => onPageChange(totalPages)
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))

  if (totalItems === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Show</span>
        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span>
          of {totalItems} rooms ({startItem}-{endItem})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToFirstPage} disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToPreviousPage} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <Button variant="outline" size="icon" onClick={goToNextPage} disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToLastPage} disabled={currentPage === totalPages}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
