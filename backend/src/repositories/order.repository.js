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

  async findAdminOrders({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } }) {
    return Order.find(filter)
      .populate('user', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countAdminOrders(filter = {}) {
    return Order.countDocuments(filter);
  }

  async findAdminById(orderIdentifier) {
    const isObjectId = mongoose.Types.ObjectId.isValid(orderIdentifier);
    const query = {
      $or: [
        ...(isObjectId ? [{ _id: orderIdentifier }] : []),
        { orderNumber: orderIdentifier },
      ],
    };
    return Order.findOne(query).populate('user', 'name email role');
  }

  async updateOrder(id, updateFields, session = null) {
    const options = { new: true, ...(session ? { session } : {}) };
    return Order.findByIdAndUpdate(id, updateFields, options).populate('user', 'name email role');
  }

  async getOrderStatistics() {
    const [stats] = await Order.aggregate([
      {
        $facet: {
          totalOrders: [{ $count: 'count' }],
          byStatus: [
            {
              $group: {
                _id: '$orderStatus',
                count: { $sum: 1 },
              },
            },
          ],
          deliveredRevenue: [
            { $match: { orderStatus: 'DELIVERED' } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
              },
            },
          ],
        },
      },
    ]);

    const totalOrders = stats.totalOrders[0]?.count || 0;
    const deliveredRevenue = Number((stats.deliveredRevenue[0]?.totalRevenue || 0).toFixed(2));

    const statusCounts = {
      PLACED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    if (stats.byStatus) {
      stats.byStatus.forEach((st) => {
        if (st._id && statusCounts[st._id] !== undefined) {
          statusCounts[st._id] = st.count;
        }
      });
    }

    return {
      totalOrders,
      statusCounts,
      deliveredRevenue,
    };
  }
}

export const orderRepository = new OrderRepository();

