import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import Order from '@/models/Order';

export async function GET() {
    try {
        await dbConnect();

        const soldListings = await Listing.find({ status: 'sold' }).limit(5);
        const orders = await Order.find({}).limit(5);

        return NextResponse.json({
            soldListings: soldListings.map(l => ({
                id: l._id,
                title: l.title,
                buyer: l.buyer,
                supplier: l.supplier,
                quantity: l.quantity,
                pricePerKg: l.pricePerKg
            })),
            orders: orders.map(o => ({
                id: o._id,
                buyerId: o.buyerId,
                listingId: o.listingId,
                totalPrice: o.totalPrice
            })),
            soldCount: await Listing.countDocuments({ status: 'sold' }),
            orderCount: await Order.countDocuments({})
        });

    } catch (error) {
        console.error("Debug error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
