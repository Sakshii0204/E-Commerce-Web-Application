import mongoose from 'mongoose';
import { orderRepository } from '../repositories/order.repository.js';
import { cartRepository } from '../repositories/cart.repository.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { calculateShipping } from '../utils/pricing.js';

import { User } from '../models/User.js';

const VALID_TRANSITIONS = {
  PLACED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const safeRegex = (str) => new RegExp(str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

class OrderService {
  async createOrder(userId, { shippingAddress, paymentMethod = 'COD' }) {

    // 1. Retrieve user's cart
    const cart = await cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty. Add items before checking out.', 400);
    }

    // 2. Fetch all products in cart
    const productIds = cart.items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map();
    products.forEach((p) => productMap.set(p._id.toString(), p));

    // 3. Strict validation: Every product must exist, be active, and have sufficient stock
    for (const item of cart.items) {
      const prod = productMap.get(item.product.toString());
      if (!prod) {
        throw new AppError('One or more products in your cart no longer exist.', 400);
      }
      if (!prod.isActive) {
        throw new AppError(`"${prod.name}" is no longer available. Please remove it from your cart.`, 400);
      }
      if (prod.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}.`,
          400
        );
      }
    }

    // 4. Calculate authoritative financials and build immutable snapshots
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const prod = productMap.get(item.product.toString());
      const lineTotal = Number((prod.price * item.quantity).toFixed(2));
      subtotal += lineTotal;

      orderItems.push({
        product: prod._id,
        productName: prod.name,
        image: prod.image,
        price: prod.price,
        quantity: item.quantity,
        lineTotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    const shippingCharge = calculateShipping(subtotal);
    const totalAmount = Number((subtotal + shippingCharge).toFixed(2));
    const orderNumber = generateOrderNumber();

    // 5. Atomic decrement and order creation
    // Multi-document transactions in MongoDB require a replica set or mongos topology
    let session = null;
    let transactionStarted = false;

    // Check if current Mongoose connection is a replica set
    const isReplicaSet = Boolean(
      mongoose.connection?.client?.topology?.description?.type?.includes('ReplicaSet') ||
      mongoose.connection?.client?.topology?.s?.description?.type?.includes('ReplicaSet')
    );

    if (isReplicaSet) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        transactionStarted = true;
      } catch {
        session = null;
        transactionStarted = false;
      }
    }

    if (transactionStarted && session) {
      try {
        // Atomic conditional decrement within transaction
        for (const item of cart.items) {
          const updated = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true, session }
          );
          if (!updated) {
            throw new AppError(
              'Stock changed during checkout. Please review your cart and try again.',
              409
            );
          }
        }

        // Create order
        const [order] = await orderRepository.create(
          [
            {
              orderNumber,
              user: userId,
              items: orderItems,
              shippingAddress,
              subtotal,
              shippingCharge,
              totalAmount,
              paymentMethod: 'COD',
              paymentStatus: 'PENDING',
              orderStatus: 'PLACED',
            },
          ],
          session
        );

        // Clear user cart
        await cartRepository.clearCart(userId, session);

        await session.commitTransaction();
        return order;
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } else {
      // Standalone fallback: Conditional atomic updates with compensating rollback
      const decrementedItems = [];
      try {
        for (const item of cart.items) {
          const updated = await Product.findOneAndUpdate(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
          if (!updated) {
            throw new AppError(
              'Stock changed during checkout. Please review your cart and try again.',
              409
            );
          }
          decrementedItems.push({ productId: item.product, quantity: item.quantity });
        }

        // Create order document
        const order = await orderRepository.create({
          orderNumber,
          user: userId,
          items: orderItems,
          shippingAddress,
          subtotal,
          shippingCharge,
          totalAmount,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          orderStatus: 'PLACED',
        });

        // Clear cart
        await cartRepository.clearCart(userId);
        return order;
      } catch (err) {
        // Compensating rollback for standalone mode
        for (const roll of decrementedItems) {
          await Product.findByIdAndUpdate(roll.productId, {
            $inc: { stock: roll.quantity },
          }).catch(() => {});
        }
        throw err;
      }
    }
  }

  async getMyOrders(userId, { skip = 0, limit = 50 } = {}) {
    return orderRepository.findByUserId(userId, { skip, limit });
  }

  async getOrderById(orderId, userId) {
    const order = await orderRepository.findByIdForUser(orderId, userId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async getAdminOrders({ page = 1, limit = 10, status = 'ALL', search = '', sort = 'newest' }) {
    const filter = {};

    if (status && status !== 'ALL') {
      filter.orderStatus = status;
    }

    if (search && search.trim()) {
      const queryRegex = safeRegex(search.trim());
      // Search matching users by name or email
      const matchedUsers = await User.find({
        $or: [{ name: queryRegex }, { email: queryRegex }],
      }).select('_id');
      const matchedUserIds = matchedUsers.map((u) => u._id);

      filter.$or = [
        { orderNumber: queryRegex },
        { user: { $in: matchedUserIds } },
        { 'shippingAddress.fullName': queryRegex },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'highest_amount') sortOptions = { totalAmount: -1 };
    if (sort === 'lowest_amount') sortOptions = { totalAmount: 1 };

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderRepository.findAdminOrders({ filter, skip, limit, sort: sortOptions }),
      orderRepository.countAdminOrders(filter),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getAdminOrderById(orderId) {
    const order = await orderRepository.findAdminById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async updateOrderStatus(orderId, nextStatus) {
    const order = await orderRepository.findAdminById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const currentStatus = order.orderStatus;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(nextStatus)) {
      throw new AppError(
        `Invalid status transition from "${currentStatus}" to "${nextStatus}".`,
        400
      );
    }

    const updateFields = {
      orderStatus: nextStatus,
    };

    if (nextStatus === 'PROCESSING') {
      updateFields.processedAt = new Date();
    } else if (nextStatus === 'SHIPPED') {
      updateFields.shippedAt = new Date();
    } else if (nextStatus === 'DELIVERED') {
      updateFields.deliveredAt = new Date();
      updateFields.paymentStatus = 'PAID';
    } else if (nextStatus === 'CANCELLED') {
      if (order.stockRestored) {
        throw new AppError('Inventory has already been restored for this order.', 400);
      }

      // Restore product stock for each ordered item
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      updateFields.cancelledAt = new Date();
      updateFields.stockRestored = true;
    }

    const updatedOrder = await orderRepository.updateOrder(order._id, updateFields);
    return updatedOrder;
  }

  async getDashboardStats() {
    const [totalProducts, lowStockProducts, outOfStockProducts, orderStats] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: 5 } }),
      Product.countDocuments({ isActive: true, stock: 0 }),
      orderRepository.getOrderStatistics(),
    ]);

    return {
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      orders: {
        total: orderStats.totalOrders,
        byStatus: orderStats.statusCounts,
        deliveredRevenue: orderStats.deliveredRevenue,
      },
    };
  }
}

export const orderService = new OrderService();

