const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number },
    // Up to 4 photos per dress. imageUrl is kept as the primary/first photo
    // for backward compatibility with older products saved before this field existed.
    imageUrl: { type: String, required: true },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
