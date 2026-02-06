'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AddContact from './components/AddContact';
import CardSkeleton from './components/CardSkeleton';
import ContactsList from './components/ContactsList';
import EmptyResults from './components/EmptyResults';
import Footer from './components/Footer';
import ListHeader from './components/ListHeader';
import Pager from './components/Pager';
import SearchField from './components/SearchField';
import Share from './components/Share';
import Sorter from './components/Sorter';
import Title from './components/Title';
import { CONTACTS_PER_PAGE } from './consts/consts';
import { selectContacts, selectPagination, useContactsStore } from './store/useContactsStore';

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
  const state = useContactsStore();
  const {
    sort,
    searchTerm,
    addContact,
    updateContact,
    deleteContact,
    setSortField,
    resetSorting,
    setPage,
    setSearchTerm,
  } = state;

  // Filter contacts based on search term
  const contacts = useContactsStore(selectContacts);
  const { total, totalPages, currentPage, first, last, isFiltered } =
    useContactsStore(selectPagination);

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
            sort: { field: sort, direction },
          });
        } else {
          useContactsStore.setState({ sort: null });
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

    if (sort) {
      params.set('sort', sort.field);
      params.set('dir', sort.direction);
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
    [searchTerm, sort, currentPage]
  );

  // Update search term and page
  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search change
  }

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
    [currentPage, searchTerm, sort]
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
          field={sort?.field}
          direction={sort?.direction}
          setSortField={setSortField}
          resetSorting={resetSorting}
        />
      </ListHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-6">
          {Array.from({ length: CONTACTS_PER_PAGE }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : total === 0 ? (
        <EmptyResults
          onSearchClean={function () {
            setSearchTerm('');
          }}
        >
          No contacts found matching "{searchTerm}"
        </EmptyResults>
      ) : (
        <ContactsList
          contacts={contacts}
          onContactDelete={deleteContact}
          onContactSave={saveChanges}
        />
      )}

      {total > 0 && (
        <>
          <Pager currentPage={currentPage} totalPages={totalPages} goToPage={paginate} />

          <Footer>
            Page {currentPage} of {totalPages} • Showing {first + 1}-{Math.min(last, total)} of{' '}
            {total}
            {isFiltered ? ' filtered' : ''} contacts
          </Footer>
        </>
      )}

      <Share />
    </>
  );
}
