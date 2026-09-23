import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';
import { generateToken } from '../utils/jwt.js';

export const authService = {
  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    // Explicitly enforce role as CUSTOMER to avoid privilege escalation
    const user = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'CUSTOMER'
    });

    const token = generateToken({
      userId: user.id,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  },

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Query user including password for verification
    const user = await userRepository.findByEmail(normalizedEmail, true);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user.id,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  },

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }
};
