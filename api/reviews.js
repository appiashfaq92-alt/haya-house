const connectDB = require('../lib/mongodb');
const Review = require('../models/Review');

module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const { productId } = req.query || {};
      if (!productId) {
        return res.status(400).json({ error: 'productId is required' });
      }
      const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
      return res.status(200).json(reviews);
    }

    if (req.method === 'POST') {
      const { productId, name, rating, comment, imageUrl, videoUrl } = req.body || {};
      if (!productId || !name || !rating) {
        return res.status(400).json({ error: 'productId, name and rating are required' });
      }
      const ratingNum = Number(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: 'rating must be between 1 and 5' });
      }
      const review = await Review.create({
        productId, name, rating: ratingNum, comment, imageUrl, videoUrl,
      });
      return res.status(201).json(review);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error('reviews.js error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
