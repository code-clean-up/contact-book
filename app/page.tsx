'use client';
import { useState, useEffect, useRef } from 'react';
import { Contact, useContactsStore } from '../store/useContactsStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShareButton } from './ShareButton';
import { Pagination } from './Pagination';
import { AddContactForm } from './AddContactForm';
import { ContactsList } from './ContactsList';
import { EmptySearchResult } from './EmptySearchResult';
import { SearchField } from './SearchField';
import { SortingPanel } from './SortingPanel';

export default function Home() {
  // Router for URL manipulation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Flag to prevent infinite updates
  const isUpdatingFromURL = useRef(false);
  const isFirstMount = useRef(true);

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

  function saveChanges(contact: Contact) {
    updateContact(contact.id, contact.name, contact.city);
  }

  function sortBy(field: 'name' | 'city' | undefined) {
    if (!field) {
      resetSorting();
    } else {
      setSortField(field);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 pb-20 sm:p-20">
      <h1 className="mb-6 w-full text-center text-4xl font-bold text-gray-100">Contact Book</h1>

      <div className="mx-auto max-w-md w-full mb-12">
        <AddContactForm onContactAdded={addContact} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center max-w-6xl mx-auto mb-6 px-2 space-y-4 sm:space-y-0">
        <h2 className="text-xl text-gray-300 font-medium">Contacts</h2>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <SearchField searchTerm={searchTerm} onChange={handleSearchChange} />

          <SortingPanel
            field={isSorting ? sortField : undefined}
            direction={sortDirection}
            onSort={sortBy}
            options={[
              { name: 'name', text: 'Name' },
              { name: 'city', text: 'City' },
            ]}
          />
        </div>
      </div>

      {processedContacts.length === 0 && searchTerm && (
        <EmptySearchResult onReset={() => setSearchTerm('')}>
          No contacts found matching "{searchTerm}"
        </EmptySearchResult>
      )}

      <ContactsList
        contacts={currentContacts}
        deleteContact={deleteContact}
        saveChanges={saveChanges}
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageClick={setPage}>
        Page {currentPage} of {totalPages} • Showing {indexOfFirstContact + 1}-
        {Math.min(indexOfLastContact, processedContacts.length)} of {processedContacts.length}
        {searchTerm ? ' filtered' : ''} contacts
      </Pagination>

      <ShareButton />
    </div>
  );
}
