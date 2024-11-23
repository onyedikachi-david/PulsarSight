import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyToClipboardProps {
  content: string
  displayText?: string
  className?: string
}

export function CopyToClipboard({
  content,
  displayText,
  className = ''
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`group relative inline-flex items-center ${className}`}>
      <span className="font-mono">{displayText || content}</span>
      <button
        onClick={handleCopy}
        className="ml-2 p-1 text-gray-400 opacity-0 transition-colors
                 duration-200 hover:text-gray-600 group-hover:opacity-100 dark:hover:text-gray-300"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="size-4 text-green-500" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
      <div
        className={`
        absolute -top-8 left-1/2 -translate-x-1/2 rounded
        bg-gray-900 px-2 py-1 text-xs text-white transition-opacity duration-200
        dark:bg-gray-700
        ${copied ? 'opacity-100' : 'pointer-events-none opacity-0'}
      `}
      >
        Copied!
      </div>
    </div>
  )
}
