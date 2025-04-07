import mongoose, { Document, Schema } from 'mongoose';
import { IHotel } from './Hotel';

// Định nghĩa interface cho Room
export interface IRoom extends Document {
  hotel: IHotel; // Liên kết đến Hotel
  roomType: string;
  name: string;
  pricePerNight: number;
  capacity: number; // Số lượng khách có thể ở
  amenities: string[]; // Tiện ích của phòng
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
    roomType: { type: String, required: true },
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
