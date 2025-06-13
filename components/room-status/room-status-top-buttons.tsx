"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Settings, History } from "lucide-react"
import { CreateStatusDialog } from "./create-status-dialog"
import { ManageStatusesDialog } from "./manage-statuses-dialog"
import { useRouter } from "next/navigation"

interface RoomStatus {
  id: string
  name: string
  color: string
  description?: string
  isDefault: boolean
}

interface RoomStatusTopButtonsProps {
  statuses: RoomStatus[]
}

export function RoomStatusTopButtons({ statuses }: RoomStatusTopButtonsProps) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Create Status
      </Button>
      <Button variant="outline" onClick={() => setIsManageOpen(true)} className="w-full sm:w-auto">
        <Settings className="h-4 w-4 mr-2" />
        Manage Statuses
      </Button>
      <Button variant="outline" onClick={() => router.push("/room-status/history")} className="w-full sm:w-auto">
        <History className="h-4 w-4 mr-2" />
        Status History
      </Button>

      <CreateStatusDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} existingStatuses={statuses} />

      <ManageStatusesDialog open={isManageOpen} onOpenChange={setIsManageOpen} statuses={statuses} />
    </div>
  )
}
