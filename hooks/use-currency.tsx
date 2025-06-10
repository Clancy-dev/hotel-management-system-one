"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type CurrencyCode =
  | "UGX"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CNY"
  | "ZAR"
  | "NGN"
  | "EGP"
  | "KES"
  | "TZS"
  | "GHS"
  | "MAD"
  | "DZD"
  | "INR"
  | "KRW"
  | "THB"
  | "SGD"
  | "HKD"
  | "ILS"
  | "CHF"
  | "SEK"
  | "NOK"
  | "PLN"
  | "RUB"
  | "AUD"
  | "CAD"
  | "BRL"
  | "MXN"
  | "TRY"

interface Currency {
  code: CurrencyCode
  name: string
  symbol: string
  region: string
  exchangeRate: number // Rate relative to UGX
}

interface CurrencyContextType {
  currency: Currency
  setCurrency: (code: CurrencyCode) => void
  formatPrice: (amount: number) => string
  availableCurrencies: Currency[]
}

const currencies: Record<CurrencyCode, Currency> = {
  UGX: { code: "UGX", name: "Ugandan Shilling", symbol: "USh", region: "Africa", exchangeRate: 1 },
  USD: { code: "USD", name: "US Dollar", symbol: "$", region: "North America", exchangeRate: 0.00027 },
  EUR: { code: "EUR", name: "Euro", symbol: "€", region: "Europe", exchangeRate: 0.00025 },
  GBP: { code: "GBP", name: "British Pound", symbol: "£", region: "Europe", exchangeRate: 0.00021 },
  JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", region: "Asia", exchangeRate: 0.041 },
  CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", region: "Asia", exchangeRate: 0.0019 },

  ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", region: "Africa", exchangeRate: 0.0051 },
  NGN: { code: "NGN", name: "Nigerian Naira", symbol: "₦", region: "Africa", exchangeRate: 0.13 },
  EGP: { code: "EGP", name: "Egyptian Pound", symbol: "E£", region: "Africa", exchangeRate: 0.0083 },
  KES: { code: "KES", name: "Kenyan Shilling", symbol: "KSh", region: "Africa", exchangeRate: 0.035 },
  TZS: { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", region: "Africa", exchangeRate: 0.68 },
  GHS: { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", region: "Africa", exchangeRate: 0.0034 },
  MAD: { code: "MAD", name: "Moroccan Dirham", symbol: "MAD", region: "Africa", exchangeRate: 0.0027 },
  DZD: { code: "DZD", name: "Algerian Dinar", symbol: "DA", region: "Africa", exchangeRate: 0.036 },

  INR: { code: "INR", name: "Indian Rupee", symbol: "₹", region: "Asia", exchangeRate: 0.022 },
  KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", region: "Asia", exchangeRate: 0.36 },
  THB: { code: "THB", name: "Thai Baht", symbol: "฿", region: "Asia", exchangeRate: 0.0096 },
  SGD: { code: "SGD", name: "Singapore Dollar", symbol: "S$", region: "Asia", exchangeRate: 0.00036 },
  HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", region: "Asia", exchangeRate: 0.0021 },
  ILS: { code: "ILS", name: "Israeli Shekel", symbol: "₪", region: "Asia", exchangeRate: 0.00099 },

  CHF: { code: "CHF", name: "Swiss Franc", symbol: "Fr", region: "Europe", exchangeRate: 0.00024 },
  SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr", region: "Europe", exchangeRate: 0.0028 },
  NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr", region: "Europe", exchangeRate: 0.0029 },
  PLN: { code: "PLN", name: "Polish Zloty", symbol: "zł", region: "Europe", exchangeRate: 0.0011 },
  RUB: { code: "RUB", name: "Russian Ruble", symbol: "₽", region: "Europe", exchangeRate: 0.025 },

  AUD: { code: "AUD", name: "Australian Dollar", symbol: "A$", region: "Oceania", exchangeRate: 0.00041 },
  CAD: { code: "CAD", name: "Canadian Dollar", symbol: "C$", region: "North America", exchangeRate: 0.00037 },
  BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", region: "South America", exchangeRate: 0.0014 },
  MXN: { code: "MXN", name: "Mexican Peso", symbol: "Mex$", region: "North America", exchangeRate: 0.0046 },
  TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", region: "Europe/Asia", exchangeRate: 0.0087 },
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(currencies.UGX)

  useEffect(() => {
    // Load saved currency from localStorage on component mount
    const savedCurrency = localStorage.getItem("preferredCurrency") as CurrencyCode | null
    if (savedCurrency && currencies[savedCurrency]) {
      setCurrentCurrency(currencies[savedCurrency])
    }
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    if (currencies[code]) {
      setCurrentCurrency(currencies[code])
      localStorage.setItem("preferredCurrency", code)
    }
  }

  const formatPrice = (amount: number) => {
    // Convert from UGX to the selected currency
    const convertedAmount = amount * currentCurrency.exchangeRate

    // Format the number based on the currency
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currentCurrency.code,
      minimumFractionDigits: currentCurrency.code === "JPY" || currentCurrency.code === "KRW" ? 0 : 2,
      maximumFractionDigits: currentCurrency.code === "JPY" || currentCurrency.code === "KRW" ? 0 : 2,
    }).format(convertedAmount)
  }

  // Group currencies by region for the settings page
  const availableCurrencies = Object.values(currencies)

  return (
    <CurrencyContext.Provider
      value={{
        currency: currentCurrency,
        setCurrency,
        formatPrice,
        availableCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
