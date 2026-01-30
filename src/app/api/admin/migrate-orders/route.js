import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import Order from '@/models/Order';
import User from '@/models/User';

export async function POST(request) {
    try {
        await dbConnect();

        // Get buyer ID from request or find first buyer
        const body = await request.json().catch(() => ({}));
        let buyerId = body.buyerId;

        if (!buyerId) {
            // Find first buyer in system
            const buyer = await User.findOne({ role: 'buyer' });
            if (!buyer) {
                return NextResponse.json({ error: 'No buyer found in system' }, { status: 400 });
            }
            buyerId = buyer._id;
        }

        // Find all sold listings
        const soldListings = await Listing.find({ status: 'sold' });

        let created = 0;
        for (const listing of soldListings) {
            // Check if order already exists
            const existingOrder = await Order.findOne({ listingId: listing._id });

            if (!existingOrder) {
                // Create order from sold listing
                await Order.create({
                    buyerId: listing.buyer || buyerId,
                    supplierId: listing.supplier,
                    listingId: listing._id,
                    quantity: listing.quantity,
                    totalPrice: listing.pricePerKg * listing.quantity,
                    status: 'completed',
                    timestamp: listing.updatedAt || listing.createdAt
                });
                created++;
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Created ' + created + ' order records from ' + soldListings.length + ' sold listings',
            created
        });

    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
