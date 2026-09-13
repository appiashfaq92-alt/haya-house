const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    name: String,
    phone: String,
    address: String,
    items: { type: Array, default: [] },
    amount: Number,
    paymentMethod: { type: String, default: 'razorpay' }, // razorpay | upi | cod
    razorpayOrderId: String,
    razorpayPaymentId: String,
    // pending -> confirmed -> shipped -> delivered (or cancelled)
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
