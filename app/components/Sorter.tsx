import SortButton from './SortButton';

type Sorter<T extends string> = {
  field: T | null;
  direction: 'asc' | 'desc';
  options: { name: T; label: string }[];
  setSortField: (field: T) => void;
  resetSorting: () => void;
};

export default function Sorter<T extends string>({
  field,
  direction,
  options,
  setSortField,
  resetSorting,
}: Sorter<T>) {
  return (
    <div className="flex space-x-2">
      {options.map(({ name: value, label }) => (
        <SortButton
          key={value}
          name={value}
          direction={field === value ? direction : null}
          onClick={setSortField}
        >
          {label}
        </SortButton>
      ))}

      <button
        onClick={resetSorting}
        className={
          !field
            ? 'px-3 py-1 rounded-md text-sm font-medium bg-purple-600 text-white'
            : 'px-3 py-1 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
      >
        Reset
      </button>
    </div>
  );
}
