import {
  LayoutDashboard,
  Blocks,
  ArrowLeftRight,
  Shield,
  FileText,
  Activity,
  Settings,
  BarChart3,
  ExternalLink,
  HelpCircle
} from 'lucide-react'
import { IconType } from '../types/common'

export interface NavigationItem {
  name: string
  icon: IconType
  href: string
  external?: boolean
  description?: string
}

export const mainNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
    description: 'Overview of network activity'
  },
  {
    name: 'Blocks',
    icon: Blocks,
    href: '/blocks',
    description: 'Explore blockchain blocks'
  },
  {
    name: 'Transactions',
    icon: ArrowLeftRight,
    href: '/transactions',
    description: 'View transaction history'
  },
  {
    name: 'Validators',
    icon: Shield,
    href: '/validators',
    description: 'Network validators status'
  },
  {
    name: 'Proposals',
    icon: FileText,
    href: '/proposals',
    description: 'Governance proposals'
  },
  {
    name: 'Live Data',
    icon: Activity,
    href: '/live',
    description: 'Real-time network metrics'
  },
  {
    name: 'Parameters',
    icon: Settings,
    href: '/parameters',
    description: 'Network parameters'
  },
  {
    name: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    description: 'Network analytics and charts'
  }
]

export const bottomNavigation: NavigationItem[] = [
  {
    name: 'Settings',
    icon: Settings,
    href: '/settings',
    description: 'Application settings'
  },
  {
    name: 'Help',
    icon: HelpCircle,
    href: '/help',
    description: 'Get help and support'
  },
  {
    name: 'Documentation',
    icon: ExternalLink,
    href: 'https://docs.pulsarsight.xyz',
    external: true,
    description: 'View documentation'
  }
]
