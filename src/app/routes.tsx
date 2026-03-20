import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from '@clerk/clerk-react';
import { LoginScreen } from './screens/LoginScreen';
import { KioskLoginScreen } from './screens/KioskLoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { getCurrentUser, isKioskMode } from './data/storage';

// Personal device: requires Clerk session + localStorage session
function PersonalRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;
  if (!getCurrentUser()) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Kiosk: requires only localStorage session (no Clerk)
function KioskRoute({ children }: { children: React.ReactNode }) {
  if (!getCurrentUser()) return <Navigate to="/kiosk" replace />;
  return <>{children}</>;
}

// Picks the right protection based on device mode
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (isKioskMode()) return <KioskRoute>{children}</KioskRoute>;
  return <PersonalRoute>{children}</PersonalRoute>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginScreen />,
  },
  {
    path: '/kiosk',
    element: <KioskLoginScreen />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <HomeScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '/review',
    element: (
      <ProtectedRoute>
        <ReviewScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '/catalog',
    element: <CatalogScreen />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);