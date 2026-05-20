import mongoose, { Schema, Model, Document, Types } from "mongoose";

export type UserRole = "student" | "teacher" | "admin";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  avatarPublicId?: string;
  rollNumber?: string;          // for students
  department?: string;
  bio?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  resetTokenHash?: string;
  resetTokenExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
      index: true,
    },
    avatarUrl: String,
    avatarPublicId: String,
    rollNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    verificationOtp: String,
    verificationOtpExpires: Date,
    resetTokenHash: String,
    resetTokenExpires: Date,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

// In development, delete the cached model so schema changes take effect
// without requiring a full server restart.
if (process.env.NODE_ENV !== "production" && mongoose.models.User) {
  delete mongoose.models.User;
}

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export type UserDoc = Document & IUser;
