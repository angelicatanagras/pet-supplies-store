import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  address?: string;
  petName?: string;
  petType?: 'dog' | 'cat' | 'bird' | 'other';
  notes?: string;
  totalPurchases: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    petName: {
      type: String,
      trim: true,
    },
    petType: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'other'],
    },
    notes: {
      type: String,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
