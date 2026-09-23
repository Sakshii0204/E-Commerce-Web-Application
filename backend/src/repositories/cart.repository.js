import { Cart } from '../models/Cart.js';

class CartRepository {
  async findByUserId(userId) {
    return Cart.findOne({ user: userId });
  }

  async findOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  async addItem(userId, productId, quantity) {
    const cart = await this.findOrCreateCart(userId);
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    return cart.save();
  }

  async updateItemQuantity(userId, productId, quantity) {
    const cart = await this.findOrCreateCart(userId);
    const item = cart.items.find(
      (item) => item.product.toString() === productId.toString()
    );

    if (!item) {
      return null;
    }

    item.quantity = quantity;
    return cart.save();
  }

  async removeItem(userId, productId) {
    const cart = await this.findOrCreateCart(userId);
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId.toString()
    );
    return cart.save();
  }

  async clearCart(userId, session = null) {
    const options = session ? { session } : {};
    return Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true, ...options }
    );
  }
}

export const cartRepository = new CartRepository();
