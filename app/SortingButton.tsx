type SortingButtonProps<T> = {
  onSort: (field: T) => void;
  direction: 'asc' | 'desc' | undefined;
  text: string;
  name: T;
};

export const SortingButton = <T,>({ onSort, direction, text, name }: SortingButtonProps<T>) => {
  return (
    <button
      onClick={function () {
        onSort(name);
      }}
      className={
        direction
          ? 'px-3 py-1 rounded-md text-sm font-medium flex items-center bg-purple-600 text-white'
          : 'px-3 py-1 rounded-md text-sm font-medium flex items-center bg-gray-700 text-gray-300 hover:bg-gray-600'
      }
    >
      {text}
      {direction && <span className="ml-2">{direction === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );
};
