"use client"

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void
  onClose: () => void
  isDarkMode: boolean
  mode?: "reaction" | "input"
}

export default function EmojiPicker({ onSelectEmoji, onClose, isDarkMode, mode = "reaction" }: EmojiPickerProps) {
  const emojis = [
    "👍",
    "👎",
    "❤️",
    "😂",
    "😮",
    "😢",
    "😡",
    "🔥",
    "👏",
    "🎉",
    "💯",
    "😍",
    "🤔",
    "🌍", // Replaced 😴 with 🌍
    "🙄",
    "🚀",
    "💎",
    "📈",
    "💰",
    "⚡",
  ]

  const handleEmojiClick = (emoji: string) => {
    if (mode === "input") {
      // Insert emoji into input
      if ((window as any).insertEmojiToInput) {
        ;(window as any).insertEmojiToInput(emoji)
      }
      onClose()
    } else {
      // React to message
      onSelectEmoji(emoji)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className={`w-full max-w-md mx-4 mb-4 p-4 rounded-2xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } transform transition-all duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-5 gap-3">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className={`p-3 text-2xl rounded-xl ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } transition-colors duration-200`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
