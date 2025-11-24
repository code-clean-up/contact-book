import { describe, expect, it } from "vitest";
import { sortContacts } from "./sortContacts";

describe('sortContacts', () => {
    it('should return empty array if source array is empty', () => {
        const result = sortContacts([], 'name', 'asc');

        expect(result).toEqual([]);
    });

    it('should sort by name ascending', () => {
        const input = [
            { id: '1', name: 'Bob', city: 'Munich' },
            { id: '2', name: 'alice', city: 'Berlin' },
            { id: '3', name: 'Charlie', city: 'Hamburg' },
        ];

        const result = sortContacts([...input], 'name', 'asc');

        expect(result.map(c => c.name)).toEqual(['alice', 'Bob', 'Charlie']);
    });

    it('should sort by name descending', () => {
        const input = [
            { id: '1', name: 'Bob', city: 'Munich' },
            { id: '2', name: 'alice', city: 'Berlin' },
            { id: '3', name: 'Charlie', city: 'Hamburg' },
        ];

        const result = sortContacts([...input], 'name', 'desc');

        expect(result.map(c => c.name)).toEqual(['Charlie', 'Bob', 'alice']);
    });

    it('should sort by city ascending', () => {
        const input = [
            { id: '1', name: 'Alice', city: 'Zurich' },
            { id: '2', name: 'Bob', city: 'amsterdam' },
            { id: '3', name: 'Charlie', city: 'Berlin' },
        ];

        const result = sortContacts([...input], 'city', 'asc');

        expect(result.map(c => c.city)).toEqual(['amsterdam', 'Berlin', 'Zurich']);
    });

    it('should sort by city descending', () => {
        const input = [
            { id: '1', name: 'Alice', city: 'Zurich' },
            { id: '2', name: 'Bob', city: 'amsterdam' },
            { id: '3', name: 'Charlie', city: 'Berlin' },
        ];

        const result = sortContacts([...input], 'city', 'desc');

        expect(result.map(c => c.city)).toEqual(['Zurich', 'Berlin', 'amsterdam']);
    });

    it('does not mutate the input array', () => {
        const input = [
            { id: '1', name: 'Bob', city: 'Munich' },
            { id: '2', name: 'alice', city: 'Berlin' },
        ];
        const snapshot = [...input];

        const result = sortContacts(input, 'name', 'asc');

        expect(input).toEqual(snapshot);   // unchanged
        expect(result).not.toBe(input);     // new array
    });

    it('sorts empty strings first in ascending by name (case-insensitive)', () => {
        const input = [
            { id: '1', name: '', city: 'Munich' },
            { id: '2', name: 'alice', city: 'Berlin' },
            { id: '3', name: 'Bob', city: 'Hamburg' },
        ];

        const result = sortContacts(input, 'name', 'asc');

        expect(result.map(c => c.name)).toEqual(['', 'alice', 'Bob']);
    });
});

