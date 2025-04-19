import mongoose, { Document, Schema } from 'mongoose';


// Định nghĩa interface cho Hotel
export interface IHotel extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  star: number;
  description: string;
  longDescription: string;
  rooms: mongoose.Types.ObjectId[];
  type: string;
  amenities: string[];
  phoneNumber: string;
  email: string;
  website?: string;
  images: string[];
  latitude: string;
  longitude: string;
  createdAt: Date;
  updatedAt: Date;
}

const hotelSchema: Schema<IHotel> = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    star: { type: Number, min: 0, max: 5 },
    description: { type: String },
    longDescription: { type: String },
    type: { type: String },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    amenities: [{ type: String }],
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    images: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Tạo model từ schema
const Hotel = mongoose.model<IHotel>('Hotel', hotelSchema);

export default Hotel;
