import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    blockchainTxHash: { type: String }, // Store the Sepolia Tx Hash
    status: { type: String, default: 'pending' },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
