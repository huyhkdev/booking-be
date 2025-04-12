import mongoose from "mongoose";
import { UserAttrs } from "./User";


interface WalletAttrs {
    owner: string;
    connectedId: string;
    balance: number;
}

export interface WalletAttrsDoc extends mongoose.Document {
    owner: UserAttrs;
    connectedId: string;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

interface WalletModel extends mongoose.Model<WalletAttrsDoc> {
    build(attrs: WalletAttrs): WalletAttrsDoc;
}

const walletModelSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        connectedId: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            default: 0,
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

walletModelSchema.statics.build = (attrs: WalletAttrs) => {
    return new Wallet(attrs);
};

const Wallet = mongoose.model<WalletAttrsDoc, WalletModel>(
    "Wallet",
    walletModelSchema
);

export { Wallet };
