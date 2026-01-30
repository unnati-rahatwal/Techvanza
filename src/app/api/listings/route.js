import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
    try {
        await dbConnect();

        const formData = await request.formData();
        const file = formData.get('image');
        const supplier = formData.get('supplier'); // User ID

        if (!supplier) {
            return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
        }

        let imageUrl = '';

        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: 'waste-marketplace' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            imageUrl = result.secure_url;
        }

        const listingData = {
            supplier,
            title: formData.get('title'),
            description: formData.get('description'),
            wasteType: formData.get('wasteType'),
            quantity: Number(formData.get('quantity')),
            pricePerKg: Number(formData.get('pricePerKg')),
            location: formData.get('location'),
            imageUrl
        };

        const listing = await Listing.create(listingData);

        return NextResponse.json({ message: 'Listing created successfully', listing }, { status: 201 });

    } catch (error) {
        console.error('Error creating listing:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const supplier = searchParams.get('supplier');
        const limit = searchParams.get('limit');

        let query = { status: 'available' };

        if (type) {
            query.wasteType = type;
        }

        if (supplier) {
            delete query.status; // Sellers want to see all their listings, even sold ones
            query.supplier = supplier;
        }

        let listingsQuery = Listing.find(query).sort({ createdAt: -1 }).populate('supplier', 'name location');

        if (limit) {
            listingsQuery = listingsQuery.limit(Number(limit));
        }

        const listings = await listingsQuery.exec();

        return NextResponse.json({ listings }, { status: 200 });

    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
