"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface PaginationContextType {
  itemsPerPage: number
  setItemsPerPage: (items: number) => void
}

const PaginationContext = createContext<PaginationContextType | undefined>(undefined)

export function PaginationProvider({ children }: { children: React.ReactNode }) {
  const [itemsPerPage, setItemsPerPageState] = useState<number>(10)

  useEffect(() => {
    const savedItemsPerPage = localStorage.getItem("hotel-items-per-page")
    if (savedItemsPerPage) {
      setItemsPerPageState(Number.parseInt(savedItemsPerPage, 10))
    }
  }, [])

  const setItemsPerPage = (items: number) => {
    setItemsPerPageState(items)
    localStorage.setItem("hotel-items-per-page", items.toString())
  }

  return <PaginationContext.Provider value={{ itemsPerPage, setItemsPerPage }}>{children}</PaginationContext.Provider>
}

export function usePagination() {
  const context = useContext(PaginationContext)
  if (context === undefined) {
    throw new Error("usePagination must be used within a PaginationProvider")
  }
  return context
}
