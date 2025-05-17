import { Contact } from '@/store/useContactsStore';
import { useState } from 'react';

type ContactCardProps = {
  contact: Contact;
  onDelete: (id: string) => void;
  onSave: (contact: Contact) => void;
};

export const ContactCard = ({ contact, onDelete, onSave }: ContactCardProps) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <div
      className={
        'bg-gray-800 shadow-md rounded-xl p-5 text-gray-100 transition-all duration-500 border border-gray-700 hover:shadow-lg hover:border-gray-600'
      }
    >
      {mode === 'view' ? (
        <ViewCard contact={contact} setMode={setMode} />
      ) : (
        <FormCard contact={contact} onSave={onSave} onDelete={onDelete} setMode={setMode} />
      )}
    </div>
  );
};

const ViewCard = ({
  contact,
  setMode,
}: {
  contact: Contact;
  setMode: (mode: 'view' | 'edit') => void;
}) => {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-100 mb-1">{contact.name}</h2>
      <p className="text-gray-400 mb-4">{contact.city}</p>
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={() => setMode('edit')}
          className="border border-purple-400 text-purple-400 px-4 py-2 rounded-md text-sm font-medium hover:border-purple-300 hover:text-purple-300 transition-colors shadow-sm cursor-pointer"
        >
          Edit
        </button>
      </div>
    </>
  );
};

type FormCardProps = {
  contact: Contact;
  onSave: (contact: Contact) => void;
  onDelete: (id: string) => void;
  setMode: (mode: 'view' | 'edit') => void;
};

const FormCard = ({ contact, onSave, onDelete, setMode }: FormCardProps) => {
  function handleSave(formData: FormData) {
    const trimmedName = String(formData.get('name')).trim();
    const trimmedCity = String(formData.get('city')).trim();

    if (!trimmedName || !trimmedCity) return;

    onSave({ id: contact.id, name: trimmedName, city: trimmedCity });

    setMode('view');
  }

  return (
    <form action={handleSave}>
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
            onDelete(contact.id);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center shadow-sm cursor-pointer"
        >
          <span>Delete</span>
        </button>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setMode('view')}
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
};
