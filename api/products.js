const connectDB = require('../lib/mongodb');
const Product = require('../models/Product');

module.exports = async (req, res) => {
  console.log('[products] invoked, method =', req.method);
  try {
    console.log('[products] connecting to DB...');
    await connectDB();
    console.log('[products] DB connected');

    if (req.method === 'GET') {
      const products = await Product.find().sort({ createdAt: -1 });
      console.log('[products] fetched', products.length, 'products');
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const adminKey = req.headers['x-admin-key'];
      if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized: invalid admin key' });
      }

      const { name, category, price, mrp, imageUrl, videoUrl } = req.body || {};
      if (!name || !category || !price || !imageUrl) {
        return res.status(400).json({ error: 'name, category, price and imageUrl are required' });
      }

      const product = await Product.create({ name, category, price, mrp, imageUrl, videoUrl });
      return res.status(201).json(product);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.log('[products] ERROR:', err.message);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
