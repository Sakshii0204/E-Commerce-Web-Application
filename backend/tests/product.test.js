import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Product } from '../src/models/Product.js';
import { COOKIE_NAME } from '../src/utils/jwt.js';

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/novamart_test';

let adminCookie = '';
let customerCookie = '';

const sampleProductData = {
  name: 'Sony WH-1000XM5 Test Headphones',
  description: 'Flagship wireless active noise cancelling headphones with exceptional audio performance.',
  price: 349.99,
  category: 'Electronics',
  brand: 'Sony',
  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  stock: 20,
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }

  // Clear collections
  await User.deleteMany({});
  await Product.deleteMany({});

  // Create Admin
  await User.create({
    name: 'Admin Tester',
    email: 'admin.product.test@novamart.com',
    password: 'Password123!',
    role: 'ADMIN',
  });

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin.product.test@novamart.com',
    password: 'Password123!',
  });
  adminCookie = adminLogin.headers['set-cookie'];

  // Create Customer
  await User.create({
    name: 'Customer Tester',
    email: 'customer.product.test@novamart.com',
    password: 'Password123!',
    role: 'CUSTOMER',
  });

  const customerLogin = await request(app).post('/api/auth/login').send({
    email: 'customer.product.test@novamart.com',
    password: 'Password123!',
  });
  customerCookie = customerLogin.headers['set-cookie'];
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('Product Model & CRUD System (Phase 3)', () => {
  describe('1. Product Validation & Creation (POST /api/products)', () => {
    it('should create product when requested by ADMIN with valid data', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie)
        .send(sampleProductData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(sampleProductData.name);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data._id).toBeUndefined();
      expect(res.body.data.isActive).toBe(true);
    });

    it('should reject unauthenticated product creation with 401', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(sampleProductData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject CUSTOMER role with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', customerCookie)
        .send(sampleProductData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie)
        .send({
          name: 'Missing Fields',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject negative price and negative stock', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie)
        .send({
          ...sampleProductData,
          price: -50,
          stock: -10,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject fractional stock', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie)
        .send({
          ...sampleProductData,
          stock: 4.5,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid image URL', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie)
        .send({
          ...sampleProductData,
          image: 'not-a-valid-url',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Public Catalog Browsing (GET /api/products)', () => {
    beforeEach(async () => {
      await Product.create([
        {
          name: 'Apple iPhone 15 Pro',
          description: 'Titanium design with A17 Pro chip.',
          price: 999,
          category: 'Electronics',
          brand: 'Apple',
          image: 'https://example.com/iphone.jpg',
          stock: 15,
          isActive: true,
        },
        {
          name: 'Apple Watch Ultra',
          description: 'Rugged titanium adventure smartwatch.',
          price: 799,
          category: 'Electronics',
          brand: 'Apple',
          image: 'https://example.com/watch.jpg',
          stock: 5,
          isActive: true,
        },
        {
          name: 'Nike Air Max 270',
          description: 'Lifestyle sneaker with large Air unit.',
          price: 150,
          category: 'Footwear',
          brand: 'Nike',
          image: 'https://example.com/airmax.jpg',
          stock: 25,
          isActive: true,
        },
        {
          name: 'Adidas Ultraboost Light',
          description: 'High energy return performance running shoes.',
          price: 190,
          category: 'Footwear',
          brand: 'Adidas',
          image: 'https://example.com/ultraboost.jpg',
          stock: 0, // out of stock
          isActive: true,
        },
        {
          name: 'Archived Old Phone',
          description: 'Discontinued obsolete device.',
          price: 99,
          category: 'Electronics',
          brand: 'Vintage',
          image: 'https://example.com/old.jpg',
          stock: 10,
          isActive: false, // Inactive
        },
      ]);
    });

    it('should return list of active products with pagination metadata', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(4); // Excludes archived item
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.totalProducts).toBe(4);
      expect(res.body.pagination.page).toBe(1);
    });

    it('should search products by name, brand, or category (case-insensitive)', async () => {
      const res = await request(app).get('/api/products?search=apple');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.every((p) => p.brand === 'Apple')).toBe(true);
    });

    it('should sanitize regex search without crashing', async () => {
      const res = await request(app).get('/api/products?search=.*+?^${}()|[');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should filter by category and brand', async () => {
      const res = await request(app).get('/api/products?category=Footwear&brand=Nike');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Nike Air Max 270');
    });

    it('should filter by price bounds', async () => {
      const res = await request(app).get('/api/products?minPrice=700&maxPrice=1000');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2); // iPhone (999) & Watch (799)
    });

    it('should filter by inStock availability', async () => {
      const res = await request(app).get('/api/products?category=Footwear&inStock=true');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1); // Excludes Ultraboost (stock 0)
      expect(res.body.data[0].name).toBe('Nike Air Max 270');
    });

    it('should support safe sorting (price_asc and price_desc)', async () => {
      const ascRes = await request(app).get('/api/products?sort=price_asc');
      expect(ascRes.status).toBe(200);
      expect(ascRes.body.data[0].price).toBe(150);

      const descRes = await request(app).get('/api/products?sort=price_desc');
      expect(descRes.status).toBe(200);
      expect(descRes.body.data[0].price).toBe(999);
    });

    it('should handle pagination page and limit', async () => {
      const res = await request(app).get('/api/products?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPreviousPage).toBe(false);
    });
  });

  describe('3. Filter Metadata (GET /api/products/filters)', () => {
    it('should return distinct categories, brands, and price bounds', async () => {
      await Product.create([
        {
          name: 'Item A',
          description: 'Desc A',
          price: 50,
          category: 'Cat1',
          brand: 'BrandX',
          image: 'https://example.com/a.jpg',
          stock: 10,
        },
        {
          name: 'Item B',
          description: 'Desc B',
          price: 500,
          category: 'Cat2',
          brand: 'BrandY',
          image: 'https://example.com/b.jpg',
          stock: 5,
        },
      ]);

      const res = await request(app).get('/api/products/filters');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toContain('Cat1');
      expect(res.body.data.categories).toContain('Cat2');
      expect(res.body.data.brands).toContain('BrandX');
      expect(res.body.data.brands).toContain('BrandY');
      expect(res.body.data.priceRange.min).toBe(50);
      expect(res.body.data.priceRange.max).toBe(500);
    });
  });

  describe('4. Single Product Details (GET /api/products/:id)', () => {
    it('should return product details for valid ID', async () => {
      const created = await Product.create(sampleProductData);

      const res = await request(app).get(`/api/products/${created._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(sampleProductData.name);
    });

    it('should return 400 for malformed ObjectId', async () => {
      const res = await request(app).get('/api/products/invalid-id-123');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent valid ObjectId', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for soft-deleted product to public user', async () => {
      const archived = await Product.create({
        ...sampleProductData,
        name: 'Soft Deleted Headset',
        isActive: false,
      });

      const res = await request(app).get(`/api/products/${archived._id}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Product Update (PUT /api/products/:id)', () => {
    it('should allow ADMIN to update product fields', async () => {
      const created = await Product.create(sampleProductData);

      const res = await request(app)
        .put(`/api/products/${created._id}`)
        .set('Cookie', adminCookie)
        .send({
          price: 299.99,
          stock: 12,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(299.99);
      expect(res.body.data.stock).toBe(12);
    });

    it('should reject CUSTOMER update with 403', async () => {
      const created = await Product.create(sampleProductData);

      const res = await request(app)
        .put(`/api/products/${created._id}`)
        .set('Cookie', customerCookie)
        .send({ price: 10 });

      expect(res.status).toBe(403);
    });
  });

  describe('6. Product Deletion / Soft-delete (DELETE /api/products/:id)', () => {
    it('should soft-delete product when requested by ADMIN', async () => {
      const created = await Product.create(sampleProductData);

      const res = await request(app)
        .delete(`/api/products/${created._id}`)
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify product is no longer returned in public catalog
      const publicRes = await request(app).get('/api/products');
      expect(publicRes.body.data.length).toBe(0);

      // Verify in DB that document still exists with isActive: false
      const doc = await Product.findById(created._id);
      expect(doc).not.toBeNull();
      expect(doc.isActive).toBe(false);
    });

    it('should reject unauthenticated delete with 401', async () => {
      const created = await Product.create(sampleProductData);

      const res = await request(app).delete(`/api/products/${created._id}`);
      expect(res.status).toBe(401);
    });

    it('should reject CUSTOMER delete with 403', async () => {
      const created = await Product.create(sampleProductData);

      const res = await request(app)
        .delete(`/api/products/${created._id}`)
        .set('Cookie', customerCookie);

      expect(res.status).toBe(403);
    });
  });
});
