import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  text: string
  isActive?: boolean
  onClick?: () => void
}

const NavItem = ({
  to,
  icon,
  text,
  isActive = false,
  onClick
}: NavItemProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50',
        isActive
          ? 'bg-gray-50 text-red-600 dark:bg-gray-800 dark:text-red-400'
          : 'text-gray-700 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
      )}
    >
      <span
        className={cn(
          'mr-3',
          isActive
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-400 group-hover:text-red-600 dark:text-gray-600 dark:group-hover:text-red-400'
        )}
      >
        {icon}
      </span>
      {text}
    </Link>
  )
}

export default NavItem
