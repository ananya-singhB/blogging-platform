import { jest, describe, it, expect } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import authRoutes from '../../routes/authRoutes.js'
import {
  createTestUser,
  createUnverifiedUser,
  generateTestToken,
} from '../helpers/testHelpers.js'

// Mock email service
jest.mock('../../services/emailService.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}))

// Create test app
const createTestApp = () => {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api/auth', authRoutes)

  // 404 handler for debugging
  app.use((req, res) => {
    console.log(`404: ${req.method} ${req.path}`)
    res.status(404).json({ success: false, message: 'Route not found' })
  })

  return app
}

const app = createTestApp()

describe('POST /api/auth/register', () => {
  it('should return 201 and register user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Integration Test',
      email: 'integration@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('userId')
    expect(response.body.data.email).toBe('integration@example.com')
  })

  it('should return 400 for duplicate email', async () => {
    await createTestUser({ email: 'duplicate@example.com' })

    const response = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: 'duplicate@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(400)
    expect(response.body.success).toBe(false)
  })
})

describe('POST /api/auth/login', () => {
  it('should return 200 and token for valid credentials', async () => {
    await createTestUser({
      email: 'logintest@example.com',
      isEmailVerified: true,
    })

    const response = await request(app).post('/api/auth/login').send({
      email: 'logintest@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('token')
  })

  it('should return 403 for unverified email', async () => {
    await createUnverifiedUser('unverified@example.com')

    const response = await request(app).post('/api/auth/login').send({
      email: 'unverified@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(403)
    expect(response.body.success).toBe(false)
  })
})

describe('GET /api/auth/verify-email', () => {
  it('should verify email with valid token', async () => {
    const user = await createUnverifiedUser('verify-test@example.com')

    const response = await request(app).get(
      `/api/auth/verify-email?token=${user.emailVerificationToken}`
    )

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})

describe('GET /api/auth/verify-token', () => {
  it('should return 200 for valid JWT token', async () => {
    const user = await createTestUser({ email: 'token-test@example.com' })
    const token = generateTestToken(user._id.toString(), user.email)

    const response = await request(app)
      .get('/api/auth/verify-token')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })

  it('should return 401 for missing token', async () => {
    const response = await request(app).get('/api/auth/verify-token')

    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })
})
