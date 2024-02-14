
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
});

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);