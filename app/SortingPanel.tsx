import { SortingButton } from './SortingButton';

type SortingPanelProps<T> = {
  field: T | undefined;
  direction: 'asc' | 'desc' | undefined;
  onSort: (field: T | undefined) => void;
  options: { name: T; text: string }[];
};

export const SortingPanel = <T extends string>({ field, direction, onSort, options }: SortingPanelProps<T>) => {
  console.log(field, direction);
  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <SortingButton
          key={option.name}
          onSort={onSort}
          direction={field === option.name ? direction : undefined}
          text={option.text}
          name={option.name}
        />
      ))}

      <button
        onClick={() => onSort(undefined)}
        className={
          field === undefined
            ? 'px-3 py-1 rounded-md text-sm font-medium bg-purple-600 text-white'
            : 'px-3 py-1 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
      >
        Reset
      </button>
    </div>
  );
};
