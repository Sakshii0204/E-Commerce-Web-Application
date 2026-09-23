import { User } from '../models/User.js';

export const userRepository = {
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  },

  async findById(id) {
    return User.findById(id).exec();
  },

  async create(userData) {
    const user = new User(userData);
    return user.save();
  },

  async count(filter = {}) {
    return User.countDocuments(filter).exec();
  }
};
