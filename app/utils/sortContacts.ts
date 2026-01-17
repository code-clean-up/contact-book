import type { Contact } from '@/app/store/useContactsStore';

export function sortContacts(
  contacts: Contact[],
  sortField: 'name' | 'city',
  sortDirection: 'asc' | 'desc'
) {

  const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

  return [...contacts].sort((contactA, contactB): number => {
    const fieldA = contactA[sortField];
    const fieldB = contactB[sortField];
    const comparison = fieldA.localeCompare(fieldB, 'en');

    return comparison * directionMultiplier;
  })
}
