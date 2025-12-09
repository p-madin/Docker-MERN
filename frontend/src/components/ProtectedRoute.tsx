import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from './fetcher.tsx';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    guestOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth, guestOnly }) => {
    const { loggedIn, loading } = useSession();

    if (loading) {
        return <div>Loading session...</div>;
    }

    if (requireAuth && !loggedIn) {
        return <Navigate to="/" replace />;
    }

    if (guestOnly && loggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
