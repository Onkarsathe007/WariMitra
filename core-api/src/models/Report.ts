import mongoose, { Schema, Document } from "mongoose";
import { IReport } from "../types";

export interface ReportDocument extends Omit<IReport, "_id">, Document {}

const ReportSchema = new Schema<ReportDocument>(
  {
    type: {
      type: String,
      enum: ["missing_person", "found_item", "medical_emergency", "other"],
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
      required: true,
      trim: true,
    },
    reporterPhone: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "resolved", "dismissed"],
      default: "pending",
    },
    confirmationCode: {
      type: String,
      trim: true,
    },
    confirmedAt: {
      type: Date,
    },
    radius: {
      type: Number,
      default: 2,
    },
    media: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

ReportSchema.index({ type: 1 });
ReportSchema.index({ status: 1 });
ReportSchema.index({ reporterPhone: 1 });
ReportSchema.index({ location: "2dsphere" });
ReportSchema.index({ createdAt: -1 });

export const Report = mongoose.model<ReportDocument>("Report", ReportSchema);
