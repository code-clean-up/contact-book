import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_CONTACTS } from '../consts/demodata';

/**
 * Base contact structure
 */
export interface Contact {
  id: string;
  name: string;
  city: string;
}

/**
 * Complete store state and available operations
 */
interface ContactsState {
  // State properties
  contacts: Contact[];
  sortField: 'name' | 'city';
  sortDirection: 'asc' | 'desc';
  isSorting: boolean; // Controls whether to use original or sorted order
  currentPage: number;

  // Available operations
  addContact: (name: string, city: string) => void;
  updateContact: (id: string, name: string, city: string) => void;
  deleteContact: (id: string) => void;
  setSortField: (field: 'name' | 'city') => void;
  resetSorting: () => void;
  setPage: (page: number) => void;
}

// Create store with localStorage persistence
export const useContactsStore = create<ContactsState>()(
  persist(
    (set) => ({
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
      sortField: 'name',
      sortDirection: 'asc',
      isSorting: true,

      setSortField: (field) =>
        set((state) => ({
          isSorting: true,
          sortField: field,
          // Toggle direction if same field, otherwise default to ascending
          sortDirection:
            field === state.sortField ? (state.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc',
        })),

      resetSorting: () => set({ isSorting: false }),

      // Pagination
      currentPage: 1,
      setPage: (page) => set({ currentPage: page }),
    }),
    {
      name: 'contacts-storage',
    }
  )
);
