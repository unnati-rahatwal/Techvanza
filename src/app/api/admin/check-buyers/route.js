import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        const buyers = await User.find({ role: 'buyer' }).limit(5);
        const orders = await Order.find({}).limit(5);

        return NextResponse.json({
            buyers: buyers.map(b => ({ id: b._id.toString(), name: b.name })),
            orders: orders.map(o => ({
                id: o._id.toString(),
                buyerId: o.buyerId.toString(),
                listingId: o.listingId.toString()
            }))
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
