import React, { useState } from 'react';
import { Menu, Sun, Moon, Search, BarChart3 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { UserAvatarDropdown } from './UserAvatarDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { ClockInOutWidget } from './ClockInOutWidget';
import { GlobalStatsWidget } from '../dashboard/GlobalStatsWidget';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, userRole } = useAuth();
  const [isStatsWidgetOpen, setIsStatsWidgetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Welcome back, {user?.user_metadata?.full_name || userRole + ' User'}!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userRole} Panel - Let's make today productive
            </p>
          </div>
          
          {userRole !== 'customer' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStatsWidgetOpen(true)}
                className="p-2"
                title="View Global Statistics"
              >
                <BarChart3 size={20} />
              </Button>
              <ClockInOutWidget />
            </>
          )}
          
          <NotificationDropdown />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>

          <UserAvatarDropdown user={user} />
        </div>
        
        <GlobalStatsWidget
          isOpen={isStatsWidgetOpen}
          onClose={() => setIsStatsWidgetOpen(false)}
        />
      </div>
    </header>
  );
};