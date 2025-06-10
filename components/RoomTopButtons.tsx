"use client"
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import CategoriesFormPopUp from './CategoriesFormPopUp'
import { getCategories } from '@/actions/category'
import { AddRoomDialog } from './rooms/add-room-dialog'

export default function RoomTopButtons() {
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
     const [CategoriesFormPopUpOpen, setCategoriesFormPopUpOpen] = useState(false)
     const [roomCategories, setRoomCategories] = useState<{ name: string; id: string; createdAt: Date; updatedAt: Date; }[]>([])
     const [isLoading, setIsLoading] = useState(false)

      const fetchCategories = async () => {
         setIsLoading(true)
         try {
           const result = await getCategories()
           if (result.success) {
             setRoomCategories(result.data ?? [])
           }
         } catch (error) {
           console.error("Failed to fetch categories:", error)
           return Error 
         } finally {
           setIsLoading(false)
        
         }
       }
       useEffect(() => {
           fetchCategories()
         }, [])

         const handleCategoriesChanged = () => {
    fetchCategories()
            }
  return (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline"  onClick={() => setCategoriesFormPopUpOpen(true)} className="w-full sm:w-auto">
              Manage Categories
            </Button>
            <Button className="w-full sm:w-auto" 
            onClick={() => setIsAddRoomOpen(true)}
             disabled={isLoading || roomCategories.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
            <AddRoomDialog
                    open={isAddRoomOpen}
                    onOpenChange={setIsAddRoomOpen}
                    roomCategories={roomCategories}
                    onRoomAdded={() => window.location.reload()}
                />
            <CategoriesFormPopUp
                open={CategoriesFormPopUpOpen}
                onOpenChange={setCategoriesFormPopUpOpen}
                initialCategories={roomCategories}
                onCategoriesChanged={handleCategoriesChanged}
            />
          </div>       
  )
}
