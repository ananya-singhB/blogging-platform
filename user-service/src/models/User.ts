import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password: string
  bio?: string
  isActive: boolean
  isEmailVerified: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  createdAt: Date
  updatedAt: Date
}

// Type for JSON representation (with userId instead of _id)
export interface IUserJSON {
  userId: string
  name: string
  email: string
  bio?: string
  isActive: boolean
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        // ret.userId = ret._id
        // delete ret._id
        // delete ret.__v
        // delete ret.password
        delete ret.emailVerificationToken
        delete ret.emailVerificationExpires
        return ret
      },
    },
  }
)

userSchema.index({ emailVerificationToken: 1 })

export default mongoose.model<IUser>('User', userSchema)
