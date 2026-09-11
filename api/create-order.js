const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { amount } = req.body || {};
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'A valid amount (in rupees) is required' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    });

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('create-order.js error:', err);
    return res.status(500).json({ error: 'Could not create Razorpay order' });
  }
};
