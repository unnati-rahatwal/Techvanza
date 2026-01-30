import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paymentId: { type: String },
    orderId: { type: String },
    blockchainTxHash: { type: String },
    status: { type: String, default: 'completed' },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
