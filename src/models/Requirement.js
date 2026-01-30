import mongoose from 'mongoose';

const RequirementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    wasteType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    priceRange: {
        min: Number,
        max: Number
    },
    location: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'fulfilled', 'sold_out'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Requirement || mongoose.model('Requirement', RequirementSchema);
