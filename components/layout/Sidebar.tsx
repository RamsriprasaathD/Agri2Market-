import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  userRole: 'farmer' | 'buyer' | 'admin';
  activePath?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, activePath }) => {
  const farmerMenu = [
    { path: '/dashboard/farmer', label: 'Dashboard' },
    { path: '/products', label: 'My Products' },
    { path: '/analytics', label: 'Analytics' },
  ];

  const buyerMenu = [
    { path: '/dashboard/buyer', label: 'Dashboard' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/orders', label: 'My Orders' },
  ];

  const adminMenu = [
    { path: '/dashboard/admin', label: 'Dashboard' },
    { path: '/users', label: 'User Management' },
    { path: '/analytics', label: 'Analytics' },
  ];

  const menuItems = userRole === 'farmer' ? farmerMenu : userRole === 'buyer' ? buyerMenu : adminMenu;

  return (
    <div className="w-64 bg-gray-50 min-h-screen border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Portal
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activePath === item.path
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
