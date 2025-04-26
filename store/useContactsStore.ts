import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Initial demo data
const initialContacts = [
  { id: '1', name: 'Alice Johnson', city: 'New York' },
  { id: '2', name: 'Bob Smith', city: 'Los Angeles' },
  { id: '3', name: 'Charlie Brown', city: 'Chicago' },
  { id: '4', name: 'David Williams', city: 'Houston' },
  { id: '5', name: 'Emma Davis', city: 'Phoenix' },
  { id: '6', name: 'Frank Miller', city: 'Philadelphia' },
  { id: '7', name: 'Grace Wilson', city: 'San Antonio' },
  { id: '8', name: 'Henry Moore', city: 'San Diego' },
  { id: '9', name: 'Isabella Garcia', city: 'Dallas' },
  { id: '10', name: 'Jack Martinez', city: 'San Jose' },
  { id: '11', name: 'Katherine Lee', city: 'Austin' },
  { id: '12', name: 'Liam Taylor', city: 'Jacksonville' },
  { id: '13', name: 'Megan Adams', city: 'San Francisco' },
  { id: '14', name: 'Noah Clark', city: 'Columbus' },
  { id: '15', name: 'Olivia Rodriguez', city: 'Fort Worth' },
  { id: '16', name: 'Patrick White', city: 'Charlotte' },
  { id: '17', name: 'Quinn Evans', city: 'Detroit' },
  { id: '18', name: 'Rachel Foster', city: 'El Paso' },
  { id: '19', name: 'Samuel Rivera', city: 'Memphis' },
  { id: '20', name: 'Tiffany Brooks', city: 'Boston' },
  { id: '21', name: 'Ulysses Hayes', city: 'Seattle' },
  { id: '22', name: 'Victoria Price', city: 'Denver' },
  { id: '23', name: 'William Hughes', city: 'Washington DC' },
  { id: '24', name: 'Xander Morgan', city: 'Nashville' },
  { id: '25', name: 'Yasmine Cooper', city: 'Baltimore' },
  { id: '26', name: 'Zachary Reed', city: 'Louisville' },
  { id: '27', name: 'Amelia Phillips', city: 'Portland' },
  { id: '28', name: 'Benjamin Scott', city: 'Oklahoma City' },
  { id: '29', name: 'Chloe Turner', city: 'Milwaukee' },
  { id: '30', name: 'Dominic Carter', city: 'Las Vegas' },
  { id: '31', name: 'Elena Sanchez', city: 'Albuquerque' },
  { id: '32', name: 'Felix Mitchell', city: 'Tucson' },
  { id: '33', name: 'Gabriella Perez', city: 'Fresno' },
  { id: '34', name: 'Harrison Kelly', city: 'Sacramento' },
  { id: '35', name: 'Ivy Nelson', city: 'Long Beach' },
  { id: '36', name: 'Julian Baker', city: 'Kansas City' },
  { id: '37', name: 'Kira Gonzalez', city: 'Mesa' },
  { id: '38', name: 'Leo Edwards', city: 'Atlanta' },
  { id: '39', name: 'Melissa Collins', city: 'Virginia Beach' },
  { id: '40', name: 'Nathan Stewart', city: 'Omaha' },
  { id: '41', name: 'Octavia Morris', city: 'Raleigh' },
  { id: '42', name: 'Preston Butler', city: 'Miami' },
  { id: '43', name: 'Quincy Bell', city: 'Oakland' },
  { id: '44', name: 'Rebecca Diaz', city: 'Minneapolis' },
  { id: '45', name: 'Spencer Woods', city: 'Tulsa' },
  { id: '46', name: 'Tessa Barnes', city: 'Cleveland' },
  { id: '47', name: 'Uriel Coleman', city: 'Wichita' },
  { id: '48', name: 'Vanessa Perry', city: 'Arlington' },
  { id: '49', name: 'Wesley Powell', city: 'New Orleans' },
  { id: '50', name: 'Ximena Ross', city: 'Bakersfield' },
  { id: '51', name: 'Yuri Watson', city: 'Tampa' },
  { id: '52', name: 'Zoe Gray', city: 'Honolulu' },
  { id: '53', name: 'Adrian James', city: 'Aurora' },
  { id: '54', name: 'Bianca Mills', city: 'Anaheim' },
  { id: '55', name: 'Carlos Fisher', city: 'Santa Ana' },
  { id: '56', name: 'Diana Howard', city: 'St. Louis' },
  { id: '57', name: 'Ethan Russell', city: 'Riverside' },
  { id: '58', name: 'Fiona Olson', city: 'Corpus Christi' },
  { id: '59', name: 'George Schmidt', city: 'Pittsburgh' },
  { id: '60', name: 'Hannah Warren', city: 'Lexington' },
];

// Create store with localStorage persistence
export const useContactsStore = create<ContactsState>()(
  persist(
    (set) => ({
      contacts: initialContacts,

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
