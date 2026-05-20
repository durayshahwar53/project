import mongoose, { Schema, Model, Types } from "mongoose";
import { IAttachment } from "./Assignment";

export type SubmissionStatus = "submitted" | "late" | "graded";

export interface ISubmission {
  _id: Types.ObjectId;
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  file: IAttachment;
  note?: string;
  status: SubmissionStatus;
  isLate: boolean;
  submittedAt: Date;
  grade?: number;            // final grade after any late penalty
  gradeRaw?: number;         // grade the teacher entered, before deduction
  latePenaltyApplied?: number; // marks deducted for late submission
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema(
  {
    url: String,
    publicId: String,
    resourceType: String,
    format: String,
    bytes: Number,
    originalName: String,
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    file: { type: AttachmentSchema, required: true },
    note: { type: String, maxlength: 1500 },
    status: {
      type: String,
      enum: ["submitted", "late", "graded"],
      default: "submitted",
    },
    isLate: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
    grade: Number,
    gradeRaw: Number,
    latePenaltyApplied: { type: Number, default: 0 },
    feedback: { type: String, maxlength: 2000 },
    gradedAt: Date,
    gradedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

// In dev, drop the cached model so newly added schema fields take effect
// without requiring a full server restart.
if (process.env.NODE_ENV !== "production" && mongoose.models.Submission) {
  delete mongoose.models.Submission;
}

export const Submission: Model<ISubmission> =
  (mongoose.models.Submission as Model<ISubmission>) ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);
