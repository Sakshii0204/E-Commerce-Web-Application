import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Cart } from '../src/models/Cart.js';
import { Order } from '../src/models/Order.js';

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/novamart_test';

let customer1Cookie = '';
let customer2Cookie = '';
let customer1User = null;
let testProduct1 = null;
let testProduct2 = null;

const sampleShippingAddress = {
  fullName: 'John Doe',
  phone: '9876543210',
  address: '404 Tech Park, MG Road',
  city: 'Bangalore',
  state: 'Karnataka',
  postalCode: '560001',
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }

  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});

  // Create Customer 1
  customer1User = await User.create({
    name: 'Order Customer One',
    email: 'order.one@example.com',
    password: 'Password123!',
    role: 'CUSTOMER',
  });
  const login1 = await request(app).post('/api/auth/login').send({
    email: 'order.one@example.com',
    password: 'Password123!',
  });
  customer1Cookie = login1.headers['set-cookie'];

  // Create Customer 2
  await User.create({
    name: 'Order Customer Two',
    email: 'order.two@example.com',
    password: 'Password123!',
    role: 'CUSTOMER',
  });
  const login2 = await request(app).post('/api/auth/login').send({
    email: 'order.two@example.com',
    password: 'Password123!',
  });
  customer2Cookie = login2.headers['set-cookie'];
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Cart.deleteMany({});
  await Order.deleteMany({});
  await Product.deleteMany({});

  testProduct1 = await Product.create({
    name: 'Noise Cancelling Headphones',
    description: 'Crisp sound and deep bass',
    price: 150,
    category: 'Electronics',
    brand: 'Nova',
    image: 'https://example.com/headphones.jpg',
    stock: 10,
    isActive: true,
  });

  testProduct2 = await Product.create({
    name: 'Ergonomic Desk Mat',
    description: 'Waterproof leather surface',
    price: 40,
    category: 'Accessories',
    brand: 'Nova',
    image: 'https://example.com/deskmat.jpg',
    stock: 5,
    isActive: true,
  });
});

describe('Order & Checkout System (Phase 4)', () => {
  describe('1. Checkout Authorization & Preconditions', () => {
    it('should reject unauthenticated checkout with 401', async () => {
      const res = await request(app).post('/api/orders').send({
        shippingAddress: sampleShippingAddress,
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject checkout if customer cart is empty', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', customer1Cookie)
        .send({
          shippingAddress: sampleShippingAddress,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cart is empty');
    });

    it('should reject checkout with invalid shipping phone or postal code', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customer1Cookie)
        .send({ productId: testProduct1._id.toString(), quantity: 1 });

      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', customer1Cookie)
        .send({
          shippingAddress: {
            ...sampleShippingAddress,
            phone: '12', // Too short
            postalCode: '1', // Too short
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Successful Order Placement & Authoritative Calculations', () => {
    it('should create order, decrement inventory, freeze snapshots, and clear cart', async () => {
      // Add 2 of product1 ($150 each) and 1 of product2 ($40) -> Subtotal = $340 -> Free shipping ($0)
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customer1Cookie)
        .send({ productId: testProduct1._id.toString(), quantity: 2 });

      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customer1Cookie)
        .send({ productId: testProduct2._id.toString(), quantity: 1 });

      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', customer1Cookie)
        .send({
          shippingAddress: sampleShippingAddress,
          paymentMethod: 'COD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const order = res.body.data;
      expect(order.orderNumber).toMatch(/^NVM-\d{8}-[A-F0-9]{6}$/);
      expect(order.paymentMethod).toBe('COD');
      expect(order.paymentStatus).toBe('PENDING');
      expect(order.orderStatus).toBe('PLACED');
      expect(order.subtotal).toBe(340);
      expect(order.shippingCharge).toBe(0); // >= 100 threshold
      expect(order.totalAmount).toBe(340);
      expect(order.items.length).toBe(2);

      // Verify product snapshots are saved
      expect(order.items[0].productName).toBe('Noise Cancelling Headphones');
      expect(order.items[0].price).toBe(150);
      expect(order.items[0].quantity).toBe(2);
      expect(order.items[0].lineTotal).toBe(300);

      // Verify stock was decremented in database
      const p1 = await Product.findById(testProduct1._id);
      expect(p1.stock).toBe(8); // 10 - 2

      const p2 = await Product.findById(testProduct2._id);
      expect(p2.stock).toBe(4); // 5 - 1

      // Verify customer's cart is cleared in database
      const cartRes = await request(app).get('/api/cart').set('Cookie', customer1Cookie);
      expect(cartRes.body.data.items).toEqual([]);
      expect(cartRes.body.data.itemCount).toBe(0);
    });

    it('should charge standard shipping for orders below threshold', async () => {
      // 1 of product2 ($40) -> Subtotal = $40 -> Standard shipping ($15) -> Total = $55
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customer1Cookie)
        .send({ productId: testProduct2._id.toString(), quantity: 1 });

      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', customer1Cookie)
        .send({
          shippingAddress: sampleShippingAddress,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.subtotal).toBe(40);
      expect(res.body.data.shippingCharge).toBe(15);
      expect(res.body.data.totalAmount).toBe(55);
    });

    it('should preserve immutable snapshots even if product details change later', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customer1Cookie)
        .send({ productId: testProduct1._id.toString(), quantity: 1 });

      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', customer1Cookie)
        .send({ shippingAddress: sampleShippingAddress });

      const orderId = res.body.data.id || res.body.data._id;

      // Admin changes product price and title in database
      await Product.findByIdAndUpdate(testProduct1._id, {
        name: 'Updated Headphone Title',
        price: 999,
      });

      // Order lookup should retain original snapshot
      const orderRes = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Cookie', customer1Cookie);

      expect(orderRes.status).toBe(200);
      expect(orderRes.body.data.items[0].productName).toBe('Noise Cancelling Headphones');
      expect(orderRes.body.data.items[0].price).toBe(150);
      expect(orderRes.body.data.subtotal).toBe(150);
    });
  });

  describe('3. Stock Safety & Multi-Product Failure Isolation', () => {
    it('should reject order if requested quantity exceeds current stock', async () => {
      // Put 5 in cart
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customer1Cookie)
        .send({ productId: testProduct2._id.toString(), quantity: 5 });

      // Simulate concurrent purchase reducing stock to 3
      await Product.findByIdAndUpdate(testProduct2._id, { stock: 3 });

      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', customer1Cookie)
        .send({ shippingAddress: sampleShippingAddress });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');

      // Cart must NOT be cleared on failure
      const cartRes = await request(app).get('/api/cart').set('Cookie', customer1Cookie);
      expect(cartRes.body.data.items.length).toBe(1);

      // Stock must remain unchanged at 3
      const prod = await Product.findById(testProduct2._id);
      expect(prod.stock).toBe(3);
    });

    it('should reject checkout if any item in cart was deactivated', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customer1Cookie)
        .send({ productId: testProduct1._id.toString(), quantity: 1 });

      // Admin deactivates product
      await Product.findByIdAndUpdate(testProduct1._id, { isActive: false });

      const res = await request(app)
        .post('/api/orders')
        .set('Cookie', customer1Cookie)
        .send({ shippingAddress: sampleShippingAddress });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('no longer available');
    });
  });

  describe('4. Order History & Isolation Between Customers', () => {
    let order1Id = '';

    beforeEach(async () => {
      // Customer 1 places an order
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customer1Cookie)
        .send({ productId: testProduct1._id.toString(), quantity: 1 });

      const orderRes = await request(app)
        .post('/api/orders')
        .set('Cookie', customer1Cookie)
        .send({ shippingAddress: sampleShippingAddress });

      order1Id = orderRes.body.data.id || orderRes.body.data._id;
    });

    it('should return only customer own orders on GET /api/orders/my-orders', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Cookie', customer1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].items[0].productName).toBe('Noise Cancelling Headphones');

      // Customer 2 should see 0 orders
      const res2 = await request(app)
        .get('/api/orders/my-orders')
        .set('Cookie', customer2Cookie);

      expect(res2.status).toBe(200);
      expect(res2.body.data).toEqual([]);
    });

    it('should block Customer 2 from accessing Customer 1 order by ID (404/Not Found)', async () => {
      const res = await request(app)
        .get(`/api/orders/${order1Id}`)
        .set('Cookie', customer2Cookie);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should allow Customer 1 to access their own order by MongoDB ID or orderNumber', async () => {
      const resById = await request(app)
        .get(`/api/orders/${order1Id}`)
        .set('Cookie', customer1Cookie);

      expect(resById.status).toBe(200);
      expect(resById.body.data.id || resById.body.data._id).toBe(order1Id);

      const orderNumber = resById.body.data.orderNumber;
      const resByNumber = await request(app)
        .get(`/api/orders/${orderNumber}`)
        .set('Cookie', customer1Cookie);

      expect(resByNumber.status).toBe(200);
      expect(resByNumber.body.data.orderNumber).toBe(orderNumber);
    });
  });
});
