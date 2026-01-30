import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';

// Random Data Generators
const wasteTypes = [
    'Plastic (PET, HDPE)', 'Paper & Cardboard', 'Glass', 'Metal (Scrap)',
    'E-Waste', 'Textile Waste', 'Organic/Bio'
];

const titles = [
    'Bulk Recyclable Materials', 'Scrap Lot available', 'High Quality Waste', 'Mixed Bundle', 'Factory Surplus'
];

const locations = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Ahmedabad'];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET(request) {
    try {
        await dbConnect();

        // 1. Find all suppliers
        const suppliers = await User.find({ role: 'supplier' });

        if (suppliers.length === 0) {
            return NextResponse.json({ message: 'No suppliers found to seed data for.' }, { status: 404 });
        }

        let createdCount = 0;

        // 2. Create dummy listings for each supplier
        for (const supplier of suppliers) {
            // Create 3-5 listings per supplier
            const numListings = getRandomInt(3, 5);

            for (let i = 0; i < numListings; i++) {
                const wasteType = getRandomItem(wasteTypes);
                const quantity = getRandomInt(50, 5000); // 50kg to 5000kg
                const pricePerKg = getRandomInt(10, 150); // ₹10 to ₹150 per kg

                await Listing.create({
                    supplier: supplier._id,
                    title: `${getRandomItem(titles)} - ${wasteType}`,
                    description: `High quality ${wasteType} available for immediate pickup. Collected from secure sources.`,
                    wasteType: wasteType,
                    quantity: quantity,
                    pricePerKg: pricePerKg,
                    location: supplier.location || getRandomItem(locations),
                    status: 'available',
                    imageUrl: '', // Optional, leave empty or add placeholders if needed
                    createdAt: new Date(Date.now() - getRandomInt(0, 1000000000)) // Random time in past ~10 days
                });
                createdCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully created ${createdCount} listings for ${suppliers.length} suppliers.`,
            suppliers: suppliers.map(s => s.name)
        }, { status: 200 });

    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Seeding failed', details: error.message }, { status: 500 });
    }
}
