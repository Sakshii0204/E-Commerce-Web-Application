import { orderService } from '../services/order.service.js';

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const order = await orderService.createOrder(req.user.id, {
      shippingAddress,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const orders = await orderService.getMyOrders(req.user.id, { skip, limit });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
