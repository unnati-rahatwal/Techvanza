import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Requirement from '@/models/Requirement';
import User from '@/models/User';
import cloudinary from '@/lib/cloudinary';

// GET: Fetch all active requirements (Marketplace)
export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        let query = { status: 'active' };

        // If userId is provided, fetch specific supplier's listings
        if (userId) {
            query = { userId };
        }

        const requirements = await Requirement.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ requirements });
    } catch (error) {
        console.error("Error fetching requirements:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new requirement (Supplier)
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { email, wasteType, quantity, priceRange, location, image } = body;

        // Verify user
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let imageUrl = '';

        // Upload image to Cloudinary if provided
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    folder: 'techvanza/requirements',
                });
                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                // Continue without image or return error? 
                // Let's continue, image optional or placeholder can be used.
            }
        }

        const requirement = await Requirement.create({
            userId: user._id,
            wasteType,
            quantity,
            priceRange: { min: priceRange?.min || 0, max: priceRange?.max || 0 },
            location,
            imageUrl,
            status: 'active'
        });

        return NextResponse.json({ message: 'Requirement posted successfully', requirement }, { status: 201 });

    } catch (error) {
        console.error("Error creating requirement:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
