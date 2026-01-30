import { NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay';
import dbConnect from '@/lib/mongodb';
import Requirement from '@/models/Requirement'; // Assuming 'Requirement' is the Listing model
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { listingId, quantity, userId } = body;

        // Fetch listing to calculate amount
        // Note: In a real app we would check stock availability here too
        const listing = await Requirement.findById(listingId);
        
        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        // Calculate total amount (Price per kg * quantity)
        // Ensure price is a number
        const price = parseInt(listing.priceRange.min); // Using min price as the 'price' for now
        const amount = price * quantity * 100; // Amount in paisa for Razorpay

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
