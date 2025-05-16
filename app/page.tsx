'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Contact, useContactsStore } from '../store/useContactsStore';
import AddContact from './components/AddContact';
import ContactCard from './components/ContactCard';
import Pager from './components/Pager';
import Share from './components/Share';

export default function Home() {
  // Router for URL manipulation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Flag to prevent infinite updates
  const isUpdatingFromURL = useRef(false);
  const isFirstMount = useRef(true);

  // Generate unique IDs for form inputs
  const searchInputId = useId();

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');

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
  function handleSearchChange(e: { target: { value: any } }) {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
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

  function startEditing(contact: Contact) {
    setEditingId(contact.id);
    setEditName(contact.name);
    setEditCity(contact.city);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function saveChanges(id: string) {
    const trimmedName = editName.trim();
    const trimmedCity = editCity.trim();

    if (!trimmedName || !trimmedCity) return;

    updateContact(id, trimmedName, trimmedCity);

    setEditingId(null);
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

  const contactCards = [];
  if (!isLoading) {
    for (let i = 0; i < currentContacts.length; i++) {
      const contact = currentContacts[i];
      const index = i;

      let cardContent;
      if (editingId === contact.id) {
        cardContent = (
          <>
            <input
              type="text"
              value={editName}
              onChange={function (e) {
                setEditName(e.target.value);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md mb-3 focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-100"
            />
            <input
              type="text"
              value={editCity}
              onChange={function (e) {
                setEditCity(e.target.value);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md mb-4 focus:outline-none focus:ring-1 focus:ring-purple-500 text-gray-100"
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={function () {
                  deleteContact(contact.id);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center shadow-sm cursor-pointer"
              >
                <span>Delete</span>
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={cancelEditing}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={function () {
                    saveChanges(contact.id);
                  }}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-600 transition-colors shadow-sm cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        );
      }

      contactCards.push(
        <ContactCard
          key={contact.id}
          isVisible={visibleCards[contact.id]}
          transitionDelay={index * 50}
          contact={contact}
          onStartEdit={startEditing}
          isEditing={editingId === contact.id}
        >
          {cardContent}
        </ContactCard>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 pb-20 sm:p-20">
      <h1 className="mb-6 w-full text-center text-4xl font-bold text-gray-100">Contact Book</h1>

      <AddContact onContactAdd={addContact} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center max-w-6xl mx-auto mb-6 px-2 space-y-4 sm:space-y-0">
        <h2 className="text-xl text-gray-300 font-medium">Contacts</h2>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              id={searchInputId}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search contacts..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={function () {
                  setSearchTerm('');
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={function () {
                setSortField('name');
              }}
              className={
                isSorting && sortField === 'name'
                  ? 'px-3 py-1 rounded-md text-sm font-medium flex items-center bg-purple-600 text-white'
                  : 'px-3 py-1 rounded-md text-sm font-medium flex items-center bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            >
              Name
              {isSorting && sortField === 'name' && (
                <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>

            <button
              onClick={function () {
                setSortField('city');
              }}
              className={
                isSorting && sortField === 'city'
                  ? 'px-3 py-1 rounded-md text-sm font-medium flex items-center bg-purple-600 text-white'
                  : 'px-3 py-1 rounded-md text-sm font-medium flex items-center bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            >
              City
              {isSorting && sortField === 'city' && (
                <span className="ml-2">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>

            <button
              onClick={resetSorting}
              className={
                !isSorting
                  ? 'px-3 py-1 rounded-md text-sm font-medium bg-purple-600 text-white'
                  : 'px-3 py-1 rounded-md text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="text-gray-400 mt-2">Loading contacts...</p>
        </div>
      )}

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
        {contactCards}
      </div>

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
