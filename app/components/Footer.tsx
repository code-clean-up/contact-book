import { PropsWithChildren } from 'react';

export default function Footer({ children }: PropsWithChildren) {
  return <div className="text-center mt-4 text-gray-400">{children}</div>;
}
