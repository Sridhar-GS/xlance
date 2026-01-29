import { describe, it, expect } from 'vitest';
import { formatCurrency, getInitials, validateEmail, validatePassword } from './helpers';

describe('Helper Functions', () => {
    describe('formatCurrency', () => {
        it('should format number to INR currency', () => {
            // The exact output might depend on the locale implementation in environment, 
            // but commonly it includes the symbol.
            const result = formatCurrency(1000);
            expect(result).toContain('1,000.00');
        });
    });

    describe('getInitials', () => {
        it('should return initials for a full name', () => {
            expect(getInitials('John Doe')).toBe('JD');
        });

        it('should return initials for a single name', () => {
            expect(getInitials('John')).toBe('J');
        });

        it('should return max 2 initials', () => {
            expect(getInitials('John Doe Smith')).toBe('JD');
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email', () => {
            expect(validateEmail('test@example.com')).toBe(true);
        });

        it('should invalidate incorrect email', () => {
            expect(validateEmail('test@example')).toBe(false);
            expect(validateEmail('test.com')).toBe(false);
        });
    });

    describe('validatePassword', () => {
        it('should return weak for very weak password', () => {
            const result = validatePassword('abc'); // sequential, only lowercase
            expect(result.isValid).toBe(false);
            expect(result.strength).toBe('Weak');
        });

        it('should return strong for complex password', () => {
            // >12 chars, Mixed Case, Special Char, Numbers
            const result = validatePassword('StrongP@ssw0rd123!');
            expect(result.strength).toBe('Strong');
        });
    });
});
