import { describe, expect, it } from 'vitest';
import { createContactsStore, selectContacts } from './useContactsStore';
import { create } from 'zustand';

describe('useContactsStore', () => {
  it('should be sorted by default', () => {
    const store = create(createContactsStore);
    expect(store.getState().sort);
  });

  it('should flip sort field', () => {
    const store = create(createContactsStore);
    store.getState().setSortField('name');
  });

  it('should change sort field', () => {
    // arrange
    const store = create(createContactsStore);
    store.setState({
      contacts: [
        { city: 'Santiago', name: 'Alice', id: '1' },
        { city: 'Mexico', name: 'Bob', id: '2' },
      ],
    });
    // act
    store.getState().setSortField('city');

    // assert
    expect(selectContacts(store.getState())).toEqual({
      total: 2,
      slicedContacts: [
        { city: 'Mexico', name: 'Bob', id: '2' },
        { city: 'Santiago', name: 'Alice', id: '1' },
      ],
    });
  });
});
