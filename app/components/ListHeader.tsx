import { PropsWithChildren } from 'react';

type ListHeaderProps = PropsWithChildren<{
  title: string;
}>;

export default function ListHeader({ children, title }: ListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center max-w-6xl mx-auto mb-6 px-2 space-y-4 sm:space-y-0">
      <h2 className="text-xl text-gray-300 font-medium">{title}</h2>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        {children}
      </div>
    </div>
  );
}
