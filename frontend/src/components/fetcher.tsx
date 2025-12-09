import React, { useState, useEffect, createContext, useContext } from 'react';

interface appResponse {
    message: string;
    users: appUsers[];
}

interface appUsers {
    _id: string;
    name: string;
    age: number;
    city: string;
    username: string;
}

interface UseFetchUserDataReturn {
    userData: appUsers[];
    userLoading: boolean;
    userError: string | null;
}

interface UseFetchGreetingReturn {
    data: appResponse | null;
    loading: boolean;
    error: string | null;
}

/**
 * Custom hook to fetch greeting data from the /api/greeting endpoint
 * @returns Object containing data, loading state, and error state
 */
export const useFetchGreeting = (): UseFetchGreetingReturn => {
    const [data, setData] = useState<appResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the relative path to the API endpoint.
                // In the Docker Compose setup, the React dev server will proxy this
                // request to the Express server. In production, the Express server serves
                // the client and handles the API route.
                const response = await fetch('/api/greeting');
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const result: appResponse = await response.json();
                setData(result);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // The empty dependency array ensures this runs only once on mount

    return { data, loading, error };
};

/**
 * Custom hook to fetch user data from the /api/getUsers endpoint
 * @returns Object containing userData array, loading state, and error state
 */
export const useFetchUserData = (): UseFetchUserDataReturn => {
    const [userData, setUserData] = useState<appUsers[]>([]);
    const [userLoading, setUserLoading] = useState<boolean>(true);
    const [userError, setUserError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Use the relative path to the API endpoint.
                // In the Docker Compose setup, the React dev server will proxy this
                // request to the Express server. In production, the Express server serves
                // the client and handles the API route.
                const response = await fetch('/api/getUsers');
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const result: appResponse = await response.json();
                console.log(result);
                setUserData(result.users);
            } catch (e: any) {
                setUserError(e.message);
            } finally {
                setUserLoading(false);
            }
        };

        fetchUserData();
    }, []); // The empty dependency array ensures this runs only once on mount

    return { userData, userLoading, userError };
};

interface SessionUser {
    id: string;
    username: string;
}

interface SessionResponse {
    loggedIn: boolean;
    user?: SessionUser;
}

interface UseSessionReturn {
    loggedIn: boolean;
    user: SessionUser | null;
    loading: boolean;
    error: string | null;
    refreshSession: () => void;
}

/**
 * Custom hook to check user session status
 * @returns Object containing loggedIn status, user data, loading state, error state, and refresh function
 */

// Create Context
const SessionContext = createContext<UseSessionReturn | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSession = async () => {
        try {
            const response = await fetch('/api/session');
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const result: SessionResponse = await response.json();
            setLoggedIn(result.loggedIn);
            setUser(result.user || null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSession();
    }, []);

    const refreshSession = async () => {
        setLoading(true);
        await fetchSession();
    };

    return (
        <SessionContext.Provider value={{ loggedIn, user, loading, error, refreshSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = (): UseSessionReturn => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
};

// Export types for use in other components
export type { appResponse, appUsers };
