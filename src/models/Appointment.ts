import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  petName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  service: 'Full Grooming' | 'Bath & Brush' | 'Nail Trim' | 'Hair Cut';
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    ownerPhone: {
      type: String,
      required: false,
    },
    service: {
      type: String,
      enum: ['Full Grooming', 'Bath & Brush', 'Nail Trim', 'Hair Cut'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
