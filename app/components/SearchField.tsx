import { ChangeEvent, useId } from 'react';

type SearchFieldProps = {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function SearchField({ value, placeholder, onChange }: SearchFieldProps) {
  const searchInputId = useId();

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value.trim());
  }

  return (
    <div className="relative w-full sm:w-64">
      <input
        id={searchInputId}
        type="text"
        value={value}
        onChange={handleSearchChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
      />
      {value && (
        <button
          onClick={function () {
            onChange('');
          }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          ✕
        </button>
      )}
    </div>
  );
}
