import { Contact } from '@/store/useContactsStore';
import ContactCard from './ContactCard';

type ContactsListProps = {
  contacts: Contact[];
  visibleCards: { [key: string]: boolean };
  onContactDelete: (id: string) => void;
  onContactSave: (id: string, name: string, city: string) => void;
};

export default function ContactsList({
  contacts,
  visibleCards,
  onContactDelete,
  onContactSave,
}: ContactsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
      {contacts.map((contact, index) => (
        <ContactCard
          key={contact.id}
          className={
            'transition-all duration-500 ' +
            (visibleCards[contact.id]
              ? 'opacity-100 transform translate-y-0'
              : 'opacity-0 transform translate-y-4')
          }
          style={{ transitionDelay: `${index * 50}ms` }}
          contact={contact}
          onContactDelete={onContactDelete}
          onContactSave={onContactSave}
        />
      ))}
    </div>
  );
}
