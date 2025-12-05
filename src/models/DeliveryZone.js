import mongoose from "mongoose";

const deliveryZoneSchema = new mongoose.Schema({
  zone: String,
  baseFee: Number,
  perKmRate: Number
});

export default mongoose.model("DeliveryZone", deliveryZoneSchema);