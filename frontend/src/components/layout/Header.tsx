import { Menu, Moon, Sun, Monitor, LogOut, User, Settings, RotateCcw, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { THEMES } from '../../utils/constants';
import { useState, useEffect } from 'react';
import { useVersion } from '../../hooks/useVersion';
import UpdateModal from '../version/UpdateModal';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { currentVersion, isCheckingUpdate, updateInfo, forceCheckUpdates } = useVersion();
  
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const getThemeIcon = () => {
    switch (theme) {
      case THEMES.LIGHT:
        return <Sun className="h-4 w-4" />;
      case THEMES.DARK:
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getUserInitials = (username: string | undefined) => {
    if (!username) return 'U';
    return username.slice(0, 2).toUpperCase();
  };

  // Auto-show modal when update is detected
  useEffect(() => {
    if (updateInfo?.hasUpdate && !showUpdateModal) {
      setShowUpdateModal(true);
    }
  }, [updateInfo?.hasUpdate, showUpdateModal]);

  const handleCheckUpdates = async () => {
    try {
      await forceCheckUpdates();
      // Check if update is available after force check
      if (updateInfo?.hasUpdate) {
        setShowUpdateModal(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-2"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page title will be added here */}
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white lg:hidden">
              Heimdallr
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Version info */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  v{currentVersion}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Version Information</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  Current: v{currentVersion}
                </DropdownMenuItem>
                {updateInfo && updateInfo.hasUpdate && (
                  <DropdownMenuItem disabled className="text-green-600">
                    Latest: v{updateInfo.latest}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleCheckUpdates}
                  disabled={isCheckingUpdate}
                >
                  <RotateCcw className={`mr-2 h-4 w-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                  Check for Updates
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {getThemeIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme(THEMES.LIGHT)}>
                  <Sun className="mr-2 h-4 w-4" />
                  {t('header.lightTheme')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(THEMES.DARK)}>
                  <Moon className="mr-2 h-4 w-4" />
                  {t('header.darkTheme')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(THEMES.SYSTEM)}>
                  <Monitor className="mr-2 h-4 w-4" />
                  {t('header.followSystem')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {getUserInitials(user?.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.username}</p>
                    {user?.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    )}
                    {user?.is_admin && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {t('header.administrator')}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  {t('header.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  {t('header.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('header.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {updateInfo && updateInfo.hasUpdate && (
        <UpdateModal
          open={showUpdateModal}
          onOpenChange={setShowUpdateModal}
          versionInfo={updateInfo}
        />
      )}
    </header>
  );
}