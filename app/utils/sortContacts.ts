import type { Contact } from '@/store/useContactsStore';

export function sortContacts(
  contacts: Contact[],
  sortField: 'name' | 'city',
  sortDirection: 'asc' | 'desc'
) {
  // Bubble sort implementation remains unchanged
  for (let i = 0; i < contacts.length; i++) {
    for (let j = 0; j < contacts.length - i - 1; j++) {
      const fieldA = contacts[j][sortField].toLowerCase();
      const fieldB = contacts[j + 1][sortField].toLowerCase();

      let shouldSwap = false;

      if (sortDirection === 'asc') {
        if (fieldA > fieldB) {
          shouldSwap = true;
        }
      } else {
        if (fieldA < fieldB) {
          shouldSwap = true;
        }
      }

      if (shouldSwap) {
        const temp: Contact = contacts[j];
        contacts[j] = contacts[j + 1];
        contacts[j + 1] = temp;
      }
    }
  }
  return contacts;
}
