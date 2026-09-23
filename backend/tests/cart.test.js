import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Cart } from '../src/models/Cart.js';

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/novamart_test';

let user1Cookie = '';
let user2Cookie = '';
let activeProduct1 = null;
let activeProduct2 = null;
let outOfStockProduct = null;
let inactiveProduct = null;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }

  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});

  // Create User 1
  await User.create({
    name: 'Cart Customer One',
    email: 'cart.one@example.com',
    password: 'Password123!',
    role: 'CUSTOMER',
  });
  const login1 = await request(app).post('/api/auth/login').send({
    email: 'cart.one@example.com',
    password: 'Password123!',
  });
  user1Cookie = login1.headers['set-cookie'];

  // Create User 2 (for isolation check)
  await User.create({
    name: 'Cart Customer Two',
    email: 'cart.two@example.com',
    password: 'Password123!',
    role: 'CUSTOMER',
  });
  const login2 = await request(app).post('/api/auth/login').send({
    email: 'cart.two@example.com',
    password: 'Password123!',
  });
  user2Cookie = login2.headers['set-cookie'];
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Cart.deleteMany({});
  await Product.deleteMany({});

  // Seed sample products
  activeProduct1 = await Product.create({
    name: 'Wireless Bluetooth Headset',
    description: 'High fidelity audio',
    price: 100,
    category: 'Electronics',
    brand: 'Nova',
    image: 'https://example.com/headset.jpg',
    stock: 5,
    isActive: true,
  });

  activeProduct2 = await Product.create({
    name: 'Gaming Mechanical Keyboard',
    description: 'Tactile switches',
    price: 50,
    category: 'Electronics',
    brand: 'Nova',
    image: 'https://example.com/keyboard.jpg',
    stock: 10,
    isActive: true,
  });

  outOfStockProduct = await Product.create({
    name: 'Sold Out Gadget',
    description: 'Zero stock gadget',
    price: 30,
    category: 'Electronics',
    brand: 'Nova',
    image: 'https://example.com/soldout.jpg',
    stock: 0,
    isActive: true,
  });

  inactiveProduct = await Product.create({
    name: 'Archived Watch',
    description: 'No longer sold',
    price: 200,
    category: 'Accessories',
    brand: 'Vintage',
    image: 'https://example.com/watch.jpg',
    stock: 5,
    isActive: false,
  });
});

describe('Cart Management System (Phase 4)', () => {
  describe('1. Authentication & Initial Cart', () => {
    it('should reject unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return empty cart representation for new user', async () => {
      const res = await request(app).get('/api/cart').set('Cookie', user1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.itemCount).toBe(0);
      expect(res.body.data.subtotal).toBe(0);
    });
  });

  describe('2. Add to Cart', () => {
    it('should add valid in-stock product to cart', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({
          productId: activeProduct1._id.toString(),
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].product.id).toBe(activeProduct1._id.toString());
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.items[0].lineTotal).toBe(200);
      expect(res.body.data.subtotal).toBe(200);
      expect(res.body.data.itemCount).toBe(2);
    });

    it('should accumulate quantity when adding same product again', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({ productId: activeProduct1._id.toString(), quantity: 1 });

      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({ productId: activeProduct1._id.toString(), quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].quantity).toBe(3);
      expect(res.body.data.itemCount).toBe(3);
    });

    it('should reject adding more quantity than available stock', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({
          productId: activeProduct1._id.toString(),
          quantity: 10, // Stock is 5
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('stock');
    });

    it('should reject adding out-of-stock product', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({
          productId: outOfStockProduct._id.toString(),
          quantity: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('out of stock');
    });

    it('should reject adding inactive / archived product', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({
          productId: inactiveProduct._id.toString(),
          quantity: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('active');
    });

    it('should reject malformed product ID format', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({
          productId: 'invalid-id',
          quantity: 1,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('3. Update & Remove Cart Items', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({ productId: activeProduct1._id.toString(), quantity: 1 });
    });

    it('should update item quantity within stock limits', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${activeProduct1._id}`)
        .set('Cookie', user1Cookie)
        .send({ quantity: 4 });

      expect(res.status).toBe(200);
      expect(res.body.data.items[0].quantity).toBe(4);
      expect(res.body.data.items[0].lineTotal).toBe(400);
    });

    it('should reject quantity update exceeding available stock', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${activeProduct1._id}`)
        .set('Cookie', user1Cookie)
        .send({ quantity: 8 }); // stock is 5

      expect(res.status).toBe(400);
    });

    it('should remove specific item from cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/items/${activeProduct1._id}`)
        .set('Cookie', user1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(0);
      expect(res.body.data.itemCount).toBe(0);
    });

    it('should clear all items from cart', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({ productId: activeProduct2._id.toString(), quantity: 2 });

      const res = await request(app).delete('/api/cart').set('Cookie', user1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(0);
    });
  });

  describe('4. Cart Isolation & Real-Time Price Reflection', () => {
    it('should isolate carts between different users', async () => {
      // User 1 adds product 1
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({ productId: activeProduct1._id.toString(), quantity: 1 });

      // User 2 adds product 2
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', user2Cookie)
        .send({ productId: activeProduct2._id.toString(), quantity: 3 });

      // User 1 verifies their cart
      const res1 = await request(app).get('/api/cart').set('Cookie', user1Cookie);
      expect(res1.body.data.items.length).toBe(1);
      expect(res1.body.data.items[0].product.id).toBe(activeProduct1._id.toString());

      // User 2 verifies their cart
      const res2 = await request(app).get('/api/cart').set('Cookie', user2Cookie);
      expect(res2.body.data.items.length).toBe(1);
      expect(res2.body.data.items[0].product.id).toBe(activeProduct2._id.toString());
    });

    it('should reflect updated database product price immediately in cart', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', user1Cookie)
        .send({ productId: activeProduct1._id.toString(), quantity: 2 });

      // Initial subtotal: 2 * 100 = 200
      let res = await request(app).get('/api/cart').set('Cookie', user1Cookie);
      expect(res.body.data.subtotal).toBe(200);

      // Admin updates product price to 150
      await Product.findByIdAndUpdate(activeProduct1._id, { price: 150 });

      // Cart re-fetch should now compute: 2 * 150 = 300
      res = await request(app).get('/api/cart').set('Cookie', user1Cookie);
      expect(res.body.data.subtotal).toBe(300);
      expect(res.body.data.items[0].product.price).toBe(150);
      expect(res.body.data.items[0].lineTotal).toBe(300);
    });
  });
});
