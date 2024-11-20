import React from 'react';
import { 
  LayoutDashboard, 
  Blocks, 
  ArrowLeftRight, 
  Shield, 
  FileText, 
  Activity,
  Settings,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Blocks', icon: Blocks },
  { name: 'Transactions', icon: ArrowLeftRight },
  { name: 'Validators', icon: Shield },
  { name: 'Proposals', icon: FileText },
  { name: 'Live Data', icon: Activity },
  { name: 'Parameters', icon: Settings },
  { name: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const [active, setActive] = React.useState('Dashboard');

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navigation.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => setActive(name)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm ${
              active === name
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}