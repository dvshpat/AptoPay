// models/Request.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRequest extends Document {
  requestId: string;
  requesterAddress: string;
  requesterName?: string;
  payerAddress?: string | null;   // optional: who this request is for
  payerName?: string | null;
  amount: string; // amount in octas (u64 string)
  amountInHuman?: string; // e.g. "0.01"
  memo?: string;
  status: "pending" | "paid" | "cancelled";
  txHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>(
  {
    requestId: { type: String, required: true, unique: true },
    requesterAddress: { type: String, required: true, lowercase: true },
    requesterName: { type: String },
    payerAddress: { type: String, lowercase: true }, // optional search target
    payerName: { type: String },
    amount: { type: String, required: true }, // store as string for big numbers
    amountInHuman: { type: String },
    memo: { type: String },
    status: { type: String, enum: ["pending", "paid", "cancelled"], default: "pending" },
    txHash: { type: String },
  },
  { timestamps: true }
);

const Request: Model<IRequest> = mongoose.models.Request || mongoose.model("Request", RequestSchema);
export default Request;
