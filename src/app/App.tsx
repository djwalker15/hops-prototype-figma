import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import { Toaster } from './components/ui/sonner';
import { useEffect, useState } from 'react';
import { initializeDatabase, migrateWasteReasons, migrateUsers } from './data/storage';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize database on first load
    const init = async () => {
      try {
        const hasInitialized = localStorage.getItem('hops_db_initialized');
        
        if (!hasInitialized) {
          console.log('First-time setup: Seeding PostgreSQL database with comprehensive Haywire Bar inventory...');
          await initializeDatabase();
          localStorage.setItem('hops_db_initialized', 'true');
          console.log('✅ PostgreSQL database seeded successfully');
        }
        
        // Check if waste reasons migration is needed (legacy - no longer needed with PostgreSQL)
        const hasWasteReasonsMigrated = localStorage.getItem('hops_waste_reasons_migrated');
        if (!hasWasteReasonsMigrated) {
          console.log('Skipping waste reasons migration - using PostgreSQL');
          localStorage.setItem('hops_waste_reasons_migrated', 'true');
        }
        
        // Check if users migration is needed (legacy - no longer needed with PostgreSQL)
        const hasUsersMigrated = localStorage.getItem('hops_users_migrated');
        if (!hasUsersMigrated) {
          console.log('Skipping users migration - using PostgreSQL');
          localStorage.setItem('hops_users_migrated', 'true');
        }
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setInitError(String(error));
        setIsInitializing(false);
      }
    };
    
    init();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing H.O.P.S. system...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Initialization Error</h1>
          <p className="text-gray-600 mb-4">Failed to connect to database. Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </>
  );
}