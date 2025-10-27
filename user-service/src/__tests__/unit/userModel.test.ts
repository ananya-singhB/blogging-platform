import { describe, it, expect } from '@jest/globals'
import User from '../../models/User.js'
import bcrypt from 'bcryptjs'

describe('User Model', () => {
  it('should create a user successfully', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user = new User({
      name: 'Model Test',
      email: 'model@example.com',
      password: hashedPassword,
    })

    const savedUser = await user.save()

    expect(savedUser._id).toBeDefined()
    expect(savedUser.name).toBe('Model Test')
    expect(savedUser.email).toBe('model@example.com')
    expect(savedUser.isEmailVerified).toBe(false) // Default is false
    expect(savedUser.isActive).toBe(true) // Default is true
  })

  it('should fail without required fields', async () => {
    const user = new User({})

    await expect(user.save()).rejects.toThrow()
  })

  it('should fail with duplicate email', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10)

    await User.create({
      name: 'First User',
      email: 'duplicate@test.com',
      password: hashedPassword,
    })

    const duplicateUser = new User({
      name: 'Second User',
      email: 'duplicate@test.com',
      password: hashedPassword,
    })

    await expect(duplicateUser.save()).rejects.toThrow()
  })

  it('should validate email format', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10)

    const user = new User({
      name: 'Invalid Email',
      email: 'invalid-email',
      password: hashedPassword,
    })

    await expect(user.save()).rejects.toThrow()
  })
})
