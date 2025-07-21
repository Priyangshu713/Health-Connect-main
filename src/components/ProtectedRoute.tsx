import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/api/auth';
import { toast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
    children: ReactNode;
    publicPaths?: string[];
}

const ProtectedRoute = ({ children, publicPaths = ['/profile', '/ai-bot'] }: ProtectedRouteProps) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    // Helper function to check if current path is in public paths
    const isPublicPath = () => {
        // Check if path is exactly in the publicPaths array
        if (publicPaths.includes(location.pathname) || location.pathname === '/') {
            return true;
        }

        // Check for paths with parameters (e.g., /reset-password/:token)
        return publicPaths.some(path =>
            location.pathname.startsWith(path) &&
            (location.pathname.length === path.length ||
                location.pathname[path.length] === '/')
        );
    };

    useEffect(() => {
        // Check authentication
        const auth = isAuthenticated();
        setIsAuth(auth);
        setIsLoading(false);

        // Show toast message if user is redirected
        if (!auth && !isPublicPath()) {
            toast({
                title: "Authentication Required",
                description: "Please sign in to access this page.",
                variant: "destructive",
            });
        }
    }, [location.pathname]); // publicPaths removed from dependency array as it doesn't change

    if (isLoading) {
        return null; // Or a loading spinner
    }

    // Allow access to public paths regardless of authentication status
    if (isPublicPath()) {
        return <>{children}</>;
    }

    // Redirect to profile page if not authenticated and trying to access a protected route
    if (!isAuth) {
        return <Navigate to="/profile" state={{ from: location }} replace />;
    }

    // Allow access to protected routes if authenticated
    return <>{children}</>;
};

export default ProtectedRoute; 