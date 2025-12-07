import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { 
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  cuisine: { type: String }
}, {
  timestamps: true
});

export default mongoose.model("Restaurant", restaurantSchema);