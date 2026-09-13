const crypto = require('crypto');
const connectDB = require('../lib/mongodb');
const Order = require('../models/Order');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer, // { orderId, name, phone, address, items, amount }
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment details' });
    }

    // This is the ONLY trustworthy way to confirm a Razorpay payment —
    // never trust a "payment successful" message sent directly from the browser.
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // Signature verified — safe to record the order as paid.
    try {
      await connectDB();
      await Order.create({
        orderId: customer?.orderId || ('ORD' + Date.now().toString().slice(-8)),
        name: customer?.name,
        phone: customer?.phone,
        address: customer?.address,
        items: customer?.items || [],
        amount: customer?.amount,
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: 'confirmed',
      });
    } catch (dbErr) {
      // Payment is genuinely verified even if saving the order record fails —
      // log it so you don't lose track of the order, but still tell the
      // customer their payment succeeded.
      console.error('Order save failed after verified payment:', dbErr);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('verify-payment.js error:', err);
    return res.status(500).json({ success: false, error: 'Server error during verification' });
  }
};
