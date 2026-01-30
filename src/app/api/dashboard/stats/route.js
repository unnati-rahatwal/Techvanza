import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Listing from '../../../../models/Listing';
import Transaction from '../../../../models/Transaction';
import User from '../../../../models/User';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const stats = {
            role: user.role,
            totalQuantity: 0,
            totalValue: 0,
            activeListings: 0, // Only for seller
            completedOrders: 0
        };

        if (user.role === 'supplier') {
            // Seller Stats
            const activeListingsCount = await Listing.countDocuments({ supplier: userId, status: 'available' });
            stats.activeListings = activeListingsCount;

            const sales = await Transaction.find({ supplier: userId, status: 'completed' });
            stats.completedOrders = sales.length;
            stats.totalQuantity = sales.reduce((acc, curr) => acc + curr.quantity, 0);
            stats.totalValue = sales.reduce((acc, curr) => acc + curr.totalPrice, 0);

        } else {
            // Buyer Stats
            const purchases = await Transaction.find({ buyer: userId, status: 'completed' });
            stats.completedOrders = purchases.length;
            stats.totalQuantity = purchases.reduce((acc, curr) => acc + curr.quantity, 0);
            stats.totalValue = purchases.reduce((acc, curr) => acc + curr.totalPrice, 0);
        }

        return NextResponse.json({ stats }, { status: 200 });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
