const request = require('supertest');
const app = require('../src/app');

describe('Authentication Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123',
  };

  let token = '';

  // Test successful user registration
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', testUser.email);
  });

  // Test registration with missing fields
  it('should return 400 for incomplete registration data', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({ email: 'incomplete@example.com' });

    expect(res.statusCode).toEqual(400);
  });

  // Test successful login
  it('should authenticate user and return JWT token', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // Save token for protected route testing
  });

  // Test login with invalid credentials
  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  // Test protected route with valid JWT
  it('should allow access to protected route with valid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
  });

  // Test protected route without token (unauthorized access)
  it('should deny access to protected route without token', async () => {
    const res = await request(app)
      .get('/api/users/me');

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toMatch(/no token provided/i);
  });
});