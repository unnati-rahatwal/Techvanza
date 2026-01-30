import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a title']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    wasteType: {
        type: String,
        required: [true, 'Please specify waste type']
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide quantity in kg']
    },
    pricePerKg: {
        type: Number,
        required: [true, 'Please provide price per kg']
    },
    location: {
        type: String,
        required: [true, 'Please provide location']
    },
    imageUrl: {
        type: String,
        required: [false, 'Image is optional']
    },
    status: {
        type: String,
        enum: ['available', 'sold'],
        default: 'available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
