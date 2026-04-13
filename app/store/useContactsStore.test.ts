import { describe, expect, it } from "vitest";
import { create } from "zustand";
import { Contact, contactsStateCreator, getContacts } from "./useContactsStore";

const testContacts: Contact[] = [
    { city: 'Mexico', name: 'Alice', id: '1' },
    { city: 'Glasgow', name: 'Bob', id: '2' },
]

describe('userContactsStore', () => {
  it('should sort by name asc by default', () => {
    // Arrange
    const store = create(contactsStateCreator);
    store.setState({ contacts: testContacts })

    expect(store.getState().sort).toEqual({
      field: 'name',
      direction: 'asc'
    })

    expect(getContacts(store.getState()).slicedContacts).toEqual([
      { city: 'Mexico', name: 'Alice', id: '1' },
      { city: 'Glasgow', name: 'Bob', id: '2' },
    ])
  })

  // AAA
  it('should flip sort direction if we sort by the same param', () => {
    // Arrange
    const store = create(contactsStateCreator);
    store.setState({ contacts: testContacts })

    // Act
    store.getState().setSortField('name');
    // store.getState().setSearchTerm('Al');

    // Assert
    expect(store.getState().sort).toEqual({
      field: 'name',
      direction: 'desc'
    })
    expect(getContacts(store.getState()).slicedContacts).toEqual([
      { city: 'Glasgow', name: 'Bob', id: '2' },
      { city: 'Mexico', name: 'Alice', id: '1' },
    ])
  })

  it('should reset sort when user clicks reset', () => {
    // Arrange
    const store = create(contactsStateCreator);

    // Act
    store.getState().resetSorting();

    // Assert
    expect(store.getState().sort).toBeNull()
  })
});