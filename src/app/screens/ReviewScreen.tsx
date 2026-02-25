import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { getCurrentUser, exportToCSV } from '../data/storage';
import { type WasteEntry, type WasteReason, WASTE_REASONS } from '../data/mockData';
import { useWasteEntries, useClearWasteEntries } from '../hooks/useWasteEntries';
import { useWasteReasons } from '../hooks/useWasteReasons';
import { QuickLogSheet } from '../components/QuickLogSheet';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ArrowLeft, Download, Trash2, Calendar, Wine } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export function ReviewScreen() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { data: allEntries = [] } = useWasteEntries();
  const { data: wasteReasons = [] } = useWasteReasons();
  const clearEntriesMutation = useClearWasteEntries();

  const [filterReason, setFilterReason] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [quickLogOpen, setQuickLogOpen] = useState(false);

  // Redirect if not logged in
  if (!currentUser) {
    navigate('/');
    return null;
  }

  // Filter entries
  const filteredEntries = useMemo(() => {
    let entries = [...allEntries];

    // Filter by reason
    if (filterReason !== 'all') {
      entries = entries.filter(e => e.reasonId === filterReason);
    }

    // Filter by time period
    if (filterPeriod === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      entries = entries.filter(e => new Date(e.timestamp) >= today);
    } else if (filterPeriod === 'week') {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
      const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
      entries = entries.filter(e => {
        const entryDate = parseISO(e.timestamp);
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
      });
    }

    return entries;
  }, [allEntries, filterReason, filterPeriod]);

  const handleExport = () => {
    exportToCSV(filteredEntries);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL waste entries? This cannot be undone.')) {
      await clearEntriesMutation.mutateAsync();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = parseISO(timestamp);
      return format(date, 'M/d/yy - h:mm a');
    } catch (error) {
      return timestamp;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] pb-20">
      {/* Header */}
      <Header title="Waste Review" />

      <div className="p-4 max-w-2xl mx-auto">
        {/* Filters & Actions */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-[#4A3728] mb-1">
                Time Period
              </label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A3728] mb-1">
                Reason
              </label>
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  {wasteReasons.map(reason => (
                    <SelectItem key={reason.id} value={reason.id}>
                      {reason.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex-1 h-10"
              disabled={filteredEntries.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            {currentUser.role === 'manager' && (
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="flex-1 h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={allEntries.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#4A3728] mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-[#4A3728]">{filteredEntries.length}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {filterPeriod === 'today' ? "Today's Entries" : filterPeriod === 'week' ? "This Week's Entries" : 'Total Entries'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#4A3728]">
                {filteredEntries.reduce((sum, entry) => sum + entry.amount, 0)}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Items Wasted</div>
            </div>
          </div>
          
          {/* Breakdown by Reason */}
          {filteredEntries.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By Reason</h4>
              <div className="space-y-1.5">
                {Object.entries(
                  filteredEntries.reduce((acc, entry) => {
                    acc[entry.reasonName] = (acc[entry.reasonName] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([, a], [, b]) => b - a)
                  .map(([reason, count]) => (
                    <div key={reason} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{reason}</span>
                      <span className="font-medium text-[#4A3728]">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No waste entries found</p>
            <p className="text-sm text-gray-400 mt-1">
              {filterReason !== 'all' || filterPeriod !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Start logging waste to see entries here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#4A3728] text-lg">
                      {entry.itemName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {entry.amount} {entry.unit}{entry.amount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {formatTimestamp(entry.timestamp)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-sm">
                    <span className="text-gray-500">Reason:</span>{' '}
                    <span className="text-[#4A3728] font-medium">{entry.reasonName}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {entry.attributedToUserId && entry.attributedToUserId !== entry.loggedByUserId ? (
                      <div className="text-right">
                        <div>
                          Attributed to: <span className="font-medium text-[#4A3728]">{entry.attributedToName}</span>
                        </div>
                        <div className="text-xs mt-0.5">
                          Logged by: {entry.loggedByName}
                        </div>
                      </div>
                    ) : (
                      <>By: <span className="font-medium text-[#4A3728]">{entry.loggedByName}</span></>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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