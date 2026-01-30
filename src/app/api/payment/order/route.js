import { NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay';
import dbConnect from '@/lib/mongodb';
import Requirement from '@/models/Listing'; // Mapped to Listing model
import Transaction from '@/models/Transaction'; // To log intent? Or just Listing

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { listingId, quantity, userId } = body;

        // Fetch listing to calculate amount
        const listing = await Requirement.findById(listingId);

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Calculate total amount (Price per kg * quantity)
        const price = listing.pricePerKg;
        const amount = Math.round(price * quantity * 100); // Amount in paisa

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `rcpt_${uuidv4().slice(0, 20)}`, // Max 40 chars allowed
            notes: {
                listingId: listingId,
                buyerId: userId,
                supplierId: listing.userId.toString()
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);

    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
    }
}
