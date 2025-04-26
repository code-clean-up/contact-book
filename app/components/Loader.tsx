import { PropsWithChildren } from 'react';

export default function Loader({ children }: PropsWithChildren) {
  return (
    <div className="text-center py-10">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      <p className="text-gray-400 mt-2">{children}</p>
    </div>
  );
}
