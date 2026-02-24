import { Wine, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { getCurrentUser, clearCurrentUser } from '../data/storage';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogout?: boolean;
  showUserInfo?: boolean;
  showStats?: boolean;
  todayCount?: number;
}

export function Header({ 
  title = 'H.O.P.S.',
  subtitle,
  showLogout = true,
  showUserInfo = false,
  showStats = false,
  todayCount = 0
}: HeaderProps) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    clearCurrentUser();
    navigate('/');
  };

  return (
    <div className="bg-[#8B6F47] text-white p-4 sticky top-0 z-10 shadow-md">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wine className="h-6 w-6" />
            <div>
              <span className="font-semibold text-lg">{title}</span>
              {subtitle && (
                <p className="text-xs text-white/80">{subtitle}</p>
              )}
            </div>
          </div>
          {showLogout && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-[#6B5537]"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>

        {showUserInfo && currentUser && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Welcome back,</p>
              <p className="text-xl font-semibold">{currentUser.name}</p>
            </div>
            {showStats && (
              <div className="text-right">
                <p className="text-2xl font-bold">{todayCount}</p>
                <p className="text-xs text-white/80">logged today</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
