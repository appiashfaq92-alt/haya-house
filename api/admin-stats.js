const connectDB = require('../lib/mongodb');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

module.exports = async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    await connectDB();

    const [productCount, orderCount, reviewCount, orders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Order.find({}, 'amount status'),
    ]);

    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const ordersByStatus = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      if (ordersByStatus[o.status] !== undefined) ordersByStatus[o.status]++;
    });

    return res.status(200).json({
      productCount, orderCount, reviewCount, totalRevenue, ordersByStatus,
    });
  } catch (err) {
    console.error('admin-stats.js error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
