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
    sizes: { type: [String], default: [] }, // e.g. ["S","M","L","XL","XXL"]
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
