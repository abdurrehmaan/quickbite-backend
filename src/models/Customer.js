import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  _id: String,
  name: String,
  location: { lat: Number, lng: Number },
  zone: String,
  firstOrderCompleted: { type: Boolean, default: false }
});

export default mongoose.model("Customer", customerSchema);