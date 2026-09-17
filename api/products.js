const connectDB = require('../lib/mongodb');
const Product = require('../models/Product');

function checkAdmin(req, res){
  const adminKey = req.headers['x-admin-key'];
  if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
    res.status(401).json({ error: 'Unauthorized: invalid admin key' });
    return false;
  }
  return true;
}

module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      if (!checkAdmin(req, res)) return;
      const { name, category, price, mrp, imageUrl, videoUrl } = req.body || {};
      if (!name || !category || !price || !imageUrl) {
        return res.status(400).json({ error: 'name, category, price and imageUrl are required' });
      }
      const product = await Product.create({ name, category, price, mrp, imageUrl, videoUrl });
      return res.status(201).json(product);
    }

    if (req.method === 'PUT') {
      if (!checkAdmin(req, res)) return;
      const { id, name, category, price, mrp, imageUrl, videoUrl } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const updated = await Product.findByIdAndUpdate(
        id,
        { name, category, price, mrp, imageUrl, videoUrl },
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (!checkAdmin(req, res)) return;
      const { id } = req.query || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error('products.js error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
