import { User } from './user.entity';
import { UserRole } from '../enums/userRole';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = 'test-id';
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.password = 'password123';
    user.role = UserRole.VIEWER;
    user.active = true;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    // Clear mock calls
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash the password', async () => {
      await user.hashPassword();

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(user.password).toBe('hashed_password');
    });

    it('should not hash the password if it is not set', async () => {
      user.password = '';

      await user.hashPassword();

      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(user.password).toBe('');
    });
  });

  describe('validatePassword', () => {
    it('should return true when password is valid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const isValid = await user.validatePassword('password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'password123');
      expect(isValid).toBe(true);
    });

    it('should return false when password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const isValid = await user.validatePassword('wrong_password');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrong_password',
        'password123',
      );
      expect(isValid).toBe(false);
    });
  });
});
