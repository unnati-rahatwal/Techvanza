import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongodb.js';
import User from '../src/models/User.js';

async function updateMobileNumbers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await dbConnect();
        console.log('✅ Connected to MongoDB\n');

        // Update all buyers
        console.log('📱 Updating mobile numbers for all buyers...');
        const buyerResult = await User.updateMany(
            { role: 'buyer' },
            { $set: { mobile: '9167595918' } }
        );
        console.log(`✅ Updated ${buyerResult.modifiedCount} buyer(s)\n`);

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
