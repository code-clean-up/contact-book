import { PropsWithChildren } from 'react';

type ContactCardProps = PropsWithChildren<{
  isVisible?: boolean;
  transitionDelay?: number;
}>;

export default function ContactCard({ isVisible, transitionDelay, children }: ContactCardProps) {
  return (
    <div
      className={
        'bg-gray-800 shadow-md rounded-xl p-5 text-gray-100 transition-all duration-500 border border-gray-700 hover:shadow-lg hover:border-gray-600 ' +
        (isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4')
      }
      style={{ transitionDelay: `${transitionDelay}ms` }}
    >
      {children}
    </div>
  );
}
