import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
    try {
        await dbConnect();

        const orders = await Order.find({}).limit(3);

        return NextResponse.json({
            orders: orders.map(o => ({
                _id: o._id.toString(),
                listingId: o.listingId ? o.listingId.toString() : null,
                buyerId: o.buyerId ? o.buyerId.toString() : null,
                totalPrice: o.totalPrice
            }))
        });

    } catch (error) {
        console.error("Debug error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
