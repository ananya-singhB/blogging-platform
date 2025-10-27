import request from 'supertest';
import express from 'express';
import userRoutes from '../../routes/userRoutes.js';
import { createTestUser, generateTestToken } from '../helpers/testHelpers.js';
import { describe, it, expect } from '@jest/globals';


const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('GET /api/users/profile', () => {
  it('should return user profile with valid token', async () => {
    const user = await createTestUser({ email: 'profile@example.com' });
    const token = generateTestToken(user._id, user.email);

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('profile@example.com');
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .get('/api/users/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('PUT /api/users/profile', () => {
  it('should update user profile', async () => {
    const user = await createTestUser();
    const token = generateTestToken(user._id, user.email);

    const response = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        bio: 'New bio'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Updated Name');
    expect(response.body.data.bio).toBe('New bio');
  });
});

describe('GET /api/users/:userId', () => {
  it('should return user by ID', async () => {
    const user = await createTestUser({ email: 'byid@example.com' });

    const response = await request(app)
      .get(`/api/users/${user._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('byid@example.com');
  });

  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .get('/api/users/507f1f77bcf86cd799439011');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
