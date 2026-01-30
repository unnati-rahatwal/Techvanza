// Script to update all buyer mobile numbers in the database
// Run with: node scripts/update-mobile-numbers.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: String,
    name: String,
    mobile: String,
    password: String,
    role: String,
    location: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    establishmentYear: String,
    wasteTypes: [String],
    interestTypes: [String],
    createdAt: Date
}, { collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function updateMobileNumbers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Update all buyers
        console.log('📱 Updating mobile numbers for all buyers...');
        const buyerResult = await User.updateMany(
            { role: 'buyer' },
            { $set: { mobile: '9167595918' } }
        );
        console.log(`✅ Updated ${buyerResult.modifiedCount} buyer(s)\n`);

        // Optional: Update all suppliers too (uncomment if needed)
        // console.log('📱 Updating mobile numbers for all suppliers...');
        // const supplierResult = await User.updateMany(
        //     { role: 'supplier' },
        //     { $set: { mobile: '9167595918' } }
        // );
        // console.log(`✅ Updated ${supplierResult.modifiedCount} supplier(s)\n`);

        // Display updated users
        console.log('📋 Updated Buyers:');
        const buyers = await User.find({ role: 'buyer' }).select('name email mobile role');
        buyers.forEach(buyer => {
            console.log(`   - ${buyer.name} (${buyer.email}): ${buyer.mobile}`);
        });

        console.log('\n✨ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

updateMobileNumbers();
