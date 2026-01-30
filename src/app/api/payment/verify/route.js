import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';
import { recordBlockchainPurchase } from '@/utils/blockchain';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            notes
        } = body;

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const generated_signature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
        }

        // 2. Update Database
        const { listingId, buyerId } = notes;

        // Update Listing Status
        const listing = await Listing.findByIdAndUpdate(listingId, {
            status: 'sold',
            buyer: buyerId
        }, { new: true });

        // 3. Write to Blockchain (Full Supply Chain Tracking)
        // Hash IDs for privacy
        const buyerHash = crypto.createHash('sha256').update(buyerId).digest('hex');

        // This process might take time, so we trigger it. In prod, use a queue.
        // For Hackathon, await it or fire-and-forget (awaiting for demo proof)
        const txHash = await recordBlockchainPurchase(listingId, buyerHash);

        return NextResponse.json({
            success: true,
            txHash,
            message: 'Payment verified and recorded on blockchain'
        });

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
