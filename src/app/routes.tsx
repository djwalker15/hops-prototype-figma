import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from '@clerk/clerk-react';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { getCurrentUser } from './data/storage';

// Protected Route wrapper — requires both Clerk auth and a linked app user (PIN session)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for Clerk to finish loading before making auth decisions
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginScreen />,
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