const request = require('supertest');
const app = require('../src/app');

describe('Online Bookstore Backend API Tests', () => {
  let authToken;
  let testUserId;
  let createdAddressId;
  let testProductId;

  beforeAll(async () => {
    // Login with seeded demo user
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer1@bookstore.com',
        password: 'Password123!'
      });

    if (res.status === 200) {
      authToken = res.body.data.token;
      testUserId = res.body.data.user.id;
    }
  });

  describe('1. Health Check & Diagnostics', () => {
    it('GET /api/health should return status UP', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('UP');
    });
  });

  describe('2. Catalogue & Products APIs', () => {
    it('GET /api/products should list books with pagination', async () => {
      const res = await request(app).get('/api/products?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      testProductId = res.body.data.products[0].id;
    });

    it('GET /api/products/:id should return single product details', async () => {
      const res = await request(app).get(`/api/products/${testProductId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testProductId);
    });

    it('GET /api/products/:id/related should return related books', async () => {
      const res = await request(app).get(`/api/products/${testProductId}/related`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/categories should return all 5 categories', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('GET /api/brands should return all 4 brands', async () => {
      const res = await request(app).get('/api/brands');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('3. Cart APIs', () => {
    it('GET /api/cart should require authentication', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/cart/items should add product to cart for authenticated user', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: testProductId,
          quantity: 2
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });
  });

  describe('4. Address Management APIs', () => {
    it('POST /api/addresses should create a new address', async () => {
      const res = await request(app)
        .post('/api/addresses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientName: 'Test Recipient',
          phoneNumber: '9876543210',
          street: '123 Test Street',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdAddressId = res.body.data.id;
    });

    it('GET /api/addresses should list user addresses', async () => {
      const res = await request(app)
        .get('/api/addresses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('5. Checkout & Payment Lifecycle', () => {
    let orderId;
    let paymentRef;

    it('POST /api/checkout/validate should validate cart totals and stock', async () => {
      const res = await request(app)
        .post('/api/checkout/validate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isValid).toBe(true);
    });

    it('POST /api/checkout/apply-points should apply valid gift points', async () => {
      const res = await request(app)
        .post('/api/checkout/apply-points')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ points: 50 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pointsApplied).toBe(50);
    });

    it('POST /api/checkout/order should create a PENDING order', async () => {
      const res = await request(app)
        .post('/api/checkout/order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          addressId: createdAddressId,
          pointsUsed: 50
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
      orderId = res.body.data.orderId;
    });

    it('POST /api/payments/create should initiate payment', async () => {
      const res = await request(app)
        .post('/api/payments/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId,
          paymentMethod: 'CARD'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      paymentRef = res.body.data.paymentReference;
    });

    it('POST /api/payments/confirm should finalize order payment', async () => {
      const res = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          paymentReference: paymentRef
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('POST /api/orders/:id/buy-again should re-add items to cart', async () => {
      const res = await request(app)
        .post(`/api/orders/${orderId}/buy-again`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.addedItems.length).toBeGreaterThan(0);
    });

    it('POST /api/orders/:id/cancel should cancel eligible order within 48 hours', async () => {
      const res = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.status).toBe('CANCELLED');
    });
  });

  describe('6. Recommendations Engine', () => {
    it('GET /api/recommendations should return ranked book recommendations', async () => {
      const res = await request(app)
        .get('/api/recommendations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
