"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, ImageOff } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageGallery({ images, open, onOpenChange }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  // Reset zoom and position when changing images or opening/closing the gallery
  useEffect(() => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }, [currentIndex, open])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setPosition((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevious()
    } else if (e.key === "ArrowRight") {
      handleNext()
    } else if (e.key === "Escape") {
      onOpenChange(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[90vw] max-w-[95vw] p-0 overflow-hidden bg-black/90 max-h-[90vh]"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div
          className="relative h-[300px] sm:h-[80vh] flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? "grabbing" : zoomLevel > 1 ? "grab" : "default" }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-black/20 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-white">
              <ImageOff className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg">No images available for this room</p>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 text-white hover:bg-black/20 z-10 h-8 w-8 sm:h-12 sm:w-12"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>

              <div className="relative overflow-hidden h-full w-full flex items-center justify-center">
                <img
                  ref={imageRef}
                  src={images[currentIndex] || "/placeholder.svg"}
                  alt={`Room image ${currentIndex + 1}`}
                  className="max-h-full max-w-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                  }}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 text-white hover:bg-black/20 z-10 h-8 w-8 sm:h-12 sm:w-12"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>

              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>

              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-black/20 h-8 w-8"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 1}
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-black/20 h-8 w-8"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-4 text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
