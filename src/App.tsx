import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect, useRef } from 'react';
import { Analytics } from "@vercel/analytics/react"; // Vercel Analytics
import { SpeedInsights } from "@vercel/speed-insights/react"; // Vercel Speed Insights
import { toast } from "@/components/ui/use-toast";
import Navbar from './components/Navbar';
import Index from './pages/Index';
import Profile from './pages/Profile';
import HealthReport from './pages/HealthReport';
import Nutrition from './pages/Nutrition';
import AIBot from './pages/AIBot';
import About from './pages/About';
import NotFound from './pages/NotFound';
import History from './pages/History';
import DoctorFinder from './pages/DoctorFinder';
import DoctorDetails from './pages/DoctorDetails';
import DoctorPortal from './pages/DoctorPortal';
import LoadingScreen from './components/LoadingScreen';
import TermsAndPrivacyPage from './pages/TermsAndPrivacyPage';
import Contact from './pages/Contact';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import UpdateNotification from './components/common/UpdateNotification';
import ChangelogDemo from './components/demo/ChangelogDemo';
import './App.css';
import { synchronizeTier, logoutUser } from '@/api/auth';

export const dispatchAuthEvent = (isAuthenticated: boolean, email?: string) => {
  const event = new CustomEvent('authStateChanged', {
    detail: { isAuthenticated, email }
  });
  window.dispatchEvent(event);
};

function App() {
  const [loading, setLoading] = useState(true);
  const modalRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    window.addEventListener('orientationchange', setVhProperty);

    return () => {
      window.removeEventListener('resize', setVhProperty);
      window.removeEventListener('orientationchange', setVhProperty);
    };
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    // Check if this account has been marked as deleted
    if (isAuth && userEmail) {
      try {
        const deletedAccounts = JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');

        // Only consider the account deleted if it's still in the deleted accounts list
        // If it's been reactivated through the registration process, the email would have been
        // removed from this list already
        if (deletedAccounts.includes(userEmail)) {
          console.warn('Detected login with previously deleted account:', userEmail);
          // Force logout
          logoutUser();
          // Display message
          setTimeout(() => {
            toast({
              title: "Account Deleted",
              description: "This account has been deleted. Please create a new account to continue.",
              variant: "destructive",
            });
          }, 1000); // Slight delay to ensure toast system is ready
          return;
        }
      } catch (error) {
        console.error('Error checking for deleted accounts:', error);
      }
    }

    // If authenticated, synchronize tier with backend
    if (isAuth && token) {
      synchronizeTier().catch(error => {
        console.error('Background tier synchronization failed:', error);
      });
    }
  }, []);

  // Define public paths that don't require authentication
  const publicPaths = ['/profile', '/ai-bot', '/forgot-password', '/reset-password', '/about', '/contact', '/doctor-portal'];

  return (
    <>
      {loading ? (
        <LoadingScreen onFinished={() => setLoading(false)} />
      ) : (
        <Router>
          <Navbar />
          <div className="relative flex min-h-screen flex-col">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={<Profile />} />
                <Route path="/ai-bot" element={<AIBot />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                {/* Protected Routes */}
                <Route path="/health-report" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <HealthReport />
                  </ProtectedRoute>
                } />
                <Route path="/nutrition" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <Nutrition />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <About />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/doctor-finder" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <DoctorFinder />
                  </ProtectedRoute>
                } />
                <Route path="/doctor/:id" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <DoctorDetails />
                  </ProtectedRoute>
                } />
                {// Temporarily disabled Doctor Portal
                  <Route path="/doctor-portal" element={
                    <ProtectedRoute publicPaths={publicPaths}>
                      <DoctorPortal />
                    </ProtectedRoute>
                  } />
                }
                <Route path="/terms-privacy" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <TermsAndPrivacyPage />
                  </ProtectedRoute>
                } />
                <Route path="/contact" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <Contact />
                  </ProtectedRoute>
                } />
                <Route path="/changelog-demo" element={
                  <ProtectedRoute publicPaths={publicPaths}>
                    <ChangelogDemo />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
            <div id="modal-root" ref={modalRootRef}></div>
            <UpdateNotification />
          </div>
          <Analytics /> {/* Vercel Analytics component */}
          <SpeedInsights /> {/* Vercel Speed Insights component */}
        </Router>
      )}
    </>
  );
}

export default App;
