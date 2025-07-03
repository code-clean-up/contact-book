type SortButtonProps<T extends string> = {
  name: T;
  direction: 'asc' | 'desc' | null;
  children: string;
  onClick: (name: T) => void;
};
export default function SortButton<T extends string>({
  name,
  direction,
  children,
  onClick,
}: SortButtonProps<T>) {
  return (
    <button
      onClick={function () {
        onClick(name);
      }}
      className={
        direction !== null
          ? 'px-3 py-1 rounded-md text-sm font-medium flex items-center bg-purple-600 text-white'
          : 'px-3 py-1 rounded-md text-sm font-medium flex items-center bg-gray-700 text-gray-300 hover:bg-gray-600'
      }
    >
      {children}
      {direction !== null && <span className="ml-2">{direction === 'asc' ? '↑' : '↓'}</span>}
    </button>
  );
}
