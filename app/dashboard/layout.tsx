'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiCompass, FiCalendar, FiUser, FiPlus } from 'react-icons/fi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const navItems = [
    { href: '/dashboard', icon: FiHome, label: 'Home' },
    { href: '/dashboard/explore', icon: FiCompass, label: 'Explore' },
    { href: '/dashboard/bookings', icon: FiCalendar, label: 'Bookings' },
    { href: '/dashboard/profile', icon: FiUser, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r-2 border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">DreamTrip</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg ${
                isActive(item.href) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="mr-3" size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <button className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
            <FiPlus className="mr-2" />
            New Trip
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 flex justify-around py-2 px-4">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className="flex flex-col items-center p-2 text-gray-700"
          >
            <item.icon 
              size={20} 
              className={isActive(item.href) ? 'text-indigo-600' : ''} 
            />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
