'use client';
import { useId, useState, useEffect, useRef } from 'react';
import { Contact, useContactsStore } from '../store/useContactsStore';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  // Router for URL manipulation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Flag to prevent infinite updates
  const isUpdatingFromURL = useRef(false);
  const isFirstMount = useRef(true);

  // Generate unique IDs for form inputs
  const nameInputId = useId();
  const cityInputId = useId();
  const searchInputId = useId();

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
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');

  // Pagination constants
  const contactsPerPage = 9;

  // Add tooltip state
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<number | null>(null);

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

  function nextPage() {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  }

  // Form handlers
  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedCity = city.trim();

    if (!trimmedName || !trimmedCity) return;

    addContact(trimmedName, trimmedCity);

    setName('');
    setCity('');
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

  // Function to handle URL copying with tooltip
  function handleShare() {
    // Copy URL to clipboard
    navigator.clipboard.writeText(window.location.href);

    // Show tooltip
    setShowTooltip(true);

    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Hide tooltip after 2 seconds
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, 2000) as unknown as number;
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const pageButtons = [];
  for (let i = 0; i < totalPages; i++) {
    const pageNumber = i + 1;
    pageButtons.push(
      <button
        key={pageNumber}
        onClick={function () {
          paginate(pageNumber);
        }}
        className={
          currentPage === pageNumber
            ? 'w-10 h-10 flex justify-center items-center rounded-md text-sm bg-purple-600 text-white cursor-pointer'
            : 'w-10 h-10 flex justify-center items-center rounded-md text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 cursor-pointer'
        }
      >
        {pageNumber}
      </button>
    );
  }

  const contactCards = [];
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
    } else {
      cardContent = (
        <>
          <h2 className="text-xl font-semibold text-gray-100 mb-1">{contact.name}</h2>
          <p className="text-gray-400 mb-4">{contact.city}</p>
          <div className="flex justify-end mt-2">
            <button
              onClick={function () {
                startEditing(contact);
              }}
              className="border border-purple-400 text-purple-400 px-4 py-2 rounded-md text-sm font-medium hover:border-purple-300 hover:text-purple-300 transition-colors shadow-sm cursor-pointer"
            >
              Edit
            </button>
          </div>
        </>
      );
    }

    contactCards.push(
      <div
        key={contact.id}
        className={
          'bg-gray-800 shadow-md rounded-xl p-5 text-gray-100 transition-all duration-500 border border-gray-700 hover:shadow-lg hover:border-gray-600'
        }
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 pb-20 sm:p-20">
      <h1 className="mb-6 w-full text-center text-4xl font-bold text-gray-100">Contact Book</h1>

      <div className="mx-auto max-w-md w-full mb-12">
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700"
        >
          <div className="mb-4">
            <label htmlFor={nameInputId} className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              id={nameInputId}
              type="text"
              value={name}
              onChange={function (e) {
                setName(e.target.value);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
              placeholder="Enter name"
            />
          </div>

          <div className="mb-5">
            <label htmlFor={cityInputId} className="block text-sm font-medium text-gray-300 mb-1">
              City
            </label>
            <input
              id={cityInputId}
              type="text"
              value={city}
              onChange={function (e) {
                setCity(e.target.value);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-100 placeholder-gray-400"
              placeholder="Enter city"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors font-medium cursor-pointer"
          >
            Add Contact
          </button>
        </form>
      </div>

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

      {processedContacts.length === 0 && searchTerm && (
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
          <div className="flex justify-center items-center mt-10 gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={
                currentPage === 1
                  ? 'px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 cursor-pointer'
              }
            >
              Previous
            </button>

            <div className="flex gap-2">{pageButtons}</div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={
                currentPage === totalPages
                  ? 'px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'px-4 py-2 rounded-md text-sm bg-gray-700 text-gray-200 hover:bg-gray-600 cursor-pointer'
              }
            >
              Next
            </button>
          </div>

          <div className="text-center mt-4 text-gray-400">
            Page {currentPage} of {totalPages} • Showing {indexOfFirstContact + 1}-
            {Math.min(indexOfLastContact, processedContacts.length)} of {processedContacts.length}
            {searchTerm ? ' filtered' : ''} contacts
          </div>
        </>
      )}

      <div className="text-center mt-6">
        <div className="relative inline-block">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 text-sm inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>

          {/* Tooltip that appears on successful copy */}
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-md shadow-md border border-gray-700 whitespace-nowrap animate-fade-in">
              Link copied to clipboard!
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-t-gray-800 border-l-transparent border-r-transparent"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, 10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  .animate-fade-in {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
