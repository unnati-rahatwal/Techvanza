import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';
import cloudinary from '@/lib/cloudinary';
import { sendSMS, makeCall } from '@/lib/twilio';

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
            console.log('Starting Cloudinary upload...');
            try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = new Uint8Array(arrayBuffer);

                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: 'waste-marketplace', timeout: 60000 },
                        (error, result) => {
                            if (error) {
                                console.error('Cloudinary Upload Error:', error);
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    ).end(buffer);
                });

                imageUrl = result.secure_url;
                console.log('Cloudinary upload success:', imageUrl);
            } catch (uploadErr) {
                console.error('Failed to upload image:', uploadErr);
                return NextResponse.json({ error: 'Image upload failed: ' + uploadErr.message }, { status: 502 });
            }
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

        // --- BROADCAST ALERTS (SMS & VOICE) ---
        // Run in background
        (async () => {
            try {
                // 1. Fetch all Buyers with phone numbers
                const buyers = await User.find({ role: 'buyer', mobile: { $exists: true, $ne: '' } });
                
                if (buyers.length > 0) {
                    const messageText = `New Listing Alert: ${listingData.quantity}kg ${listingData.wasteType} available at ${listingData.location}. Log in to EcoTrade to buy!`;
                    // Simplified voice text for better TTS flow
                    const voiceText = `Namaste. New listing alert on Eco Trade. ${listingData.quantity} kilograms of ${listingData.wasteType} is now available at ${listingData.location}. Please login to the dashboard to purchase. Thank you.`;

                    // Helper to format phone number to E.164
                    const formatPhoneNumber = (phone) => {
                        let p = phone.replace(/\D/g, ''); // Remove non-digits
                        if (p.length === 10) return `+91${p}`; // Assume India if 10 digits
                        if (p.length === 12 && p.startsWith('91')) return `+${p}`;
                        if (!p.startsWith('+')) return `+${p}`;
                        return p;
                    };

                    // 2. Send Notifications
                    const notifications = buyers.map(async (buyer) => {
                        const formattedPhone = formatPhoneNumber(buyer.mobile);
                        
                        try {
                            // Send SMS
                            await sendSMS(formattedPhone, messageText);
                            console.log(`SMS sent to ${formattedPhone}`);

                            // Make Call (using Twilio TTS)
                            await makeCall(formattedPhone, voiceText);
                            console.log(`Call initiated to ${formattedPhone}`);
                            
                        } catch (notifyError) {
                            console.error(`Failed to notify ${formattedPhone}:`, notifyError.message);
                        }
                    });

                    await Promise.allSettled(notifications);
                    console.log(`Broadcast sent to ${buyers.length} buyers.`);
                }
            } catch (broadcastError) {
                console.error('Broadcast Error:', broadcastError);
            }
        })();
        // ---------------------------------------

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
