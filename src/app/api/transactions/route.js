import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Listing from '@/models/Listing';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { listingId, buyerId, quantity } = body;

        if (!listingId || !buyerId || !quantity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get Listing
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        if (listing.status !== 'available') {
            return NextResponse.json({ error: 'Listing is no longer available' }, { status: 400 });
        }

        if (quantity > listing.quantity) {
            return NextResponse.json({ error: `Only ${listing.quantity}kg available` }, { status: 400 });
        }

        // 2. Create Transaction
        const totalPrice = listing.pricePerKg * quantity;

        const transaction = await Transaction.create({
            listing: listingId,
            buyer: buyerId,
            supplier: listing.supplier,
            quantity,
            totalPrice,
            status: 'completed' // For hackathon, auto-complete. In real app, goes to payment gateway.
        });

        // 3. Update Listing
        // If purchased full quantity, mark as sold. Else reduce quantity.
        // For simplicity, let's assume full buy or nothing, OR reduce quantity.
        // Let's implement partial buy logic:
        const remainingQty = listing.quantity - quantity;
        if (remainingQty <= 0) {
            listing.status = 'sold';
            listing.quantity = 0;
        } else {
            listing.quantity = remainingQty;
        }
        await listing.save();

        return NextResponse.json({ message: 'Purchase successful', transaction }, { status: 201 });

    } catch (error) {
        console.error('Error processing transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
