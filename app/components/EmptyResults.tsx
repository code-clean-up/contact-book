import { PropsWithChildren } from 'react';

type EmptyResults = PropsWithChildren<{
  onSearchClean: () => void;
}>;

export default function EmptyResults({ onSearchClean: onSearchClear, children }: EmptyResults) {
  return (
    <div className="text-center py-10">
      <p className="text-gray-400 text-lg">{children}</p>
      <button
        onClick={onSearchClear}
        className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
      >
        Clean search
      </button>
    </div>
  );
}
