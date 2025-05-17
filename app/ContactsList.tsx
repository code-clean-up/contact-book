import { Contact } from '@/store/useContactsStore';
import { ContactCard } from './ContactCard';

type ContactsListProps = {
  contacts: Contact[];
  deleteContact: (id: string) => void;
  saveChanges: (contact: Contact) => void;
};

export const ContactsList = ({ contacts, deleteContact, saveChanges }: ContactsListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
      {contacts.map((contact) => {
        return (
          <ContactCard
            key={contact.id}
            contact={contact}
            onDelete={function () {
              deleteContact(contact.id);
            }}
            onSave={saveChanges}
          />
        );
      })}
    </div>
  );
};
