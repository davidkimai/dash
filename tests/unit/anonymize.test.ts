import { describe, it, expect } from 'vitest';
import { anonymizeEmail, createAnonymizedId } from '@/lib/utils/anonymize';

describe('Anonymization Utils', () => {
  describe('anonymizeEmail', () => {
    it('masks email correctly', () => {
      expect(anonymizeEmail('jason@example.com')).toBe('jas***@example.com');
    });

    it('handles short local part', () => {
      expect(anonymizeEmail('ab@test.com')).toBe('ab***@test.com');
    });

    it('handles single character local part', () => {
      expect(anonymizeEmail('a@b.com')).toBe('a***@b.com');
    });

    it('handles long email addresses', () => {
      expect(anonymizeEmail('verylongemailaddress@example.com')).toBe('ver***@example.com');
    });

    it('handles invalid email format', () => {
      expect(anonymizeEmail('notanemail')).toBe('***');
    });
  });

  describe('createAnonymizedId', () => {
    it('creates consistent anonymized IDs', () => {
      const id1 = createAnonymizedId('same@email.com');
      const id2 = createAnonymizedId('same@email.com');
      expect(id1).toBe(id2);
    });

    it('creates different IDs for different emails', () => {
      const id1 = createAnonymizedId('user1@example.com');
      const id2 = createAnonymizedId('user2@example.com');
      expect(id1).not.toBe(id2);
    });

    it('includes first 3 characters', () => {
      const id = createAnonymizedId('jason@example.com');
      expect(id.startsWith('jas')).toBe(true);
    });

    it('has correct length', () => {
      const id = createAnonymizedId('test@example.com');
      expect(id.length).toBe(9); // 3 chars prefix + 6 chars hash
    });
  });
});
