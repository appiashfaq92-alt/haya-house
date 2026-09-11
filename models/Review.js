const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    imageUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
