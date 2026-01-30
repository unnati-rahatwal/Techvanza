import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BlockchainLog from '@/models/BlockchainLog';
import Listing from '@/models/Listing';

export async function POST() {
    try {
        await dbConnect();

        // Get some sold listings
        const listings = await Listing.find({ status: 'sold' }).limit(5);

        if (listings.length === 0) {
            return NextResponse.json({ message: 'No sold listings found' }, { status: 404 });
        }

        const results = [];

        // Add different states to different listings for demo
        for (let i = 0; i < listings.length; i++) {
            const listing = listings[i];
            const listingId = listing._id.toString();

            // Clear existing logs for this listing
            await BlockchainLog.deleteMany({ listingId });

            // CREATED
            await BlockchainLog.create({
                listingId,
                eventType: 'CREATED',
                timestamp: new Date(listing.createdAt),
                txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                isSimulated: true
            });

            // PURCHASED
            const purchaseDate = new Date(listing.createdAt);
            purchaseDate.setHours(purchaseDate.getHours() + 2);
            await BlockchainLog.create({
                listingId,
                eventType: 'PURCHASED',
                timestamp: purchaseDate,
                txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                isSimulated: true
            });

            // Add different states based on index for variety
            if (i >= 1) {
                // PROCESSING
                const processingDate = new Date(purchaseDate);
                processingDate.setHours(processingDate.getHours() + 4);
                await BlockchainLog.create({
                    listingId,
                    eventType: 'PROCESSING',
                    timestamp: processingDate,
                    txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                    isSimulated: true
                });
            }

            if (i >= 2) {
                // SHIPPED
                const shippedDate = new Date(purchaseDate);
                shippedDate.setDate(shippedDate.getDate() + 1);
                await BlockchainLog.create({
                    listingId,
                    eventType: 'SHIPPED',
                    timestamp: shippedDate,
                    txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                    isSimulated: true
                });
            }

            if (i >= 3) {
                // DELIVERED
                const deliveredDate = new Date(purchaseDate);
                deliveredDate.setDate(deliveredDate.getDate() + 3);
                await BlockchainLog.create({
                    listingId,
                    eventType: 'DELIVERED',
                    timestamp: deliveredDate,
                    txHash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                    isSimulated: true
                });
            }

            results.push({
                listingId,
                title: listing.title,
                states: i >= 3 ? 'All 5 states' : i >= 2 ? '4 states (up to SHIPPED)' : i >= 1 ? '3 states (up to PROCESSING)' : '2 states (CREATED + PURCHASED)'
            });
        }

        return NextResponse.json({
            message: 'Successfully added tracking states',
            results
        });

    } catch (error) {
        console.error('Error adding tracking states:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
