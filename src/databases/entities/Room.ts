import mongoose, { Document, Schema } from 'mongoose';
import { IHotel } from './Hotel';

export interface IRoom extends Document {
  hotel: IHotel;
  name: string;
  pricePerNight: number;
  roomNumber: number;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
  description?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoomCreate extends Document {
  hotel: string;
  name: string;
  roomNumber: number;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
  description?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Định nghĩa schema cho Room
const roomSchema: Schema<IRoom> = new Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    }, // Liên kết tới Hotel entity
    name: { type: String, required: true },
    roomNumber: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },
    capacity: { type: Number, required: true },
    amenities: [{ type: String }], // Các tiện ích như máy lạnh, TV, minibar...
    isAvailable: { type: Boolean, default: true },
    description: { type: String },
    images: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Tạo model từ schema
const Room = mongoose.model<IRoom>('Room', roomSchema);

export default Room;
