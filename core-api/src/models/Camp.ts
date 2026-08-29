import mongoose, { Schema, Document } from "mongoose";
import { ICamp } from "../types";

export interface CampDocument extends Omit<ICamp, "_id">, Document {}

const CampSchema = new Schema<CampDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["medical", "food", "shelter", "rest", "other"],
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
    description: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    operatingHours: {
      type: String,
      trim: true,
    },
    services: [
      {
        type: String,
        trim: true,
      },
    ],
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

CampSchema.index({ type: 1 });
CampSchema.index({ verified: 1 });
CampSchema.index({ location: "2dsphere" });
CampSchema.index({ operator: 1 });

export const Camp = mongoose.model<CampDocument>("Camp", CampSchema);
