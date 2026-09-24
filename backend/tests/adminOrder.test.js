import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { Cart } from '../src/models/Cart.js';
import { Order } from '../src/models/Order.js';

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/novamart_test';

let customerCookie = '';
let adminCookie = '';
let customerUser = null;
let testProduct = null;

const sampleShippingAddress = {
  fullName: 'Alice Walker',
  phone: '9876543210',
  address: '123 Market Street, Suite 500',
  city: 'San Francisco',
  state: 'California',
  postalCode: '94105',
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }

  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});

  // 1. Create customer
  customerUser = await User.create({
    name: 'Customer Alice',
    email: 'alice.customer@example.com',
    password: 'Password123!',
    role: 'CUSTOMER',
  });
  const custRes = await request(app).post('/api/auth/login').send({
    email: 'alice.customer@example.com',
    password: 'Password123!',
  });
  customerCookie = custRes.headers['set-cookie'];

  // 2. Create admin
  await User.create({
    name: 'Admin Boss',
    email: 'boss.admin@example.com',
    password: 'Password123!',
    role: 'ADMIN',
  });
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'boss.admin@example.com',
    password: 'Password123!',
  });
  adminCookie = adminRes.headers['set-cookie'];

  // 3. Create test product
  testProduct = await Product.create({
    name: 'Wireless Noise-Canceling Headphones',
    description: 'High-fidelity audio with active noise cancellation.',
    price: 150.0,
    category: 'Electronics',
    brand: 'NovaSound',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    isActive: true,
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});
});

describe('Phase 5: Admin Order Management & Controlled Lifecycle', () => {
  let createdOrderId = '';
  let createdOrderNumber = '';

  beforeEach(async () => {
    // Clean orders and reset stock for repeatable tests
    await Order.deleteMany({});
    await Cart.deleteMany({});
    await Product.findByIdAndUpdate(testProduct._id, { stock: 20 });

    // Customer adds product and creates an order
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', customerCookie)
      .send({ productId: testProduct._id.toString(), quantity: 2 });

    const orderRes = await request(app)
      .post('/api/orders')
      .set('Cookie', customerCookie)
      .send({ shippingAddress: sampleShippingAddress });

    createdOrderId = orderRes.body.data.id || orderRes.body.data._id;
    createdOrderNumber = orderRes.body.data.orderNumber;
  });

  describe('1. Admin Order RBAC & Route Access', () => {
    it('should reject unauthenticated request to GET /api/orders/admin with 401', async () => {
      const res = await request(app).get('/api/orders/admin');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject CUSTOMER access to GET /api/orders/admin with 403', async () => {
      const res = await request(app)
        .get('/api/orders/admin')
        .set('Cookie', customerCookie);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should permit ADMIN access to GET /api/orders/admin with 200', async () => {
      const res = await request(app)
        .get('/api/orders/admin')
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('2. Admin Order Listing, Pagination & Search', () => {
    it('should return server-side pagination metadata', async () => {
      const res = await request(app)
        .get('/api/orders/admin?page=1&limit=5')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.total).toBe(1);
      expect(res.body.pagination.totalPages).toBe(1);
    });

    it('should filter orders by status', async () => {
      const placedRes = await request(app)
        .get('/api/orders/admin?status=PLACED')
        .set('Cookie', adminCookie);
      expect(placedRes.status).toBe(200);
      expect(placedRes.body.data.length).toBe(1);

      const deliveredRes = await request(app)
        .get('/api/orders/admin?status=DELIVERED')
        .set('Cookie', adminCookie);
      expect(deliveredRes.status).toBe(200);
      expect(deliveredRes.body.data.length).toBe(0);
    });

    it('should safely search orders by orderNumber or customer name', async () => {
      const searchRes = await request(app)
        .get(`/api/orders/admin?search=${encodeURIComponent(createdOrderNumber)}`)
        .set('Cookie', adminCookie);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBe(1);
      expect(searchRes.body.data[0].orderNumber).toBe(createdOrderNumber);

      const searchNameRes = await request(app)
        .get('/api/orders/admin?search=Alice')
        .set('Cookie', adminCookie);
      expect(searchNameRes.status).toBe(200);
      expect(searchNameRes.body.data.length).toBe(1);
    });
  });

  describe('3. Admin Order Details', () => {
    it('should return full order details with customer snapshot and item snapshots', async () => {
      const res = await request(app)
        .get(`/api/orders/admin/${createdOrderId}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.orderNumber).toBe(createdOrderNumber);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].productName).toBe(testProduct.name);
      expect(res.body.data.items[0].price).toBe(150.0);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('alice.customer@example.com');
    });

    it('should return 404 for non-existent admin order', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/orders/admin/${fakeId}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Controlled Status Lifecycle Transitions', () => {
    it('should transition PLACED -> PROCESSING successfully', async () => {
      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'PROCESSING' });

      expect(res.status).toBe(200);
      expect(res.body.data.orderStatus).toBe('PROCESSING');
      expect(res.body.data.processedAt).toBeDefined();
    });

    it('should transition PROCESSING -> SHIPPED successfully', async () => {
      // First PLACED -> PROCESSING
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'PROCESSING' });

      // Then PROCESSING -> SHIPPED
      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'SHIPPED' });

      expect(res.status).toBe(200);
      expect(res.body.data.orderStatus).toBe('SHIPPED');
      expect(res.body.data.shippedAt).toBeDefined();
    });

    it('should transition SHIPPED -> DELIVERED and update COD payment to PAID', async () => {
      // Advance to SHIPPED
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'PROCESSING' });
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'SHIPPED' });

      // SHIPPED -> DELIVERED
      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'DELIVERED' });

      expect(res.status).toBe(200);
      expect(res.body.data.orderStatus).toBe('DELIVERED');
      expect(res.body.data.paymentStatus).toBe('PAID');
      expect(res.body.data.deliveredAt).toBeDefined();
    });

    it('should reject invalid transition backwards (SHIPPED -> PROCESSING) with 400', async () => {
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'PROCESSING' });
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'SHIPPED' });

      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'PROCESSING' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid status transition');
    });

    it('should reject transitions out of terminal state DELIVERED with 400', async () => {
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'PROCESSING' });
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'SHIPPED' });
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'DELIVERED' });

      // Attempt DELIVERED -> CANCELLED
      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'CANCELLED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should block CUSTOMER from changing order status with 403', async () => {
      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', customerCookie)
        .send({ status: 'CANCELLED' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Cancellation and Stock Restoration', () => {
    it('should restore stock when order is cancelled from PLACED', async () => {
      // Initial stock was 20. Order of 2 reduced stock to 18.
      const beforeCancelProduct = await Product.findById(testProduct._id);
      expect(beforeCancelProduct.stock).toBe(18);

      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'CANCELLED' });

      expect(res.status).toBe(200);
      expect(res.body.data.orderStatus).toBe('CANCELLED');
      expect(res.body.data.stockRestored).toBe(true);
      expect(res.body.data.cancelledAt).toBeDefined();

      // Product stock restored from 18 back to 20
      const afterCancelProduct = await Product.findById(testProduct._id);
      expect(afterCancelProduct.stock).toBe(20);
    });

    it('should reject repeated cancellation attempts from CANCELLED terminal state', async () => {
      // First cancellation
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'CANCELLED' });

      // Second attempt
      const res = await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'CANCELLED' });

      expect(res.status).toBe(400);

      // Verify stock did NOT increment again (remains 20)
      const prod = await Product.findById(testProduct._id);
      expect(prod.stock).toBe(20);
    });
  });

  describe('6. Admin Dashboard Real Aggregation API', () => {
    it('should reject unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/orders/admin/dashboard');
      expect(res.status).toBe(401);
    });

    it('should reject CUSTOMER access with 403', async () => {
      const res = await request(app)
        .get('/api/orders/admin/dashboard')
        .set('Cookie', customerCookie);
      expect(res.status).toBe(403);
    });

    it('should return real aggregated catalog and order stats for ADMIN', async () => {
      // Advance created order to DELIVERED so it produces delivered revenue
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'PROCESSING' });
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'SHIPPED' });
      await request(app)
        .patch(`/api/orders/admin/${createdOrderId}/status`)
        .set('Cookie', adminCookie)
        .send({ status: 'DELIVERED' });

      const res = await request(app)
        .get('/api/orders/admin/dashboard')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Products breakdown
      expect(res.body.data.products).toBeDefined();
      expect(res.body.data.products.total).toBeGreaterThanOrEqual(1);

      // Orders breakdown
      expect(res.body.data.orders).toBeDefined();
      expect(res.body.data.orders.total).toBe(1);
      expect(res.body.data.orders.byStatus.DELIVERED).toBe(1);
      expect(res.body.data.orders.deliveredRevenue).toBe(300.0);
    });
  });
});
