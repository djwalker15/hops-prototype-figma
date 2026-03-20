import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { setCurrentUser, getCurrentUser, setKioskMode, verifyPin } from '../data/storage';
import { User } from '../data/mockData';
import { useUsers } from '../hooks/useUsers';
import { Button } from '../components/ui/button';
import { Wine, ChevronDown } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export function KioskLoginScreen() {
  const { data: users = [] } = useUsers();
  const navigate = useNavigate();

  const [selectedUserId, setSelectedUserId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showOtherStaff, setShowOtherStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark this as a kiosk device on load
  useEffect(() => {
    setKioskMode();
  }, []);

  // If already logged in (e.g. page refresh), go straight to home
  useEffect(() => {
    if (getCurrentUser()) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const scheduledUsers = users.filter(u => u.isScheduledToday);
  const otherUsers = users.filter(u => !u.isScheduledToday);
  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setError('');
    setPin('');
    setShowOtherStaff(false);
  };

  const handleOtherClick = () => {
    setShowOtherStaff(true);
    setSelectedUserId('');
    setError('');
    setPin('');
  };

  const handleLogin = async () => {
    if (!selectedUserId) { setError('Please select your name'); return; }
    if (pin.length !== 4) { setError('Please enter your 4-digit PIN'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const user = await verifyPin(selectedUserId, pin);
      if (!user) throw new Error('Login failed');
      setCurrentUser(user);
      navigate('/home', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('401')) {
        setError('Incorrect PIN. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      setPin('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Wine className="w-8 h-8 text-[#8B6F47]" />
          <h1 className="text-2xl font-bold text-[#4A3728]">Haywire Waste Logger</h1>
        </div>
        <p className="text-center text-sm text-gray-500 mb-6">
          Select your name and enter your PIN to log in.
        </p>

        {/* Scheduled Staff */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#4A3728] mb-3">On Shift Today</label>
          <div className="flex flex-wrap gap-2">
            {scheduledUsers.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedUserId === user.id
                    ? 'border-[#8B6F47] bg-[#8B6F47] text-white shadow-md'
                    : 'border-gray-200 bg-white text-[#4A3728] hover:border-[#8B6F47] hover:bg-[#F5F1E8]'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs opacity-75 capitalize">{user.role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Other Staff */}
        {otherUsers.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#4A3728] mb-3">Other Staff</label>
            <div className="flex flex-wrap gap-2">
              {selectedUser && !selectedUser.isScheduledToday ? (
                <button
                  onClick={() => handleUserSelect(selectedUser.id)}
                  className="px-4 py-3 rounded-lg border-2 transition-all border-[#8B6F47] bg-[#8B6F47] text-white shadow-md"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-medium">{selectedUser.name}</span>
                    <span className="text-xs opacity-75 capitalize">{selectedUser.role}</span>
                  </div>
                </button>
              ) : null}
              <button
                onClick={handleOtherClick}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  showOtherStaff
                    ? 'border-[#8B6F47] bg-[#8B6F47] text-white shadow-md'
                    : 'border-gray-200 bg-white text-[#4A3728] hover:border-[#8B6F47] hover:bg-[#F5F1E8]'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">{selectedUser && !selectedUser.isScheduledToday ? 'Change' : 'Select'}</span>
                  <ChevronDown className="h-4 w-4 opacity-75" />
                </div>
              </button>
            </div>
            <div className={`mt-3 transition-all overflow-hidden ${showOtherStaff ? 'max-h-[60px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <Select value={selectedUserId} onValueChange={handleUserSelect}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select from all staff..." />
                </SelectTrigger>
                <SelectContent>
                  {otherUsers.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Selected user indicator */}
        <div className="mb-4 p-4 bg-[#F5F1E8] rounded-lg border border-[#8B6F47] min-h-[88px] flex items-center justify-center">
          {selectedUser ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Signing in as</p>
              <p className="text-lg font-bold text-[#4A3728]">{selectedUser.name}</p>
              <p className="text-xs text-gray-500 capitalize">{selectedUser.role}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Select your name above</p>
          )}
        </div>

        {/* PIN entry */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#4A3728] mb-2">Enter PIN</label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={value => { setPin(value); setError(''); }}
              disabled={!selectedUserId}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {!selectedUserId && (
            <p className="text-xs text-gray-500 text-center mt-2">Select your name to enter PIN</p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleLogin}
          className="w-full h-12 bg-[#8B6F47] hover:bg-[#6B5537] text-white"
          disabled={!selectedUserId || pin.length !== 4 || isSubmitting}
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </div>
    </div>
  );
}
