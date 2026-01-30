import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Requirement from '@/models/Requirement'; // For population
import User from '@/models/User'; // For population

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const buyerId = searchParams.get('buyerId');

        if (!buyerId) {
            return NextResponse.json({ error: 'Buyer ID required' }, { status: 400 });
        }

        const transactions = await Order.find({ buyerId })
            .populate('listingId', 'title wasteType imageUrl priceRange')
            .populate('supplierId', 'name')
            .sort({ timestamp: -1 });

        // Transform data slightly to match frontend expectation
        const formattedTransactions = transactions.map(order => ({
            _id: order._id,
            quantity: order.quantity,
            totalPrice: order.totalPrice,
            status: order.status,
            timestamp: order.timestamp,
            blockchainTxHash: order.blockchainTxHash,
            listing: {
                title: order.listingId?.wasteType + ' Waste', // Fallback title
                wasteType: order.listingId?.wasteType,
                imageUrl: order.listingId?.imageUrl,
            },
            supplier: {
                name: order.supplierId?.name
            }
        }));

        return NextResponse.json({ transactions: formattedTransactions });

    } catch (error) {
        console.error("Error fetching transactions:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
