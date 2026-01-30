import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'buyer') {
            return NextResponse.json({ error: 'Valid buyer ID is required' }, { status: 400 });
        }

        // Simple recommendation: Match listings with buyer's interest types
        // If no interests, show popular available listings
        let query = { status: 'available' };

        if (user.interestTypes && user.interestTypes.length > 0) {
            query.wasteType = { $in: user.interestTypes };
        }

        const recommendations = await Listing.find(query)
            .limit(10)
            .sort({ createdAt: -1 })
            .populate('supplier', 'name location');

        return NextResponse.json({ recommendations }, { status: 200 });

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
