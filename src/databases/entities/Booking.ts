import mongoose, { Document, Schema } from 'mongoose';
// Define the interface for Booking
export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  room: [{ type: mongoose.Types.ObjectId; ref: 'Room' }];
  checkInDate: Date;
  checkOutDate: Date;
  totalGuests: number;
  totalPrice: number;
  transactionID: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod: 'credit_card' | 'cash';
  createdAt: Date;
  updatedAt: Date;
  isReview: boolean
}

// Define the schema for Booking
const bookingSchema: Schema<IBooking> = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    ],
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalGuests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    isReview: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    transactionID: { type: String },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'cash'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model from the schema
const Booking = mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
