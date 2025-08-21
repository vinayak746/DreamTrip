import { FiSearch, FiPlus } from 'react-icons/fi';

export type TripType = 'adventure' | 'leisure' | 'business' | 'family' | 'solo' | 'other';

interface SearchAndFilterProps {
  searchQuery: string;
  tripTypeFilter: TripType | 'all';
  onSearchChange: (query: string) => void;
  onFilterChange: (type: TripType | 'all') => void;
  onCreateNew: () => void;
}

export default function SearchAndFilter({
  searchQuery,
  tripTypeFilter,
  onSearchChange,
  onFilterChange,
  onCreateNew,
}: SearchAndFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search destinations or activities..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={tripTypeFilter}
          onChange={(e) => onFilterChange(e.target.value as TripType | 'all')}
        >
          <option value="all">All Trip Types</option>
          <option value="adventure">Adventure</option>
          <option value="leisure">Leisure</option>
          <option value="business">Business</option>
          <option value="family">Family</option>
          <option value="solo">Solo</option>
          <option value="other">Other</option>
        </select>
        <button
          onClick={onCreateNew}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiPlus className="h-4 w-4 mr-2" />
          New Itinerary
        </button>
      </div>
    </div>
  );
}
