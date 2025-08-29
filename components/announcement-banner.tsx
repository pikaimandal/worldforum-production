"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Announcement {
  id: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  priority: 'low' | 'normal' | 'high'
  isDismissible: boolean
  styling?: {
    backgroundColor: string
    textColor: string
    iconEmoji?: string
  }
}

interface AnnouncementBannerProps {
  announcement?: Announcement
  onClose: () => void
  isDarkMode?: boolean
}

export default function AnnouncementBanner({ announcement, onClose, isDarkMode = false }: AnnouncementBannerProps) {
  // Default announcement for backwards compatibility
  const defaultAnnouncement: Announcement = {
    id: 'default',
    content: '🎉 New feature: Emoji reactions are now live! React to messages with your favorite emojis.',
    type: 'info',
    priority: 'normal',
    isDismissible: true,
    styling: {
      backgroundColor: '#3B82F6', // blue-600
      textColor: '#FFFFFF'
    }
  }

  const activeAnnouncement = announcement || defaultAnnouncement

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-600 text-white'
      case 'error':
        return 'bg-red-600 text-white'
      case 'success':
        return 'bg-green-600 text-white'
      default:
        return 'bg-blue-600 text-white'
    }
  }

  const bannerStyles = activeAnnouncement.styling 
    ? {
        backgroundColor: activeAnnouncement.styling.backgroundColor,
        color: activeAnnouncement.styling.textColor
      }
    : {}

  return (
    <div 
      className={`px-4 py-3 flex items-center justify-between ${
        activeAnnouncement.styling ? '' : getTypeStyles(activeAnnouncement.type)
      }`}
      style={activeAnnouncement.styling ? bannerStyles : {}}
    >
      <div className="flex-1">
        <p className="text-sm font-medium">
          {activeAnnouncement.styling?.iconEmoji && `${activeAnnouncement.styling.iconEmoji} `}
          {activeAnnouncement.content}
        </p>
      </div>
      {activeAnnouncement.isDismissible && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className={`p-1 text-current hover:opacity-70`}
          style={{ color: 'inherit' }}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
