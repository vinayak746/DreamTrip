import { FiLogOut } from 'react-icons/fi';

interface DashboardHeaderProps {
  user: { email: string | null; displayName: string | null };
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">DreamTrip</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            {user.displayName || user.email?.split('@')[0]}
          </span>
          <button
            onClick={onLogout}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiLogOut className="h-4 w-4 mr-1" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
