import mongoose, { Schema, Document } from "mongoose";
import { IWari } from "../types";

export interface WariDocument extends Omit<IWari, "_id">, Document {}

const WariSchema = new Schema<WariDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    route: {
      type: {
        type: String,
        enum: ["LineString"],
        required: true,
      },
      coordinates: {
        type: [[Number]],
        required: true,
      },
    },
    startPoint: {
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
    endPoint: {
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
    associatedPlace: {
      type: String,
      trim: true,
    },
    history: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    contactPhone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

WariSchema.index({ status: 1 });
WariSchema.index({ "startPoint.coordinates": "2dsphere" });
WariSchema.index({ "route.coordinates": "2dsphere" });

export const Wari = mongoose.model<WariDocument>("Wari", WariSchema);
