const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number },
    imageUrl: { type: String, required: true },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: null },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    // null/undefined = stock not tracked (always available); a number tracks
    // remaining units — 0 shows "Sold Out", low numbers show "Only X left".
    stock: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
