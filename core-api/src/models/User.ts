import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types";

export interface UserDocument extends Omit<IUser, "_id">, Document {}

const UserSchema = new Schema<UserDocument>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });
UserSchema.index({ verified: 1 });

export const User = mongoose.model<UserDocument>("User", UserSchema);
