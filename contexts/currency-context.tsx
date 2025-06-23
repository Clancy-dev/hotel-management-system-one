"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Currency {
  code: string
  symbol: string
  name: string
}

export const currencies: Currency[] = [
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "CHF", symbol: "Fr.", name: "Swiss Franc" },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
  { code: "BHD", symbol: "د.ب", name: "Bahraini Dinar" },
  { code: "OMR", symbol: "﷼", name: "Omani Rial" },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar" },
  { code: "UGX", symbol: "USh", name: "Uganda Shilling" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
]

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(currencies[8]) // Default to Uganda Shilling

  useEffect(() => {
    // Load currency from localStorage on mount
    const savedCurrency = localStorage.getItem("hotel-currency")
    if (savedCurrency) {
      try {
        const parsed = JSON.parse(savedCurrency)
        const found = currencies.find((c) => c.code === parsed.code)
        if (found) {
          setCurrencyState(found)
        }
      } catch (error) {
        console.error("Error loading currency from localStorage:", error)
      }
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem("hotel-currency", JSON.stringify(newCurrency))
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent("currencyChanged", { detail: newCurrency }))
  }

  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toLocaleString()}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>{children}</CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
