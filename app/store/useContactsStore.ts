import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_CONTACTS } from '../consts/demodata';
import { createSelector } from 'reselect';
import { sortContacts } from '../utils/sortContacts';
import { CONTACTS_PER_PAGE } from '../consts/consts';

/**
 * Base contact structure
 */
export interface Contact {
  id: string;
  name: string;
  city: string;
}

export interface SortState {
  field: 'name' | 'city';
  direction: 'asc' | 'desc';
}

/**
 * Complete store state and available operations
 */
export interface ContactsState {
  // State properties
  contacts: Contact[];
  sort: SortState | null;
  currentPage: number;
  searchTerm: string;

  // Available operations
  addContact: (name: string, city: string) => void;
  updateContact: (id: string, name: string, city: string) => void;
  deleteContact: (id: string) => void;
  setSortField: (field: 'name' | 'city') => void;
  resetSorting: () => void;
  setPage: (page: number) => void;
  setSearchTerm: (value: string) => void;
}

function flipSortDirection(value: 'asc' | 'desc') {
  return value === 'asc' ? 'desc' : 'asc';
}

export const contactsStateCreator: StateCreator<ContactsState> = (set) => ({
  contacts: DEMO_CONTACTS,

  // CRUD operations
  addContact: (name, city) =>
    set((state) => ({
      contacts: [{ id: `${Date.now()}`, name, city }, ...state.contacts],
    })),

  updateContact: (id, name, city) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.id === id ? { ...contact, name, city } : contact
      ),
    })),

  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact.id !== id),
    })),

  // Sorting functionality
  sort: { field: 'name', direction: 'asc' },

  setSortField: (field) =>
    set((state) => ({
      sort: {
        field,
        direction: field === state.sort?.field ? flipSortDirection(state.sort.direction) : 'asc',
      },
    })),

  resetSorting: () => set({ sort: null }),

  // Pagination
  currentPage: 1,
  setPage: (page) => set({ currentPage: page }),

  searchTerm: '',
  setSearchTerm: (searchTerm) => set({ searchTerm }),
});

// Create store with localStorage persistence
export const useContactsStore = create<ContactsState>()(
  persist(
    contactsStateCreator,
    {
      name: 'contacts-storage',
    }
  )
);

const getFilteredContacts = createSelector(
  (state: ContactsState) => state.contacts,
  (state: ContactsState) => state.searchTerm,
  (contacts, searchTerm) => {
    const filteredContacts: Contact[] = [];
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      if (!searchTerm) {
        filteredContacts.push(contact);
      } else {
        const search = searchTerm.toLowerCase();
        const nameMatch = contact.name.toLowerCase().indexOf(search) !== -1;
        const cityMatch = contact.city.toLowerCase().indexOf(search) !== -1;
        if (nameMatch || cityMatch) {
          filteredContacts.push(contact);
        }
      }
    }

    return filteredContacts;
  }
)

// Derived state / Computed state
export const getContacts = createSelector(
  getFilteredContacts,
  (state: ContactsState) => state.sort,
  (state: ContactsState) => state.currentPage,
  (filteredContacts, sort, currentPage) => {
    // Create a processed copy of filtered contacts for sorting
    const processedContacts = sort
      ? sortContacts(filteredContacts, sort.field, sort.direction)
      : filteredContacts;

    const indexOfLastContact = currentPage * CONTACTS_PER_PAGE;
    const indexOfFirstContact = indexOfLastContact - CONTACTS_PER_PAGE;

    const slicedContacts = processedContacts.slice(indexOfFirstContact, indexOfLastContact);

    return slicedContacts;
  }
);

export const getPagination = createSelector(
  getFilteredContacts,
  (state: ContactsState) => state.currentPage,
  (state: ContactsState) => state.searchTerm,
  (filteredContacts, currentPage, searchTerm) => {
    const last = currentPage * CONTACTS_PER_PAGE;
    const first = last - CONTACTS_PER_PAGE;
    const total = filteredContacts.length;
    const totalPages = Math.ceil(total / CONTACTS_PER_PAGE);

    return {
      currentPage,
      last,
      first,
      isFiltered: searchTerm.trim() !== '',
      total,
      totalPages,
    }
  }
)