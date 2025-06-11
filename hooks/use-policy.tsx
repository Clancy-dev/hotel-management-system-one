"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type PolicyType = "standard" | "custom" | "mixed"

export interface LateCheckOutRate {
  id: string
  startTime: string
  endTime: string
  charge: number
  description?: string
}

export interface EarlyCheckInRate {
  id: string
  startTime: string
  endTime: string
  charge: number
  description?: string
}

export interface StandardPolicyData {
  basePrice: number
  checkInStart: string
  checkInEnd: string
  checkOutStart: string
  checkOutEnd: string
  nightStart: string
  nightEnd: string
  lateCheckOutRates: LateCheckOutRate[]
  earlyCheckInRates: EarlyCheckInRate[]
}

export interface OvertimeRate {
  id: string
  afterHours: number
  upToHours?: number
  charge: number
  description?: string
}

export interface CustomPolicyData {
  baseHours: number
  pricePerHour: number
  overtimeRates: OvertimeRate[]
  earlyCheckOutRate?: number
}

export interface MixedPolicyData {
  standardPolicy: StandardPolicyData
  customPolicy: CustomPolicyData
  defaultMode: "standard" | "custom"
}

export interface PolicySettings {
  type: PolicyType
  standardPolicy: StandardPolicyData
  customPolicy: CustomPolicyData
  mixedPolicy: MixedPolicyData
}

interface PolicyContextType {
  policySettings: PolicySettings
  setPolicyType: (type: PolicyType) => void
  updateStandardPolicy: (policy: Partial<StandardPolicyData>) => void
  updateCustomPolicy: (policy: Partial<CustomPolicyData>) => void
  updateMixedPolicy: (policy: Partial<MixedPolicyData>) => void
  resetToDefaults: () => void
}

const defaultStandardPolicy: StandardPolicyData = {
  basePrice: 0,
  checkInStart: "12:00",
  checkInEnd: "14:00",
  checkOutStart: "10:00",
  checkOutEnd: "11:00",
  nightStart: "12:00",
  nightEnd: "10:00",
  lateCheckOutRates: [
    {
      id: "1",
      startTime: "11:00",
      endTime: "16:00",
      charge: 0,
      description: "Late checkout fee",
    },
  ],
  earlyCheckInRates: [
    {
      id: "1",
      startTime: "08:00",
      endTime: "12:00",
      charge: 0,
      description: "Early check-in fee",
    },
  ],
}

const defaultCustomPolicy: CustomPolicyData = {
  baseHours: 3,
  pricePerHour: 0,
  overtimeRates: [
    {
      id: "1",
      afterHours: 3,
      upToHours: 6,
      charge: 0,
      description: "Overtime rate",
    },
  ],
  earlyCheckOutRate: 0,
}

const defaultMixedPolicy: MixedPolicyData = {
  standardPolicy: defaultStandardPolicy,
  customPolicy: defaultCustomPolicy,
  defaultMode: "standard",
}

const defaultPolicySettings: PolicySettings = {
  type: "standard",
  standardPolicy: defaultStandardPolicy,
  customPolicy: defaultCustomPolicy,
  mixedPolicy: defaultMixedPolicy,
}

const PolicyContext = createContext<PolicyContextType | undefined>(undefined)

export function PolicyProvider({ children }: { children: ReactNode }) {
  const [policySettings, setPolicySettings] = useState<PolicySettings>(defaultPolicySettings)

  useEffect(() => {
    // Load saved policy settings from localStorage on component mount
    const savedSettings = localStorage.getItem("policySettings")
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setPolicySettings({ ...defaultPolicySettings, ...parsedSettings })
      } catch (error) {
        console.error("Error loading saved policy settings:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Save policy settings to localStorage when they change
    localStorage.setItem("policySettings", JSON.stringify(policySettings))
  }, [policySettings])

  const setPolicyType = (type: PolicyType) => {
    setPolicySettings((prev) => ({ ...prev, type }))
  }

  const updateStandardPolicy = (policy: Partial<StandardPolicyData>) => {
    setPolicySettings((prev) => ({
      ...prev,
      standardPolicy: { ...prev.standardPolicy, ...policy },
    }))
  }

  const updateCustomPolicy = (policy: Partial<CustomPolicyData>) => {
    setPolicySettings((prev) => ({
      ...prev,
      customPolicy: { ...prev.customPolicy, ...policy },
    }))
  }

  const updateMixedPolicy = (policy: Partial<MixedPolicyData>) => {
    setPolicySettings((prev) => ({
      ...prev,
      mixedPolicy: { ...prev.mixedPolicy, ...policy },
    }))
  }

  const resetToDefaults = () => {
    setPolicySettings(defaultPolicySettings)
    localStorage.removeItem("policySettings")
  }

  return (
    <PolicyContext.Provider
      value={{
        policySettings,
        setPolicyType,
        updateStandardPolicy,
        updateCustomPolicy,
        updateMixedPolicy,
        resetToDefaults,
      }}
    >
      {children}
    </PolicyContext.Provider>
  )
}

export function usePolicy() {
  const context = useContext(PolicyContext)
  if (context === undefined) {
    throw new Error("usePolicy must be used within a PolicyProvider")
  }
  return context
}
