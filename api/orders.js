const connectDB = require('../lib/mongodb');
const Order = require('../models/Order');

module.exports = async (req, res) => {
  try {
    await connectDB();

    if (req.method === 'GET') {
      const { orderId, admin } = req.query || {};

      // Admin listing: all orders, most recent first (protected)
      if (admin) {
        const adminKey = req.headers['x-admin-key'];
        if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
        return res.status(200).json(orders);
      }

      // Customer tracking: lookup by their own orderId (public, no key needed)
      if (!orderId) {
        return res.status(400).json({ error: 'orderId is required' });
      }
      const order = await Order.findOne({ orderId });
      if (!order) {
        return res.status(404).json({ error: 'No order found with that ID' });
      }
      return res.status(200).json(order);
    }

    if (req.method === 'POST') {
      const { orderId, name, phone, address, items, amount, paymentMethod, status } = req.body || {};
      if (!orderId || !name || !phone || !address || !amount) {
        return res.status(400).json({ error: 'orderId, name, phone, address and amount are required' });
      }
      const order = await Order.create({
        orderId, name, phone, address,
        items: items || [], amount,
        paymentMethod: paymentMethod || 'cod',
        status: status || 'pending',
      });
      return res.status(201).json(order);
    }

    if (req.method === 'PATCH') {
      // Admin-only: update an order's status
      const adminKey = req.headers['x-admin-key'];
      if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { orderId, status } = req.body || {};
      const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
      if (!orderId || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Valid orderId and status are required' });
      }
      const updated = await Order.findOneAndUpdate({ orderId }, { status }, { new: true });
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(200).json(updated);
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (err) {
    console.error('orders.js error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
