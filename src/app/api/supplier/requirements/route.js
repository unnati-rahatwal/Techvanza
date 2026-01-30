import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Requirement from '../../../../models/Requirement';
import User from '../../../../models/User';
import cloudinary from '../../../../lib/cloudinary';

export async function POST(req) {
    try {
        await dbConnect();
        
        const body = await req.json();
        const { email, wasteType, quantity, minPrice, maxPrice, location, image } = body;

        // Verify user exists
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Upload to Cloudinary
        let imageUrl = image; // Fallback
        try {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: 'techvanza/requirements',
            });
            imageUrl = uploadResponse.secure_url;
        } catch (uploadError) {
            console.error('Cloudinary Upload Error:', uploadError);
            return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
        }

        // Create Requirement
        const requirement = await Requirement.create({
            userId: user._id,
            wasteType,
            quantity,
            priceRange: { min: minPrice, max: maxPrice },
            location,
            imageUrl: imageUrl,
        });

        return NextResponse.json({ success: true, data: requirement }, { status: 201 });

    } catch (error) {
        console.error('Error creating requirement:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
