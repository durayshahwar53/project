import mongoose, { Schema, Model, Types } from "mongoose";

export interface IAttachment {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  originalName: string;
}

export interface IAssignment {
  _id: Types.ObjectId;
  title: string;
  description: string;
  subject?: string;
  deadline: Date;
  totalMarks: number;
  teacher: Types.ObjectId;
  attachments: IAttachment[];
  allowLateSubmission: boolean;
  latePenaltyMarks: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
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

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    subject: { type: String, trim: true },
    deadline: { type: Date, required: true, index: true },
    totalMarks: { type: Number, default: 100, min: 0 },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attachments: [AttachmentSchema],
    allowLateSubmission: { type: Boolean, default: true },
    latePenaltyMarks: { type: Number, default: 0, min: 0 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// In dev, drop the cached model so newly added schema fields take effect
// without requiring a full server restart.
if (process.env.NODE_ENV !== "production" && mongoose.models.Assignment) {
  delete mongoose.models.Assignment;
}

export const Assignment: Model<IAssignment> =
  (mongoose.models.Assignment as Model<IAssignment>) ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema);
