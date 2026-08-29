import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types";

export interface UserDocument extends Omit<IUser, "_id">, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["varkari", "helper", "admin"],
      default: "varkari",
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 1,
      max: 150,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    city: {
      type: String,
      trim: true,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ verified: 1 });
UserSchema.index({ profileComplete: 1 });

export const User = mongoose.model<UserDocument>("User", UserSchema);
