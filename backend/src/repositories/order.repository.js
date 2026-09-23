import mongoose from 'mongoose';
import { Order } from '../models/Order.js';

class OrderRepository {
  async create(orderData, session = null) {
    const options = session ? { session } : {};
    const order = new Order(orderData);
    return order.save(options);
  }

  async findByUserId(userId, { skip = 0, limit = 50 } = {}) {
    return Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countByUserId(userId) {
    return Order.countDocuments({ user: userId });
  }

  async findByIdForUser(orderIdentifier, userId) {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderIdentifier);
    const query = {
      user: userId,
      $or: [
        ...(isObjectId ? [{ _id: orderIdentifier }] : []),
        { orderNumber: orderIdentifier },
      ],
    };
    return Order.findOne(query);
  }
}

export const orderRepository = new OrderRepository();
