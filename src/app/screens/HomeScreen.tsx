import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser } from '../data/storage';
import { useWasteEntries } from '../hooks/useWasteEntries';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { QuickLogSheet } from '../components/QuickLogSheet';
import { Button } from '../components/ui/button';
import { Clock, Package, Wine, ClipboardList, FolderOpen, BarChart3, Settings, ChevronRight } from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

export function HomeScreen() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { data: entries = [] } = useWasteEntries();
  const [quickLogOpen, setQuickLogOpen] = useState(false);

  // Redirect if not logged in
  if (!currentUser) {
    navigate('/');
    return null;
  }

  const todayCount = entries.filter(e => isToday(parseISO(e.timestamp))).length;
  const totalCount = entries.length;

  const isManager = currentUser.role === 'manager';

  // Navigation items with role-based visibility
  const navigationItems = [
    {
      icon: Wine,
      label: 'Log Waste',
      description: 'Record a new waste entry',
      action: () => setQuickLogOpen(true),
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
      visible: true,
    },
    {
      icon: ClipboardList,
      label: 'Review Logs',
      description: 'View all waste entries',
      action: () => navigate('/review'),
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      visible: true,
    },
    {
      icon: FolderOpen,
      label: 'Manage Catalog',
      description: 'Edit items and recipes',
      action: () => navigate('/catalog'),
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      visible: isManager,
    },
    {
      icon: BarChart3,
      label: 'Reports',
      description: 'View analytics and trends',
      action: () => {
        // Placeholder for future feature
        alert('Reports feature coming soon!');
      },
      color: 'bg-green-100',
      iconColor: 'text-green-600',
      visible: isManager,
      badge: 'Soon',
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'App preferences and account',
      action: () => {
        // Placeholder for future feature
        alert('Settings feature coming soon!');
      },
      color: 'bg-gray-100',
      iconColor: 'text-gray-600',
      visible: true,
      badge: 'Soon',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8] pb-20">
      {/* Header */}
      <Header 
        showUserInfo={true}
        showStats={true}
        todayCount={todayCount}
      />

      {/* Main Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg p-6 text-center shadow-sm mb-6">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Wine className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#4A3728] mb-2">Welcome to H.O.P.S.</h3>
          <p className="text-sm text-gray-500">
            Haywire's waste tracking system. Log waste entries, review logs, and manage your inventory catalog.
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-[#4A3728]">Quick Actions</h2>
          <p className="text-sm text-gray-500 mt-0.5">Navigate to key features</p>
        </div>

        {/* Primary Action - Full Width Button Style */}
        <button
          onClick={() => setQuickLogOpen(true)}
          className="w-full bg-[#4A7C59] hover:bg-[#3A6C49] rounded-lg p-5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] text-left mb-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <Wine className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-0.5">Log Waste</h3>
                <p className="text-sm text-white/75">Record a new waste entry</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-white/60 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Secondary Action - Bordered with Subtle Background */}
        <button
          onClick={() => navigate('/review')}
          className="w-full bg-white rounded-lg p-4 border-2 border-[#4A7C59]/20 hover:border-[#4A7C59]/30 shadow-sm hover:shadow transition-all active:scale-[0.98] text-left mb-6 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-[#4A7C59]/10 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="h-6 w-6 text-[#4A7C59]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#4A3728]">Review Logs</h3>
                <p className="text-sm text-gray-600 mt-0.5">View all waste entries</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Other Actions */}
        {isManager && (
          <div className="border-t border-gray-200 pt-4 mt-2 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-3">Manager Tools</h3>
            
            <div className="space-y-2">
              {/* Manage Catalog */}
              <button
                onClick={() => navigate('/catalog')}
                className="w-full bg-white rounded-lg p-3.5 shadow-sm border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98] text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#4A3728] text-sm">Manage Catalog</h4>
                    <p className="text-xs text-gray-500">Edit items and recipes</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              </button>

              {/* Reports */}
              <button
                onClick={() => alert('Reports feature coming soon!')}
                className="w-full bg-white rounded-lg p-3.5 shadow-sm border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98] text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-[#4A3728] text-sm">Reports</h4>
                      <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                        Soon
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">View analytics and trends</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Settings - Always Visible */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-3">General</h3>
          
          <button
            onClick={() => alert('Settings feature coming soon!')}
            className="w-full bg-white rounded-lg p-3.5 shadow-sm border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-[0.98] text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-[#4A3728] text-sm">Settings</h4>
                  <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                    Soon
                  </span>
                </div>
                <p className="text-xs text-gray-500">App preferences and account</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav 
        onActionClick={() => setQuickLogOpen(true)}
        actionLabel="Log Waste"
      />

      {/* Quick Log Sheet */}
      <QuickLogSheet 
        open={quickLogOpen} 
        onOpenChange={setQuickLogOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}