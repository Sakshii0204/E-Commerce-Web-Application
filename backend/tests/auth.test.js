import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';
import { COOKIE_NAME } from '../src/utils/jwt.js';

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/novamart_test';

beforeAll(async () => {
  // Connect to isolated test database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }
});

afterAll(async () => {
  // Drop test database and close connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

beforeEach(async () => {
  // Clean users collection before each test
  await User.deleteMany({});
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return 200 and operational status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.message).toContain('NovaMart Backend API is operational');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('2. User Registration (POST /api/auth/register)', () => {
  it('should register a valid customer and set HttpOnly auth cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Jane Doe');
    expect(res.body.user.email).toBe('jane@example.com');
    expect(res.body.user.role).toBe('CUSTOMER');
    expect(res.body.user.password).toBeUndefined();

    // Verify cookie set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const authCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));
    expect(authCookie).toBeDefined();
    expect(authCookie).toContain('HttpOnly');
  });

  it('should reject registration with duplicate email (409 Conflict)', async () => {
    await User.create({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'Password123!',
      role: 'CUSTOMER'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        email: 'existing@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('should reject registration with invalid email format (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Invalid Email',
        email: 'not-an-email',
        password: 'Password123!'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('email');
  });

  it('should reject registration with short password (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('at least 6 characters');
  });

  it('should reject registration with missing required fields (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'incomplete@example.com'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should force role to CUSTOMER even if client supplies role=ADMIN (Privilege Escalation Prevention)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Hacker User',
        email: 'hacker@example.com',
        password: 'Password123!',
        role: 'ADMIN'
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('CUSTOMER');

    // Verify in database
    const savedUser = await User.findOne({ email: 'hacker@example.com' });
    expect(savedUser.role).toBe('CUSTOMER');
  });
});

describe('3. User Login (POST /api/auth/login)', () => {
  beforeEach(async () => {
    await User.create({
      name: 'Registered Shopper',
      email: 'shopper@example.com',
      password: 'CorrectPassword123!',
      role: 'CUSTOMER'
    });
  });

  it('should log in successfully with correct credentials (200 OK)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'shopper@example.com',
        password: 'CorrectPassword123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('shopper@example.com');
    expect(res.body.user.password).toBeUndefined();

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const authCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));
    expect(authCookie).toBeDefined();
  });

  it('should reject login with wrong password using generic error message (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'shopper@example.com',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should reject login with non-existent email using generic error message (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'unknown@example.com',
        password: 'AnyPassword123!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });
});

describe('4. Session Authentication (GET /api/auth/me)', () => {
  it('should reject unauthenticated request with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authentication required');
  });

  it('should return safe user profile for valid session cookie', async () => {
    // 1. Register user
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Session User',
        email: 'session@example.com',
        password: 'Password123!'
      });

    const cookie = regRes.headers['set-cookie'];

    // 2. Call /me with cookie
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.user.name).toBe('Session User');
    expect(meRes.body.user.email).toBe('session@example.com');
    expect(meRes.body.user.role).toBe('CUSTOMER');
    expect(meRes.body.user.password).toBeUndefined();
  });

  it('should reject request with invalid JWT token format', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`${COOKIE_NAME}=invalid.token.structure`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Invalid authentication token');
  });
});

describe('5. Role-Based Access Control (RBAC)', () => {
  let customerCookie;
  let adminCookie;

  beforeEach(async () => {
    // Create and login Customer
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular Customer',
        email: 'cust@example.com',
        password: 'Password123!'
      });
    customerCookie = custRes.headers['set-cookie'];

    // Create Admin directly in database (simulating seedAdmin)
    await User.create({
      name: 'Super Admin',
      email: 'admin@novamart.com',
      password: 'AdminPassword123!',
      role: 'ADMIN'
    });

    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@novamart.com',
        password: 'AdminPassword123!'
      });
    adminCookie = adminLoginRes.headers['set-cookie'];
  });

  it('should block CUSTOMER from accessing ADMIN-only route (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/auth/admin-check')
      .set('Cookie', customerCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('do not have permission');
  });

  it('should permit ADMIN to access ADMIN-only route (200 OK)', async () => {
    const res = await request(app)
      .get('/api/auth/admin-check')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Admin authorization verified');
    expect(res.body.user.role).toBe('ADMIN');
  });
});

describe('6. Logout (POST /api/auth/logout)', () => {
  it('should clear the authentication cookie', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Logged out successfully');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const authCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`));
    // Cleared cookie has empty value or expires in the past
    expect(authCookie).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0|novamart_token=;/);
  });
});

describe('7. Password Security & Storage', () => {
  it('should hash passwords with bcrypt in the database and never store plain text', async () => {
    const plainPassword = 'SecretPassword99!';
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Security Test',
        email: 'security@example.com',
        password: plainPassword
      });

    const userInDb = await User.findOne({ email: 'security@example.com' }).select('+password');
    expect(userInDb).toBeDefined();
    expect(userInDb.password).not.toBe(plainPassword);
    // Bcrypt hashes start with $2a$, $2b$, or $2y$
    expect(userInDb.password).toMatch(/^\$2[aby]\$\d+\$/);
  });
});
