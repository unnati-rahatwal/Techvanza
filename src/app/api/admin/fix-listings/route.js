import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';

// Helper to get image based on type
const getWasteImage = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('plastic')) return 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('paper')) return 'https://images.unsplash.com/photo-1605600659873-d808a13a4d2d?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('metal')) return 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('glass')) return 'https://images.unsplash.com/photo-1533624776077-0a25ae639a69?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('organic')) return 'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('e-waste') || typeLower.includes('electronic')) return 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'; // General Generic
};

export async function GET(request) {
    try {
        await dbConnect();

        // 1. Get all suppliers
        const suppliers = await User.find({ role: 'supplier' });
        if (suppliers.length === 0) {
            return NextResponse.json({ error: 'No suppliers found to assign listings to.' }, { status: 400 });
        }

        // 2. Get all listings
        const listings = await Listing.find({});

        let updatedCount = 0;
        let updates = [];

        for (const listing of listings) {
            let needsUpdate = false;

            // Fix Supplier: If missing or invalid, assign random supplier
            if (!listing.supplier) {
                const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
                listing.supplier = randomSupplier._id;
                needsUpdate = true;
            }

            // Fix Image: If missing, assign Unsplash URL
            if (!listing.imageUrl || listing.imageUrl === '') {
                listing.imageUrl = getWasteImage(listing.wasteType);
                needsUpdate = true;
            }

            if (needsUpdate) {
                await listing.save();
                updatedCount++;
                updates.push(`Updated ${listing.title} (${listing._id})`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Fixed ${updatedCount} listings.`,
            details: updates
        }, { status: 200 });

    } catch (error) {
        console.error('Fix Listings Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
