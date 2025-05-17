import { useId } from 'react';

export const SearchField = ({
  searchTerm,
  onChange,
}: {
  searchTerm: string;
  onChange: (value: string) => void;
}) => {
  const searchInputId = useId();

  return (
    <div className="relative w-full sm:w-64">
      <input
        id={searchInputId}
        type="text"
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search contacts..."
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
      />
      {searchTerm && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>
      )}
    </div>
  );
};
