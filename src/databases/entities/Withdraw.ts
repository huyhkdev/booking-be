import mongoose from "mongoose";

interface WithdrawAttrs {
  wallet:  mongoose.Types.ObjectId;
  transactionID: string;
  amount: number;
}

export interface WithdrawDoc extends mongoose.Document {
  wallet:mongoose.Types.ObjectId;
  transactionID: string;
  amount: number;
  createdAt: Date;
}

interface WithdrawModel extends mongoose.Model<WithdrawDoc> {
  build(attrs: WithdrawAttrs): WithdrawDoc;
}

const withdrawSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    transactionID: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
  }
);

withdrawSchema.statics.build = (attrs: WithdrawAttrs) => {
  return new Withdraw(attrs);
};

const Withdraw = mongoose.model<WithdrawDoc, WithdrawModel>("Withdraw", withdrawSchema);

export { Withdraw };
