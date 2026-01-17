import { Contact } from '@/app/store/useContactsStore';
import ContactCard from './ContactCard';

type ContactsListProps = {
  contacts: Contact[];
  onContactDelete: (id: string) => void;
  onContactSave: (id: string, name: string, city: string) => void;
};

export default function ContactsList({
  contacts,
  onContactDelete,
  onContactSave,
}: ContactsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
      {contacts.map((contact, index) => (
        <ContactCard
          key={contact.id}
          className={'transition-all duration-500'}
          contact={contact}
          onContactDelete={onContactDelete}
          onContactSave={onContactSave}
        />
      ))}
    </div>
  );
}
