"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnnouncementBannerProps {
  onClose: () => void
}

export default function AnnouncementBanner({ onClose }: AnnouncementBannerProps) {
  return (
    <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium">
          🎉 New feature: Emoji reactions are now live! React to messages with your favorite emojis.
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose} className="p-1 hover:bg-blue-700 text-white">
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
