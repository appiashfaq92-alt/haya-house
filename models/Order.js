const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    address: String,
    items: { type: Array, default: [] },
    amount: Number,
    paymentMethod: { type: String, default: 'razorpay' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
