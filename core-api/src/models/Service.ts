import mongoose, { Schema, Document } from "mongoose";
import { IService } from "../types";

export interface ServiceDocument extends Omit<IService, "_id">, Document {}

const ServiceSchema = new Schema<ServiceDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["medical", "food", "water", "shelter", "other"],
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    media: [
      {
        type: String,
        trim: true,
      },
    ],
    operator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ServiceSchema.index({ type: 1 });
ServiceSchema.index({ available: 1 });
ServiceSchema.index({ verified: 1 });
ServiceSchema.index({ location: "2dsphere" });
ServiceSchema.index({ operator: 1 });

export const Service = mongoose.model<ServiceDocument>("Service", ServiceSchema);
