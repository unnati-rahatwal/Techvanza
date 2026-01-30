import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    mobile: {
        type: String,
        required: [true, 'Please provide a mobile number'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
    },
    role: {
        type: String,
        enum: ['supplier', 'buyer'],
        required: [true, 'Please specify a role'],
    },
    location: {
        type: String,
        required: [true, 'Please provide a location'],
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    establishmentYear: {
        type: String, // Kept as string to match previous implementation, could be Number
        required: [true, 'Please provide establishment year'],
    },
    wasteTypes: {
        type: [String],
        default: [],
    },
    interestTypes: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
