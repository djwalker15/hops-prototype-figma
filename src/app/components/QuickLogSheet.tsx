import { useState, useEffect } from 'react';
import { mockItems, Item, WASTE_REASONS, User, WasteReason } from '../data/mockData';
import { getCurrentUser, addWasteEntry, updateInventoryForWaste, getItems, getUsers, getWasteReasons } from '../data/storage';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Search, Check, Plus, Minus, X, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

interface QuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickLogSheet({ open, onOpenChange, onSuccess }: QuickLogSheetProps) {
  const currentUser = getCurrentUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [amountType, setAmountType] = useState<'serving' | 'bottle'>('serving');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [wasteReasons, setWasteReasons] = useState<WasteReason[]>([]);
  const [attributedToUserId, setAttributedToUserId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Load items and users from storage when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    } else {
      // Reset when closing
      setSelectedItem(null);
      setAmountType('serving');
      setQuantity(1);
      setReason('');
      setSearchTerm('');
      setAttributedToUserId('');
      setDate('');
      setNotes('');
    }
  }, [open]);

  const loadData = async () => {
    try {
      const storedItems = await getItems();
      setItems(storedItems);
      
      const storedUsers = await getUsers();
      console.log('📊 Loaded users from database:', storedUsers);
      // Don't filter by isActive - just use all users
      console.log('✅ All users available:', storedUsers);
      setUsers(storedUsers);
      
      // Only set default if not already set
      if (currentUser && storedUsers.length > 0 && !attributedToUserId) {
        console.log('🎯 Setting default attributed user to:', currentUser.id, currentUser.name);
        setAttributedToUserId(currentUser.id);
      }

      const storedWasteReasons = await getWasteReasons();
      setWasteReasons(storedWasteReasons);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    }
  };

  if (!currentUser) return null;

  // Filter items based on search
  const filteredItems = searchTerm.length >= 2
    ? items
        .filter(item => 
          item.isActive && item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleQuantityChange = (delta: number) => {
    const maxQuantity = amountType === 'serving' ? 20 : 10;
    setQuantity(prev => Math.max(1, Math.min(maxQuantity, prev + delta)));
  };

  const handleSubmit = async () => {
    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    const attributedToUser = users.find(u => u.id === attributedToUserId);
    const reasonObj = wasteReasons.find(r => r.id === reason);

    // Use the provided date or default to now
    const wasteTimestamp = date 
      ? new Date(date + 'T' + new Date().toTimeString().split(' ')[0]).toISOString()
      : new Date().toISOString();

    // Map UI fields to database schema
    const entry = {
      id: `waste-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      category: selectedItem.category,
      amount: quantity,
      unit: amountType === 'serving' ? 'serving' : 'bottle',
      reasonId: reason,
      reasonName: reasonObj?.name || reason,
      loggedByUserId: currentUser.id,
      loggedByName: currentUser.name,
      attributedToUserId: attributedToUserId || null,
      attributedToName: attributedToUser?.name || null,
      timestamp: wasteTimestamp,
      notes: notes || null,
    };

    try {
      await addWasteEntry(entry);
      // Success feedback
      toast.success('Waste logged successfully!');
    } catch (error) {
      console.error('Failed to log waste:', error);
      toast.error('Failed to log waste. Please try again.');
      return;
    }

    // Reset form
    setSelectedItem(null);
    setAmountType('serving');
    setQuantity(1);
    setReason('');
    setSearchTerm('');
    setAttributedToUserId(currentUser.id);
    setDate('');
    setNotes('');

    // Close sheet and notify parent
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedItem(null);
    setAmountType('serving');
    setQuantity(1);
    setReason('');
    setSearchTerm('');
    setShowResults(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>Log Waste</DialogTitle>
          <DialogDescription>
            Quick entry for waste tracking
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Item Selection Section */}
          <div className="space-y-4 pb-6 border-b">
            <h3 className="font-semibold text-sm text-[#4A3728]">Item Selection</h3>
            
            <div className="space-y-2">
              <Label htmlFor="item-search">What was wasted?</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="item-search"
                  type="text"
                  placeholder="Type item name..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              {showResults && filteredItems.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-[#4A3728]">{item.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{item.category}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Item */}
              {selectedItem && (
                <div className="bg-[#F5F1E8] border-2 border-[#4A7C59] rounded-md p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#4A3728] truncate">{selectedItem.name}</div>
                    <div className="text-sm text-gray-600 capitalize">{selectedItem.category}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Section */}
          {selectedItem && (
            <>
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold text-sm text-[#4A3728]">Amount Details</h3>
                
                <div className="space-y-2">
                  <Label>Amount Type</Label>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <RadioGroup 
                      value={amountType} 
                      onValueChange={(value) => {
                        setAmountType(value as 'serving' | 'bottle');
                        setQuantity(1);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="serving" id="serving" />
                          <Label htmlFor="serving" className="cursor-pointer">Serving</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => amountType === 'serving' && setQuantity(prev => Math.max(0.25, prev - 0.25))}
                            disabled={amountType !== 'serving' || quantity <= 0.25}
                            className="h-9 w-9"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={amountType === 'serving' ? quantity : ''}
                            onChange={(e) => {
                              if (amountType === 'serving') {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val > 0 && val <= 50) {
                                  setQuantity(val);
                                }
                              }
                            }}
                            disabled={amountType !== 'serving'}
                            step="0.25"
                            min="0.25"
                            max="50"
                            className="h-9 w-20 text-center text-lg font-semibold"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => amountType === 'serving' && setQuantity(prev => Math.min(50, prev + 0.25))}
                            disabled={amountType !== 'serving' || quantity >= 50}
                            className="h-9 w-9"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bottle" id="bottle" />
                          <Label htmlFor="bottle" className="cursor-pointer">Bottle</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => amountType === 'bottle' && setQuantity(prev => Math.max(0.25, prev - 0.25))}
                            disabled={amountType !== 'bottle' || quantity <= 0.25}
                            className="h-9 w-9"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={amountType === 'bottle' ? quantity : ''}
                            onChange={(e) => {
                              if (amountType === 'bottle') {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val > 0 && val <= 20) {
                                  setQuantity(val);
                                }
                              }
                            }}
                            disabled={amountType !== 'bottle'}
                            step="0.25"
                            min="0.25"
                            max="20"
                            className="h-9 w-20 text-center text-lg font-semibold"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => amountType === 'bottle' && setQuantity(prev => Math.min(20, prev + 0.25))}
                            disabled={amountType !== 'bottle' || quantity >= 20}
                            className="h-9 w-9"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* Reason Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-[#4A3728]">Waste Reason</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Why was it wasted?</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger id="reason" className="w-full">
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {wasteReasons.filter(r => r.isActive).map(r => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Attributed To Section */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold text-sm text-[#4A3728]">Attributed To</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="attributed-to">Who was responsible?</Label>
                  {users.length > 0 ? (
                    <Select 
                      value={attributedToUserId} 
                      onValueChange={(value) => {
                        console.log('Changing attributed user to:', value);
                        setAttributedToUserId(value);
                      }}
                    >
                      <SelectTrigger id="attributed-to" className="w-full">
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} {u.id === currentUser.id ? '(You)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-gray-500">Loading users...</div>
                  )}
                </div>
              </div>

              {/* Date and Notes Section */}
              <div className="space-y-4 pb-6 border-b">
                <h3 className="font-semibold text-sm text-[#4A3728]">Additional Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    type="text"
                    placeholder="Enter any additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with Submit Button */}
        {selectedItem && (
          <div className="pt-4 border-t">
            <Button
              onClick={handleSubmit}
              className="w-full bg-[#4A7C59] hover:bg-[#3A6C49] text-white font-semibold"
              disabled={!selectedItem || !reason}
            >
              Log Waste
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}