'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Contact, useContactsStore } from '../store/useContactsStore';
import AddContact from './components/AddContact';
import ContactsList from './components/ContactsList';
import Loader from './components/Loader';
import Pager from './components/Pager';
import SearchField from './components/SearchField';
import Share from './components/Share';
import Sorter from './components/Sorter';

export default function Home() {
  // Router for URL manipulation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Flag to prevent infinite updates
  const isUpdatingFromURL = useRef(false);
  const isFirstMount = useRef(true);

  // Animation states for loading and appearance effects
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState<{ [key: string]: boolean }>({});

  // Get global states from Zustand store
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    sortField,
    sortDirection,
    isSorting,
    setSortField,
    resetSorting,
    currentPage,
    setPage,
  } = useContactsStore();

  // Initialize local form states with values from URL if available
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');

  // Pagination constants
  const contactsPerPage = 9;

  // Effect to sync URL parameters with application state - runs only once on mount
  useEffect(function () {
    if (isFirstMount.current) {
      isUpdatingFromURL.current = true;

      // Read parameters from URL
      const search = searchParams.get('search') || '';
      const sort = (searchParams.get('sort') as 'name' | 'city') || 'name';
      const direction = (searchParams.get('dir') as 'asc' | 'desc') || 'asc';
      const sorting = searchParams.get('sorting') !== 'false';
      const page = parseInt(searchParams.get('page') || '1', 10);

      // Update application state based on URL parameters
      setSearchTerm(search);

      if (sort === 'name' || sort === 'city') {
        if (sorting) {
          // Manually update the store to avoid double updates
          useContactsStore.setState({
            sortField: sort,
            sortDirection: direction,
            isSorting: true,
          });
        } else {
          useContactsStore.setState({ isSorting: false });
        }
      }

      // Set page if it's a valid number
      if (page >= 1) {
        useContactsStore.setState({ currentPage: page });
      }

      // Mark first mount as complete
      isFirstMount.current = false;

      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isUpdatingFromURL.current = false;
      }, 100);
    }
  }, []); // Run only once on mount

  // Function to update URL with current filters - only runs when state changes from user action
  function updateURLParams() {
    // Skip URL update if we're currently updating from URL
    if (isUpdatingFromURL.current) return;

    const params = new URLSearchParams();

    // Only add parameters that have values
    if (searchTerm) {
      params.set('search', searchTerm);
    }

    if (isSorting) {
      params.set('sort', sortField);
      params.set('dir', sortDirection);
      params.set('sorting', 'true');
    } else {
      params.set('sorting', 'false');
    }

    // Always include page number
    params.set('page', currentPage.toString());

    // Update URL without refreshing page
    router.push('?' + params.toString(), { scroll: false });
  }

  // Effect to update URL when filters change - but only after first mount
  useEffect(
    function () {
      if (!isFirstMount.current && !isUpdatingFromURL.current) {
        updateURLParams();
      }
    },
    [searchTerm, sortField, sortDirection, isSorting, currentPage]
  );

  // Filter contacts based on search term
  const filteredContacts = [];
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

  // Create a processed copy of filtered contacts for sorting
  let processedContacts = [];
  for (let i = 0; i < filteredContacts.length; i++) {
    processedContacts.push(filteredContacts[i]);
  }

  // Apply sorting if enabled
  if (isSorting) {
    // Bubble sort implementation remains unchanged
    for (let i = 0; i < processedContacts.length; i++) {
      for (let j = 0; j < processedContacts.length - i - 1; j++) {
        const fieldA = processedContacts[j][sortField].toLowerCase();
        const fieldB = processedContacts[j + 1][sortField].toLowerCase();

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
          const temp: Contact = processedContacts[j];
          processedContacts[j] = processedContacts[j + 1];
          processedContacts[j + 1] = temp;
        }
      }
    }
  }

  // Update search term and page
  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search change
  }

  // Calculate pagination values
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;

  // Get current page contacts
  const currentContacts: any[] = [];
  for (let i = indexOfFirstContact; i < indexOfLastContact && i < processedContacts.length; i++) {
    currentContacts.push(processedContacts[i]);
  }

  // Calculate total pages
  const totalPages = Math.ceil(processedContacts.length / contactsPerPage);

  // Pagination handlers
  function paginate(pageNumber: number) {
    setPage(pageNumber);
  }

  function saveChanges(id: string, name: string, city: string) {
    updateContact(id, name, city);
  }

  // Animation effect - updated to avoid card jumping
  useEffect(
    function () {
      // Clear previous timeouts
      const timeouts: number[] = [];

      const loadingTimeout = setTimeout(function () {
        setIsLoading(false);

        // After loading is complete, make all cards visible at once
        setVisibleCards((prevState) => {
          const newVisibleCards: { [key: string]: boolean } = {};

          // Set all current contacts as visible
          for (let i = 0; i < currentContacts.length; i++) {
            newVisibleCards[currentContacts[i].id] = true;
          }

          return newVisibleCards;
        });
      }, 300) as unknown as number; // Explicitly cast to number

      timeouts.push(loadingTimeout);

      // Cleanup function
      return function () {
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    },
    [currentPage, searchTerm, sortField, sortDirection, isSorting]
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8 pb-20 sm:p-20">
      <h1 className="mb-6 w-full text-center text-4xl font-bold text-gray-100">Contact Book</h1>

      <AddContact onContactAdd={addContact} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center max-w-6xl mx-auto mb-6 px-2 space-y-4 sm:space-y-0">
        <h2 className="text-xl text-gray-300 font-medium">Contacts</h2>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <SearchField
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search contacts..."
          />

          <Sorter
            options={[
              { name: 'name', label: 'Name' },
              { name: 'city', label: 'City' },
            ]}
            field={sortField}
            direction={sortDirection}
            setSortField={setSortField}
            resetSorting={resetSorting}
          />
        </div>
      </div>

      {isLoading && <Loader>Loading contacts...</Loader>}

      {!isLoading && processedContacts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-lg">No contacts found matching "{searchTerm}"</p>
          <button
            onClick={function () {
              setSearchTerm('');
            }}
            className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}

      <ContactsList
        contacts={currentContacts}
        visibleCards={visibleCards}
        onContactDelete={deleteContact}
        onContactSave={saveChanges}
      />

      {processedContacts.length > 0 && (
        <>
          <Pager currentPage={currentPage} totalPages={totalPages} goToPage={paginate} />

          <div className="text-center mt-4 text-gray-400">
            Page {currentPage} of {totalPages} • Showing {indexOfFirstContact + 1}-
            {Math.min(indexOfLastContact, processedContacts.length)} of {processedContacts.length}
            {searchTerm ? ' filtered' : ''} contacts
          </div>
        </>
      )}

      <Share />
    </div>
  );
}
