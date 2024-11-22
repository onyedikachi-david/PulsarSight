import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Blocks, FileText, Activity, Users, Database, Search } from 'lucide-react';
import NavItem from './ui/NavItem';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative lg:translate-x-0`}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
          PulsarSight
        </Link>
      </div>
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          <NavItem
            to="/"
            icon={<Home className="h-5 w-5" />}
            text="Dashboard"
            isActive={location.pathname === '/'}
          />
          <NavItem
            to="/search"
            icon={<Search className="h-5 w-5" />}
            text="Search"
            isActive={location.pathname === '/search'}
          />
          <NavItem
            to="/blocks"
            icon={<Blocks className="h-5 w-5" />}
            text="Blocks"
            isActive={location.pathname === '/blocks'}
          />
          <NavItem
            to="/transactions"
            icon={<Activity className="h-5 w-5" />}
            text="Transactions"
            isActive={location.pathname === '/transactions'}
          />
          <NavItem
            to="/validators"
            icon={<Users className="h-5 w-5" />}
            text="Validators"
            isActive={location.pathname === '/validators'}
          />
          <NavItem
            to="/tokens"
            icon={<Database className="h-5 w-5" />}
            text="Tokens"
            isActive={location.pathname === '/tokens'}
          />
          <NavItem
            to="/contracts"
            icon={<FileText className="h-5 w-5" />}
            text="Contracts"
            isActive={location.pathname === '/contracts'}
          />
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;