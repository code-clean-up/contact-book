'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Contact, useContactsStore } from '../store/useContactsStore';
import AddContact from './components/AddContact';
import ContactsList from './components/ContactsList';
import EmptyResults from './components/EmptyResults';
import Footer from './components/Footer';
import ListHeader from './components/ListHeader';
import CardSkeleton from './components/CardSkeleton';
import Pager from './components/Pager';
import SearchField from './components/SearchField';
import Share from './components/Share';
import Sorter from './components/Sorter';
import Title from './components/Title';
import { sortContacts } from './utils/sortContacts';

export default function Home() {
  // Router for URL manipulation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Flag to prevent infinite updates
  const isUpdatingFromURL = useRef(false);
  const isFirstMount = useRef(true);

  // Animation states for loading and appearance effects
  const [isLoading, setIsLoading] = useState(true);

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

  // Update search term and page
  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search change
  }

  // Calculate pagination values
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;

  // Create a processed copy of filtered contacts for sorting
  const processedContacts = isSorting ?
    sortContacts(filteredContacts, sortField, sortDirection) :
    filteredContacts;

  const slicedContacts = processedContacts.slice(indexOfFirstContact, indexOfLastContact)

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
      const timeout = setTimeout(function () {
        setIsLoading(false);
      }, 600);
      return function () {
        clearTimeout(timeout);
      };
    },
    [currentPage, searchTerm, sortField, sortDirection, isSorting]
  );

  return (
    <>
      <Title>Contact Book</Title>

      <AddContact onContactAdd={addContact} />

      <ListHeader title="Contacts">
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
      </ListHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-6">
          {Array.from({ length: contactsPerPage }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : processedContacts.length === 0 ? (
        <EmptyResults
          onSearchClean={function () {
            setSearchTerm('');
          }}
        >
          No contacts found matching "{searchTerm}"
        </EmptyResults>
      ) : (
        <ContactsList
          contacts={slicedContacts}
          onContactDelete={deleteContact}
          onContactSave={saveChanges}
        />
      )}

      {processedContacts.length > 0 && (
        <>
          <Pager currentPage={currentPage} totalPages={totalPages} goToPage={paginate} />

          <Footer>
            Page {currentPage} of {totalPages} • Showing {indexOfFirstContact + 1}-
            {Math.min(indexOfLastContact, processedContacts.length)} of {processedContacts.length}
            {searchTerm ? ' filtered' : ''} contacts
          </Footer>
        </>
      )}

      <Share />
    </>
  );
}
