import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_CONTACTS } from '../consts/demodata';
import { StateCreator } from 'zustand';
import { sortContacts } from '../utils/sortContacts';
import { createSelector } from 'reselect';
import { CONTACTS_PER_PAGE } from '../consts/consts';

/**
 * Base contact structure
 */
export interface Contact {
  id: string;
  name: string;
  city: string;
}

export interface SortParam {
  field: 'name' | 'city';
  direction: 'asc' | 'desc';
}

/**
 * Complete store state and available operations
 */
export interface ContactsState {
  // State properties
  contacts: Contact[];
  sort: SortParam | null;
  currentPage: number;
  searchTerm: string;

  // Available operations
  addContact: (name: string, city: string) => void;
  updateContact: (id: string, name: string, city: string) => void;
  deleteContact: (id: string) => void;
  setSortField: (field: 'name' | 'city') => void;
  resetSorting: () => void;
  setSearchTerm: (searchTerm: string) => void;
  setPage: (page: number) => void;
}

const flipSort = (direction: 'asc' | 'desc') => (direction === 'asc' ? 'desc' : 'asc');

export const createContactsStore: StateCreator<ContactsState> = (set) => ({
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
        field: field,
        direction: field === state.sort?.field ? flipSort(state.sort.direction) : 'asc',
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
  persist(createContactsStore, {
    name: 'contacts-storage',
  })
);

const selectFilteredContacts = createSelector(
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

export const selectContacts = createSelector(
  selectFilteredContacts,
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

export const selectPagination = createSelector(
  selectFilteredContacts,
  (state: ContactsState) => state.currentPage,
  (state: ContactsState) => state.searchTerm,
  (filteredContacts, currentPage, searchTerm) => {
    const last = currentPage * CONTACTS_PER_PAGE;
    const first = last - CONTACTS_PER_PAGE;
    const total = filteredContacts.length;
    // Calculate total pages
    const totalPages = Math.ceil(total / CONTACTS_PER_PAGE);

    return {
      currentPage,
      first,
      last,
      total,
      totalPages,
      isFiltered: searchTerm.trim() !== '',
    }
  }
)