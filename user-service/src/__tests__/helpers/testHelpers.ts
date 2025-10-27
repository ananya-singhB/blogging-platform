import jwt from 'jsonwebtoken'
import User, { IUser } from '../../models/User.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const generateTestToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h',
  })
}

export const createTestUser = async (overrides: any = {}): Promise<IUser> => {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: hashedPassword,
    isEmailVerified: true,
    isActive: true,
    ...overrides,
  })

  return await user.save()
}

export const createUnverifiedUser = async (
  email: string = 'unverified@example.com'
): Promise<IUser> => {
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationExpires = new Date(Date.now() + 10 * 60 * 1000)

  return createTestUser({
    email,
    isEmailVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  })
}
