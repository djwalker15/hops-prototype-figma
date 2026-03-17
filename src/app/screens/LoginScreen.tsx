import { useEffect, useState } from 'react';
import { useAuth, useUser, SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import { setCurrentUser, getCurrentUser, getUserByClerkId, linkClerkUser } from '../data/storage';
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

// Step 1: 'clerk-signin'  — user not signed into Clerk, show Clerk's SignIn component
// Step 2: 'resolving'     — Clerk session active, looking up linked DB user automatically
// Step 3: 'linking'       — no DB user linked yet, show PIN screen to link account
type Step = 'clerk-signin' | 'resolving' | 'linking';

export function LoginScreen() {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { data: users = [] } = useUsers();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('resolving');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showOtherStaff, setShowOtherStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already fully logged in, send to home immediately
  useEffect(() => {
    if (getCurrentUser()) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  // Once Clerk has loaded, determine which step to show
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setStep('clerk-signin');
      return;
    }

    // Clerk session active — try to resolve the linked DB user automatically
    const resolve = async () => {
      setStep('resolving');
      try {
        const token = await getToken();
        if (!token || !clerkUser) {
          setStep('linking');
          return;
        }
        const user = await getUserByClerkId(clerkUser.id, token);
        if (user) {
          setCurrentUser(user);
          navigate('/home', { replace: true });
        } else {
          setStep('linking');
        }
      } catch {
        setStep('linking');
      }
    };

    resolve();
  }, [isLoaded, isSignedIn, clerkUser, getToken, navigate]);

  const scheduledUsers = users.filter(u => u.isScheduledToday);
  const otherUsers = users.filter(u => !u.isScheduledToday);
  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleLink = async () => {
    if (!selectedUserId) { setError('Please select your name'); return; }
    if (pin.length !== 4) { setError('Please enter your 4-digit PIN'); return; }
    if (!clerkUser) { setError('Clerk session lost. Please refresh.'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Could not get Clerk token');
      const user = await linkClerkUser(selectedUserId, pin, token);
      if (!user) throw new Error('Link failed');
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

  // ── Clerk sign-in screen ──────────────────────────────────────────────────
  if (step === 'clerk-signin') {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-4">
        <div className="mb-6 flex items-center gap-3">
          <Wine className="w-8 h-8 text-[#8B6F47]" />
          <h1 className="text-2xl font-bold text-[#4A3728]">Haywire Waste Logger</h1>
        </div>
        <SignIn routing="hash" />
      </div>
    );
  }

  // ── Resolving (auto-lookup in progress) ───────────────────────────────────
  if (step === 'resolving') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F1E8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B6F47] mx-auto mb-4" />
          <p className="text-[#4A3728]">Signing you in…</p>
        </div>
      </div>
    );
  }

  // ── Link account + PIN screen ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <Wine className="w-8 h-8 text-[#8B6F47]" />
          <h1 className="text-2xl font-bold text-[#4A3728]">Haywire Waste Logger</h1>
        </div>
        <p className="text-center text-sm text-gray-500 mb-6">
          Select your name and enter your PIN to link your Clerk account.
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
              <p className="text-sm text-gray-600 mb-1">Linking as</p>
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
          onClick={handleLink}
          className="w-full h-12 bg-[#8B6F47] hover:bg-[#6B5537] text-white"
          disabled={!selectedUserId || pin.length !== 4 || isSubmitting}
        >
          {isSubmitting ? 'Linking…' : 'Link Account & Sign In'}
        </Button>
      </div>
    </div>
  );
}
