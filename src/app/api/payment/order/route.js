import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';

export async function POST(request) {
    try {
        const { listingId, quantity } = await request.json();

        // Fetch listing to get price
        await dbConnect();
        const listing = await Listing.findById(listingId);

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Calculate total amount
        const amount = listing.pricePerKg * (quantity || listing.quantity);

        // 1. Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 2. Create Order options
        const options = {
            amount: Math.round(amount * 100), // convert to paisa
            currency: 'INR',
            receipt: uuidv4(),
            payment_capture: 1, // Auto capture
        };

        // 3. Create Order
        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
