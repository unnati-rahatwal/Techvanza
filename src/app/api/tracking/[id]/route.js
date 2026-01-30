import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import BlockchainLog from '@/models/BlockchainLog';
import { getBlockchainHistory } from '@/utils/blockchain';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        await dbConnect();

        // 1. Fetch DB Data
        const listing = await Listing.findById(id).populate('supplier', 'name').populate('buyer', 'name');

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // 2. Fetch History (will auto-fallback to MongoDB if blockchain unavailable)
        let chainHistory = [];
        try {
            chainHistory = await getBlockchainHistory(id);
        } catch (e) {
            console.warn("History fetch failed:", e.message);
        }

        // 3. Check if using simulation
        const logs = await BlockchainLog.find({ listingId: id }).sort({ timestamp: 1 });
        const isSimulated = logs.length > 0 && logs[0].isSimulated;

        // 4. Map State Enum to String
        const states = ["CREATED", "PURCHASED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

        const formattedHistory = chainHistory.map((h, idx) => ({
            state: states[h.state] || 'UNKNOWN',
            timestamp: new Date(h.timestamp).toLocaleString(),
            updatedBy: h.updatedBy,
            txHash: h.txHash || logs[idx]?.txHash,
            isSimulated: logs[idx]?.isSimulated || false
        }));

        // Fallback if no history at all
        if (formattedHistory.length === 0) {
            formattedHistory.push({
                state: 'CREATED',
                timestamp: new Date(listing.createdAt).toLocaleString(),
                txHash: 'Genesis',
                isSimulated: true
            });
            if (listing.status === 'sold') {
                formattedHistory.push({
                    state: 'PURCHASED',
                    timestamp: new Date().toLocaleString(),
                    txHash: 'Pending...',
                    isSimulated: true
                });
            }
        }

        return NextResponse.json({
            listing: {
                title: listing.title,
                quantity: listing.quantity,
                supplier: listing.supplier?.name,
                buyer: listing.buyer?.name,
                status: listing.status
            },
            history: formattedHistory
        });

    } catch (error) {
        console.error("Tracking API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
