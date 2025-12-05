import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  _id: String,
  name: String,
  location: { lat: Number, lng: Number },
  zone: String
});

export default mongoose.model("Restaurant", restaurantSchema);