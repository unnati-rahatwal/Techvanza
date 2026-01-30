import mongoose from 'mongoose';

const CreditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    wasteType: String,
    quantity: Number,
    carbonSaved: Number, // In kg CO2
    impactDescription: String,
    creditsEarned: Number, // Internal currency
    taxBenefitValue: Number, // In INR, calculated formula
    certificationLevel: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Credit || mongoose.model('Credit', CreditSchema);
