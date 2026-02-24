import { createBrowserRouter, Navigate } from 'react-router';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { getCurrentUser } from './data/storage';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
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