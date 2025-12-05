import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  _id: String,
  name: String,
  price: Number
});

export default mongoose.model("Item", itemSchema);