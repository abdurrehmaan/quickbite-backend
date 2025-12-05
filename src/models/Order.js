import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  }],
  basePrice: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0 },
  promoDiscount: { type: Number, default: 0, min: 0 },
  finalTotal: { type: Number, required: true, min: 0 },
  breakdown: { type: Object, required: true },
  placedAt: { type: Date, required: true, index: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound indexes for common queries
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ status: 1, placedAt: -1 });

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.qty, 0);
});

// Instance method to calculate totals
orderSchema.methods.calculateTotal = function() {
  this.finalTotal = this.basePrice + this.deliveryFee - this.promoDiscount;
  return this.finalTotal;
};

export default mongoose.model("Order", orderSchema);