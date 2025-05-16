import { Contact } from '@/store/useContactsStore';
import { PropsWithChildren } from 'react';

type ContactViewProps = {
  contact: Contact;
  onStartEdit: (contact: Contact) => void;
};

type ContactCardProps = PropsWithChildren<{
  isVisible?: boolean;
  isEditing?: boolean;
  transitionDelay?: number;
  contact: Contact;
  onStartEdit: (contact: Contact) => void;
}>;

function ContactView({ contact, onStartEdit }: ContactViewProps) {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-100 mb-1">{contact.name}</h2>
      <p className="text-gray-400 mb-4">{contact.city}</p>
      <div className="flex justify-end mt-2">
        <button
          onClick={function () {
            onStartEdit(contact);
          }}
          className="border border-purple-400 text-purple-400 px-4 py-2 rounded-md text-sm font-medium hover:border-purple-300 hover:text-purple-300 transition-colors shadow-sm cursor-pointer"
        >
          Edit
        </button>
      </div>
    </>
  );
}

export default function ContactCard({
  isVisible,
  isEditing,
  contact,
  transitionDelay,
  children,
  onStartEdit,
}: ContactCardProps) {
  return (
    <div
      className={
        'bg-gray-800 shadow-md rounded-xl p-5 text-gray-100 transition-all duration-500 border border-gray-700 hover:shadow-lg hover:border-gray-600 ' +
        (isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4')
      }
      style={{ transitionDelay: `${transitionDelay}ms` }}
    >
      {isEditing ? children : <ContactView contact={contact} onStartEdit={onStartEdit} />}
    </div>
  );
}
