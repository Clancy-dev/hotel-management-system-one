import RoomTopButtons from '@/components/RoomTopButtons'
import React from 'react'

export default function page() {
  return (
     <div className="space-y-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rooms</h1>
              <p className="text-muted-foreground">Manage your hotel rooms and their categories</p>
            </div>
         <RoomTopButtons/>
          </div>
    
        
        </div>
  )
}
