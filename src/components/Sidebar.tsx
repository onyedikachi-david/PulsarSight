import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Blocks,
  FileText,
  Activity,
  Users,
  Database,
  Search
} from 'lucide-react'
import NavItem from './ui/NavItem'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transition-transform duration-300 ease-in-out dark:bg-gray-800${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <Link
          to="/"
          className="text-xl font-bold text-gray-800 dark:text-white"
        >
          PulsarSight
        </Link>
      </div>
      <nav className="mt-8">
        <div className="space-y-2 px-4">
          <NavItem
            to="/"
            icon={<Home className="size-5" />}
            text="Dashboard"
            isActive={location.pathname === '/'}
          />
          <NavItem
            to="/search"
            icon={<Search className="size-5" />}
            text="Search"
            isActive={location.pathname === '/search'}
          />
          <NavItem
            to="/blocks"
            icon={<Blocks className="size-5" />}
            text="Blocks"
            isActive={location.pathname === '/blocks'}
          />
          <NavItem
            to="/transactions"
            icon={<Activity className="size-5" />}
            text="Transactions"
            isActive={location.pathname === '/transactions'}
          />
          <NavItem
            to="/validators"
            icon={<Users className="size-5" />}
            text="Validators"
            isActive={location.pathname === '/validators'}
          />
          <NavItem
            to="/tokens"
            icon={<Database className="size-5" />}
            text="Tokens"
            isActive={location.pathname === '/tokens'}
          />
          <NavItem
            to="/contracts"
            icon={<FileText className="size-5" />}
            text="Contracts"
            isActive={location.pathname === '/contracts'}
          />
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
