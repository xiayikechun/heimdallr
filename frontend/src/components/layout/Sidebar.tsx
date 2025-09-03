import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bell, 
  Users, 
  X,
  Settings,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { ROUTES } from '../../utils/constants';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  mobile?: boolean;
}

const getNavigation = (t: (key: string) => string) => [
  { name: t('navigation.dashboard'), href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: t('navigation.channels'), href: ROUTES.CHANNELS, icon: Bell },
  { name: t('navigation.groups'), href: ROUTES.GROUPS, icon: Users },
  { name: t('navigation.profile'), href: ROUTES.PROFILE, icon: User },
  { name: t('navigation.settings'), href: ROUTES.SETTINGS, icon: Settings },
];

function SidebarContent() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigation = getNavigation(t);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Heimdallr
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== ROUTES.DASHBOARD && location.pathname.startsWith(item.href));
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                )}
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Heimdallr v3.0.0
        </p>
      </div>
    </div>
  );
}

export function Sidebar({ open = true, onClose, mobile = false }: SidebarProps) {
  const { t } = useTranslation();
  
  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-64">
          <SheetHeader className="sr-only">
            <SheetTitle>{t('sidebar.mainFeatures')}</SheetTitle>
          </SheetHeader>
          <div className="absolute right-4 top-4 z-10">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="flex flex-col w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <SidebarContent />
    </div>
  );
}