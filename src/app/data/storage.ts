// FastAPI Backend Storage for H.O.P.S. Waste Logger

import { WasteEntry, User, Item, WasteReason } from './mockData';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

// Helper function to make API calls
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }
  
  return response.json();
}

const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

const STORAGE_KEYS = {
  CURRENT_USER: 'hops_current_user',
  SESSION_TIMESTAMP: 'hops_session_timestamp',
  KIOSK_MODE: 'hops_kiosk_mode',
};

// Initialize database by calling seed endpoint
export const initializeDatabase = async (): Promise<void> => {
  try {
    await apiFetch('/seed', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Migrate waste reasons for existing databases
export const migrateWasteReasons = async (): Promise<void> => {
  try {
    await apiFetch('/migrate-waste-reasons', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error migrating waste reasons:', error);
    throw error;
  }
};

// Migrate users to add isScheduledToday property
export const migrateUsers = async (): Promise<void> => {
  try {
    await apiFetch('/migrate-users', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error migrating users:', error);
    throw error;
  }
};

// Waste Entries
export const getWasteEntries = async (): Promise<WasteEntry[]> => {
  try {
    const data = await apiFetch('/waste-entries');
    return data.entries || [];
  } catch (error) {
    console.error('Error reading waste entries:', error);
    return [];
  }
};

export const addWasteEntry = async (entry: WasteEntry): Promise<void> => {
  try {
    await apiFetch('/waste-entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  } catch (error) {
    console.error('Error saving waste entry:', error);
    throw error;
  }
};

export const clearWasteEntries = async (): Promise<void> => {
  try {
    await apiFetch('/waste-entries', { method: 'DELETE' });
  } catch (error) {
    console.error('Error clearing waste entries:', error);
    throw error;
  }
};

// User Session (still using localStorage for session management)
export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const sessionTimestamp = localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    console.log("Getting user data: ", userData)
    if (!userData || !sessionTimestamp) {
      return null;
    }
    
    // Check if session has expired
    const timestamp = parseInt(sessionTimestamp, 10);
    const now = Date.now();
    
    if (now - timestamp > SESSION_TIMEOUT) {
      clearCurrentUser();
      return null;
    }
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error reading current user:', error);
    return null;
  }
};

export const setCurrentUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

export const clearCurrentUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    // Intentionally does NOT clear KIOSK_MODE — that's device-level, not session-level
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

// Kiosk mode helpers (device-level flag, survives user switching)
export const isKioskMode = (): boolean =>
  localStorage.getItem(STORAGE_KEYS.KIOSK_MODE) === 'true';

export const setKioskMode = (): void =>
  localStorage.setItem(STORAGE_KEYS.KIOSK_MODE, 'true');

export const clearKioskMode = (): void =>
  localStorage.removeItem(STORAGE_KEYS.KIOSK_MODE);

// Clerk integration — personal device onboarding: set clerk_user_id AND create PIN
export const associateClerk = async (userId: string, pin: string, clerkToken: string): Promise<User | null> => {
  try {
    const data = await apiFetch(`/users/${userId}/associate-clerk`, {
      method: 'PATCH',
      body: JSON.stringify({ pin }),
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
    return data.user || null;
  } catch (error) {
    console.error('Error associating Clerk user:', error);
    throw error;
  }
};

// Kiosk login: verify PIN for a specific user (no Clerk auth)
export const verifyPin = async (userId: string, pin: string): Promise<User | null> => {
  try {
    const data = await apiFetch(`/users/${userId}/verify-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
    return data.user || null;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    throw error;
  }
};

// Items
export const getItems = async (): Promise<Item[]> => {
  try {
    const data = await apiFetch('/items');
    return data.items || [];
  } catch (error) {
    console.error('Error reading items:', error);
    return [];
  }
};

export const getItem = async (id: string): Promise<Item | null> => {
  try {
    const data = await apiFetch(`/items/${id}`);
    return data.item || null;
  } catch (error) {
    console.error('Error reading item:', error);
    return null;
  }
};

export const setItems = async (items: Item[]): Promise<void> => {
  try {
    // This would need to update multiple items
    for (const item of items) {
      await apiFetch(`/items/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
      });
    }
  } catch (error) {
    console.error('Error saving items:', error);
    throw error;
  }
};

export const updateItem = async (id: string, updates: Partial<Item>): Promise<void> => {
  try {
    await apiFetch(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const addItem = async (item: Item): Promise<void> => {
  try {
    await apiFetch('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};

// Users
export const getUsers = async (): Promise<User[]> => {
  try {
    const data = await apiFetch('/users');
    return data.users || [];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

export const authenticateUser = async (pin: string): Promise<User | null> => {
  try {
    const data = await apiFetch('/users/authenticate', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
    return data.user || null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

export const setUsers = async (users: User[]): Promise<void> => {
  // This would need implementation on the server side if needed
  console.warn('setUsers not implemented for Supabase backend');
};

// Inventory Management (now handled on backend)
export const updateInventoryForWaste = async (itemId: string, quantity: number): Promise<void> => {
  // This is now handled automatically in the backend when creating a waste entry
  console.log('Inventory update handled by backend');
};

// Export to CSV
export const exportToCSV = (entries: WasteEntry[]): void => {
  const headers = ['Timestamp', 'Item', 'Amount Type', 'Quantity', 'Reason', 'Attributed To', 'Logged By'];
  const rows = entries.map(entry => [
    new Date(entry.timestamp).toLocaleString(),
    entry.itemName,
    entry.amountType,
    entry.quantity.toString(),
    entry.reason,
    entry.attributedToName || entry.loggedByName,
    entry.loggedByName,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `\"${cell}\"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `waste-log-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Legacy compatibility
export const clearItems = async (): Promise<void> => {
  console.warn('clearItems not implemented for Supabase backend - use seed instead');
};

// Clerk integration
export const getUserByClerkId = async (clerkUserId: string, clerkToken: string): Promise<User | null> => {
  try {
    const data = await apiFetch(`/users/by-clerk-id/${clerkUserId}`, {
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
    return data.user || null;
  } catch (error: unknown) {
    // 404 means no user is linked yet — not an error, just return null
    if (error instanceof Error && error.message.includes('404')) return null;
    console.error('Error fetching user by Clerk ID:', error);
    return null;
  }
};

export const linkClerkUser = async (userId: string, pin: string, clerkToken: string): Promise<User | null> => {
  try {
    const data = await apiFetch(`/users/${userId}/link-clerk`, {
      method: 'PATCH',
      body: JSON.stringify({ pin }),
      headers: { Authorization: `Bearer ${clerkToken}` },
    });
    return data.user || null;
  } catch (error) {
    console.error('Error linking Clerk user:', error);
    throw error;
  }
};

// Waste Reasons
export const getWasteReasons = async (): Promise<WasteReason[]> => {
  try {
    const data = await apiFetch('/waste-reasons');
    return data.reasons || [];
  } catch (error) {
    console.error('Error reading waste reasons:', error);
    return [];
  }
};

export const addWasteReason = async (reason: Omit<WasteReason, 'id' | 'createdAt'>): Promise<void> => {
  try {
    await apiFetch('/waste-reasons', {
      method: 'POST',
      body: JSON.stringify(reason),
    });
  } catch (error) {
    console.error('Error adding waste reason:', error);
    throw error;
  }
};

export const updateWasteReason = async (id: string, updates: Partial<WasteReason>): Promise<void> => {
  try {
    await apiFetch(`/waste-reasons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    console.error('Error updating waste reason:', error);
    throw error;
  }
};

export const deleteWasteReason = async (id: string): Promise<void> => {
  try {
    await apiFetch(`/waste-reasons/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting waste reason:', error);
    throw error;
  }
};