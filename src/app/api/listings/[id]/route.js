import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Listing from '../../../../models/Listing';

export async function GET(request, { params }) {
    try {
        await dbConnect();

        // Await params to get the id
        const { id } = await params;

        const listing = await Listing.findById(id).populate('supplier', 'name location email mobile');

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }

        return NextResponse.json({ listing }, { status: 200 });

    } catch (error) {
        console.error('Error fetching listing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
