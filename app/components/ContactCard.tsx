import { Contact } from '@/store/useContactsStore';
import { useState } from 'react';

type ContactViewProps = {
  contact: Contact;
  onStartEdit: (contact: Contact) => void;
};

type ContactFormProps = {
  contact: Contact;
  onContactDelete: (id: string) => void;
  onCancelEditing: () => void;
  onContactSave: (id: string, name: string, city: string) => void;
};

type ContactCardProps = {
  contact: Contact;
  isVisible?: boolean;
  transitionDelay?: number;
  onContactDelete: (id: string) => void;
  onContactSave: (id: string, name: string, city: string) => void;
};

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

function ContactForm({
  contact,
  onContactDelete,
  onCancelEditing,
  onContactSave,
}: ContactFormProps) {
  function handleSubmit(data: FormData) {
    const trimmedName = String(data.get('name') ?? '').trim();
    const trimmedCity = String(data.get('city') ?? '').trim();

    if (!trimmedName || !trimmedCity) return;

    onContactSave(contact.id, trimmedName, trimmedCity);
  }

  return (
    <form action={handleSubmit}>
      <input
        type="text"
        name="name"
        defaultValue={contact.name}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md mb-3 focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-100"
      />
      <input
        type="text"
        name="city"
        defaultValue={contact.city}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-100"
      />
      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={function () {
            onContactDelete(contact.id);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center shadow-sm cursor-pointer"
        >
          Delete
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancelEditing}
            className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-600 transition-colors shadow-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ContactCard({
  isVisible,
  contact,
  transitionDelay,
  onContactDelete,
  onContactSave,
}: ContactCardProps) {
  const [isEditing, setEditing] = useState(false);
  function startEditing() {
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  function saveChanges(id: string, name: string, city: string) {
    onContactSave(id, name, city);
    setEditing(false);
  }

  return (
    <div
      className={
        'bg-gray-800 shadow-md rounded-xl p-5 text-gray-100 transition-all duration-500 border border-gray-700 hover:shadow-lg hover:border-gray-600 ' +
        (isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4')
      }
      style={{ transitionDelay: `${transitionDelay}ms` }}
    >
      {isEditing ? (
        <ContactForm
          contact={contact}
          onCancelEditing={cancelEditing}
          onContactDelete={onContactDelete}
          onContactSave={saveChanges}
        />
      ) : (
        <ContactView contact={contact} onStartEdit={startEditing} />
      )}
    </div>
  );
}
