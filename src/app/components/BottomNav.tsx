import { useNavigate, useLocation } from 'react-router';
import { Home, ClipboardList, Plus, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getCurrentUser } from '../data/storage';

interface BottomNavProps {
  onActionClick?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
}

export function BottomNav({ 
  onActionClick, 
  actionLabel = 'Add',
  actionIcon = <Plus className="h-6 w-6" />
}: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const isManager = currentUser?.role === 'manager';

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/review', icon: ClipboardList, label: 'Review' },
    ...(isManager ? [{ path: '/catalog', icon: Package, label: 'Catalog' }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="relative max-w-2xl mx-auto">
        <div className={`grid ${isManager ? 'grid-cols-3' : 'grid-cols-2'} h-16`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive(item.path)
                    ? 'text-[#8B6F47]'
                    : 'text-gray-500 hover:text-[#8B6F47]'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Action Button (FAB) - Only show for non-manager (2-tab layout) */}
        {onActionClick && !isManager && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <Button
              onClick={onActionClick}
              className="h-14 w-14 rounded-full bg-[#4A7C59] hover:bg-[#3A6C49] text-white shadow-lg flex items-center justify-center"
              size="icon"
            >
              {actionIcon}
              <span className="sr-only">{actionLabel}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}