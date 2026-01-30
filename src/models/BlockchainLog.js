import mongoose from 'mongoose';

const BlockchainLogSchema = new mongoose.Schema({
    listingId: {
        type: String,
        required: true,
        index: true
    },
    eventType: {
        type: String,
        enum: ['CREATED', 'PURCHASED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        required: true
    },
    supplierHash: String,
    buyerHash: String,
    amount: Number,
    txHash: {
        type: String,
        default: function () {
            // Generate fake tx hash for simulation
            return '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        }
    },
    updatedBy: String,
    metadata: mongoose.Schema.Types.Mixed,
    isSimulated: {
        type: Boolean,
        default: true // Mark as simulated if not from real blockchain
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.BlockchainLog || mongoose.model('BlockchainLog', BlockchainLogSchema);
