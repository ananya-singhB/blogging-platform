import { jest, describe, it, expect } from '@jest/globals'
import { Request, Response } from 'express'
import {
  register,
  login,
  verifyEmail,
} from '../../controllers/authController.js'
import User from '../../models/User.js'
import { createTestUser, createUnverifiedUser } from '../helpers/testHelpers.js'

jest.mock('../../services/emailService.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}))

describe('Auth Controller - Register', () => {
  it('should register a new user successfully', async () => {
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      },
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    await register(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining('Registration successful'),
      })
    )

    const user = await User.findOne({ email: 'john@example.com' })
    expect(user).toBeTruthy()
    expect(user?.name).toBe('John Doe')
    expect(user?.isEmailVerified).toBe(false)
    // Don't check user.userId - it doesn't exist on the document
    // If you need to check it, use: expect(user?._id).toBeDefined()
  })

  it('should not register user with existing email', async () => {
    await createTestUser({ email: 'existing@example.com' })

    const req = {
      body: {
        name: 'Jane Doe',
        email: 'existing@example.com',
        password: 'password123',
      },
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    await register(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('already exists'),
      })
    )
  })
})

describe('Auth Controller - Login', () => {
  it('should login user with valid credentials', async () => {
    await createTestUser({
      email: 'login@example.com',
      isEmailVerified: true,
    })

    const req = {
      body: {
        email: 'login@example.com',
        password: 'password123',
      },
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Login successful',
        data: expect.objectContaining({
          token: expect.any(String),
        }),
      })
    )
  })

  it('should not login user with unverified email', async () => {
    await createUnverifiedUser('unverified@example.com')

    const req = {
      body: {
        email: 'unverified@example.com',
        password: 'password123',
      },
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('verify your email'),
      })
    )
  })

  it('should not login with invalid password', async () => {
    await createTestUser({ email: 'test@example.com' })

    const req = {
      body: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    await login(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid credentials',
      })
    )
  })
})

describe('Auth Controller - Email Verification', () => {
  it('should verify email with valid token', async () => {
    const user = await createUnverifiedUser()

    const req = {
      query: {
        token: user.emailVerificationToken,
      },
    } as unknown as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    await verifyEmail(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining('verified successfully'),
      })
    )

    const verifiedUser = await User.findById(user._id)
    expect(verifiedUser?.isEmailVerified).toBe(true)
    expect(verifiedUser?.emailVerificationToken).toBeUndefined()
  })

  it('should not verify email with invalid token', async () => {
    const req = {
      query: {
        token: 'invalid-token',
      },
    } as unknown as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    await verifyEmail(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Invalid or expired'),
      })
    )
  })

  it('should not verify email with expired token', async () => {
    const expiredDate = new Date(Date.now() - 1000)
    const user = await createUnverifiedUser()
    user.emailVerificationExpires = expiredDate
    await user.save()

    const req = {
      query: {
        token: user.emailVerificationToken,
      },
    } as unknown as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    await verifyEmail(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Invalid or expired'),
      })
    )
  })
})
