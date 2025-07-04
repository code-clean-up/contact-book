import { PropsWithChildren } from 'react';

export default function Title({ children }: PropsWithChildren) {
  return <h1 className="mb-6 w-full text-center text-4xl font-bold text-gray-100">{children}</h1>;
}
