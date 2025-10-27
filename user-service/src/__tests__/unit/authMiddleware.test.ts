import { jest, describe, it, expect } from '@jest/globals'
import { Request, Response, NextFunction } from 'express'
import authMiddleware from '../../middleware/auth.js'
import { createTestUser, generateTestToken } from '../helpers/testHelpers.js'

describe('Auth Middleware', () => {
  it('should call next() with valid token', async () => {
    const user = await createTestUser()
    const token = generateTestToken(user._id.toString(), user.email)

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request

    const res = {} as Response
    const next = jest.fn() as NextFunction

    authMiddleware(req, res, next)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(next).toHaveBeenCalled()
    expect(req.userId).toBe(user._id.toString())
  })

  it('should return 401 without token', () => {
    const req = {
      headers: {},
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    const next = jest.fn() as NextFunction

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 with invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    } as Request

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    const next = jest.fn() as NextFunction

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})
