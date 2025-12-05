import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
  name: String,
  type: String,
  restaurantId: String,
  zone: String,
  discount: Number,
  flat: Number,
  active: Boolean
});

export default mongoose.model("Promo", promoSchema);