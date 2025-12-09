import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewRoutePage from './pages/newRoute.tsx';
import Home from './pages/home.tsx';
import Dashboard from './pages/dashboard.tsx';
import NavBar, { RouteConfig } from './components/NavBar.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { useSession, SessionProvider } from './components/fetcher.tsx';

// Define route configuration
const routes: RouteConfig[] = [
  { path: "/", label: "Home", element: <Home /> },
  { path: "/new-route", label: "New Route", element: <NewRoutePage />, guestOnly: true },
  { path: "/dashboard", label: "Dashboard", element: <Dashboard />, requireAuth: true }
];

const AppContent: React.FC = () => {
  const { loggedIn, loading } = useSession();

  const filteredRoutes = routes.filter(route => {
    if (route.requireAuth && !loggedIn) return false;
    if (route.guestOnly && loggedIn) return false;
    return true;
  });

  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <BrowserRouter>
      <NavBar routes={filteredRoutes} />
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute
                requireAuth={route.requireAuth}
                guestOnly={route.guestOnly}
              >
                {route.element}
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
};

export default App;