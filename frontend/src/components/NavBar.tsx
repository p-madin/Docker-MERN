import React from 'react';
import { Link } from 'react-router-dom';

export interface RouteConfig {
    path: string;
    label: string;
    element: React.ReactNode;
    requireAuth?: boolean;
    guestOnly?: boolean;
}

interface NavBarProps {
    routes: RouteConfig[];
}

const NavBar: React.FC<NavBarProps> = ({ routes }) => {
    return (
        <nav>
            <ul className="navbar-list">
                {routes.map((route) => (
                    <li key={route.path}>
                        <Link to={route.path} className="navbar-link">
                            {route.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default NavBar;
