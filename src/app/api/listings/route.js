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
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const location = searchParams.get('location');
        const sortBy = searchParams.get('sortBy'); // 'newest', 'priceObs', 'priceDesc', 'qtyDesc'

        let query = { status: 'available' };

        // Filter by Waste Type
        if (type && type !== 'All') {
            query.wasteType = type;
        }

        // Filter by Supplier (for dashboard)
        if (supplier) {
            delete query.status; // Show all for supplier
            query.supplier = supplier;
        }

        // Filter by Price Range
        if (minPrice || maxPrice) {
            query.pricePerKg = {};
            if (minPrice) query.pricePerKg.$gte = Number(minPrice);
            if (maxPrice) query.pricePerKg.$lte = Number(maxPrice);
        }

        // Filter by Location (Case-insensitive partial match)
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        let listingsQuery = Listing.find(query);

        // Sorting
        if (sortBy === 'priceAsc') {
            listingsQuery = listingsQuery.sort({ pricePerKg: 1 });
        } else if (sortBy === 'priceDesc') {
            listingsQuery = listingsQuery.sort({ pricePerKg: -1 });
        } else if (sortBy === 'qtyDesc') {
            listingsQuery = listingsQuery.sort({ quantity: -1 });
        } else {
            listingsQuery = listingsQuery.sort({ createdAt: -1 }); // Default: Newest first
        }

        // Population
        listingsQuery = listingsQuery.populate('supplier', 'name location');

        // Limit
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
