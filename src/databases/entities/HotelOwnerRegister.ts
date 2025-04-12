import mongoose from "mongoose";
import { UserAttrs } from "./User";

export type HotelOwnerStatus = "pending" | "approved" | "rejected";

interface HotelOwnerRegisterAttrs {
  user: mongoose.Schema.Types.ObjectId;
  hotelInfoFileUrl: string;
  status?: HotelOwnerStatus;
}

export interface HotelOwnerRegisterDoc extends mongoose.Document {
  user:  mongoose.Schema.Types.ObjectId;
  hotelInfoFileUrl: string;
  status: HotelOwnerStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface HotelOwnerRegisterModel extends mongoose.Model<HotelOwnerRegisterDoc> {
  build(attrs: HotelOwnerRegisterAttrs): HotelOwnerRegisterDoc;
}

const hotelOwnerRegisterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotelInfoFileUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

hotelOwnerRegisterSchema.statics.build = (attrs: HotelOwnerRegisterAttrs) => {
  return new HotelOwnerRegister(attrs);
};

const HotelOwnerRegister = mongoose.model<HotelOwnerRegisterDoc, HotelOwnerRegisterModel>(
  "HotelOwnerRegister",
  hotelOwnerRegisterSchema
);

export { HotelOwnerRegister };
