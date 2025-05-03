import React from 'react';
import { cn } from '@/lib/utils';
// Import necessary icons and components
import { Button } from '@/presentation/atoms';
import { Home, Users, Brain, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  className?: string;
}

/**
 * Sidebar Organism
 *
 * Provides primary navigation for the application.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, className = '' }) => {
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Brain Models', href: '/brain-models', icon: Brain },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={cn(
        'bg-background-card text-foreground transition-all duration-300 ease-in-out',
        isOpen ? 'w-64 p-4' : 'w-16 p-2',
        className
      )}
    >
      <nav className="flex flex-col h-full">
        {/* Logo/Branding (optional) */}
        <div className={cn('mb-6 flex items-center', isOpen ? 'justify-start' : 'justify-center')}>
          <div className={cn('h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary', isOpen ? 'mr-2' : '')}></div>
          {isOpen && <span className="font-bold text-lg">ClarityAI</span>}
        </div>

        {/* Navigation Links */}
        <ul className="flex-grow space-y-2">
          {navigationItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    !isOpen && 'justify-center'
                  )
                }
                end // Match exact path for root
              >
                <item.icon className={cn('h-5 w-5', isOpen ? 'mr-3' : '')} />
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="mt-auto">
          <Button variant="ghost" className={cn('w-full flex items-center text-muted-foreground hover:bg-muted hover:text-foreground', !isOpen && 'justify-center')}>
            <LogOut className={cn('h-5 w-5', isOpen ? 'mr-3' : '')} />
            {isOpen && <span>Logout</span>}
          </Button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar; 