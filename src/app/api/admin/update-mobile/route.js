import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
    try {
        await dbConnect();

        // Update all buyers
        const buyerResult = await User.updateMany(
            { role: 'buyer' },
            { $set: { mobile: '9167595918' } }
        );

        // Get updated buyers
        const buyers = await User.find({ role: 'buyer' }).select('name email mobile role');

        return NextResponse.json({
            success: true,
            message: `Updated ${buyerResult.modifiedCount} buyer(s)`,
            buyers: buyers.map(b => ({
                name: b.name,
                email: b.email,
                mobile: b.mobile
            }))
        });

    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
