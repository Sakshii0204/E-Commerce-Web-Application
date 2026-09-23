import { cartRepository } from '../repositories/cart.repository.js';
import { Product } from '../models/Product.js';
import { AppError } from '../utils/AppError.js';
import { calculateShipping } from '../utils/pricing.js';

class CartService {
  async getCart(userId) {
    const cart = await cartRepository.findOrCreateCart(userId);

    const productIds = cart.items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map();
    products.forEach((p) => {
      productMap.set(p._id.toString(), p);
    });

    const resolvedItems = [];
    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const prod = productMap.get(item.product.toString());
      if (!prod) {
        // Product was hard deleted; skip or flag
        continue;
      }

      const isUnavailable = !prod.isActive || prod.stock <= 0;
      const isStockExceeded = item.quantity > prod.stock;
      const lineTotal = prod.price * item.quantity;

      resolvedItems.push({
        product: {
          id: prod._id.toString(),
          name: prod.name,
          price: prod.price,
          image: prod.image,
          category: prod.category,
          brand: prod.brand,
          stock: prod.stock,
          isActive: prod.isActive,
          isUnavailable,
          isStockExceeded,
        },
        quantity: item.quantity,
        lineTotal,
      });

      if (!isUnavailable) {
        subtotal += lineTotal;
        itemCount += item.quantity;
      }
    }

    const shipping = calculateShipping(subtotal);
    const tax = subtotal * 0.05; // 5% standard tax
    const total = subtotal + shipping + tax;

    return {
      id: cart._id.toString(),
      items: resolvedItems,
      itemCount,
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }

  async addItem(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    if (!product.isActive) {
      throw new AppError('This product is no longer active', 400);
    }
    if (product.stock <= 0) {
      throw new AppError('Product is currently out of stock', 400);
    }

    const cart = await cartRepository.findOrCreateCart(userId);
    const existing = cart.items.find(
      (item) => item.product.toString() === productId.toString()
    );
    const existingQty = existing ? existing.quantity : 0;
    const requestedTotal = existingQty + quantity;

    if (requestedTotal > product.stock) {
      throw new AppError(
        `Cannot add ${quantity} more. Only ${product.stock} items in stock (you already have ${existingQty} in cart).`,
        400
      );
    }

    await cartRepository.addItem(userId, productId, quantity);
    return this.getCart(userId);
  }

  async updateQuantity(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    if (!product.isActive) {
      throw new AppError('This product is no longer active', 400);
    }
    if (quantity > product.stock) {
      throw new AppError(
        `Requested quantity (${quantity}) exceeds available stock (${product.stock})`,
        400
      );
    }

    const updated = await cartRepository.updateItemQuantity(userId, productId, quantity);
    if (!updated) {
      throw new AppError('Item not found in cart', 404);
    }

    return this.getCart(userId);
  }

  async removeItem(userId, productId) {
    await cartRepository.removeItem(userId, productId);
    return this.getCart(userId);
  }

  async clearCart(userId) {
    await cartRepository.clearCart(userId);
    return this.getCart(userId);
  }
}

export const cartService = new CartService();
