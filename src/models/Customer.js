import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  location: { 
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  zone: { type: String, required: true },
  firstOrderCompleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model("Customer", customerSchema);