import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';

export async function POST() {
    try {
        await dbConnect();

        // Update all listings to have reasonable prices for test mode
        // Set prices between ₹10-500 per kg, ensuring total stays under ₹50,000
        const listings = await Listing.find({});

        let updated = 0;
        for (const listing of listings) {
            // Calculate safe price per kg (max total should be under 50,000)
            const maxPricePerKg = Math.floor(45000 / listing.quantity);
            const newPrice = Math.min(maxPricePerKg, Math.floor(Math.random() * 400) + 50);

            await Listing.findByIdAndUpdate(listing._id, {
                pricePerKg: newPrice
            });
            updated++;
        }

        return NextResponse.json({
            success: true,
            message: `Updated ${updated} listings to test-mode safe prices`,
            updated
        });

    } catch (error) {
        console.error("Price update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
