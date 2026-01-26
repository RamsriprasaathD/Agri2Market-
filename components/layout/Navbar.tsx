import React from 'react';
import { Button } from '../ui/Button';

interface NavbarProps {
  user?: { name: string; role: string };
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Oilseed Marketplace</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  Welcome, {user.name} ({user.role})
                </span>
                <Button onClick={onLogout} variant="outline">
                  Logout
                </Button>
              </>
            ) : (
              <Button href="/login">Login</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
