import mongoose from 'mongoose';

const RequirementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    wasteType: {
        type: String,
        required: [true, 'Please provide waste type'],
    },
    quantity: {
        type: String,
        required: [true, 'Please provide quantity'],
    },
    priceRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    imageUrl: {
        type: String, // Storing base64 for now
        required: [true, 'Please provide an image'],
    },
    status: {
        type: String,
        enum: ['active', 'fulfilled', 'cancelled'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Requirement || mongoose.model('Requirement', RequirementSchema);
