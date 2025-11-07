import { describe, expect, it } from "vitest";
import { sortContacts } from "./sortContacts";

describe('sortContacts', () => {
    it('should return empty array if source array is empty', () => {
        const result = sortContacts([], false, 'name', 'asc');

        expect(result).toEqual([]);
    });
});
