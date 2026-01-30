import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Listing from '@/models/Listing';
import Credit from '@/models/Credit';
import { calculateCarbonImpact } from '@/lib/gemini';

export async function POST(request) {
    try {
        await dbConnect();
        const text = await request.text();
        const data = JSON.parse(text);
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            notes,
            amount // Optional, passed from frontend for record
        } = data;

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
        }

        const { listingId, buyerId, supplierId, quantity } = notes;

        // 2. Create Transaction Record
        // Assuming amount is in paisa, convert to INR
        const totalPrice = amount ? amount / 100 : 0;

        const transaction = await Transaction.create({
            listing: listingId,
            buyer: buyerId,
            supplier: supplierId,
            quantity: Number(quantity),
            totalPrice: totalPrice,
            status: 'completed',
            paymentId: razorpay_payment_id,
            timestamp: new Date()
        });

        // 3. Update Listing (Mark sold or reduce quantity)
        // For MVP, marking as sold if stock is 0? Or just decrease.
        // Let's assume stock management for now.
        const listing = await Listing.findById(listingId);
        if (listing) {
            listing.quantity -= Number(quantity);
            if (listing.quantity <= 0) {
                listing.status = 'sold';
            }
            await listing.save();
        }

        // 4. Calculate Credits & Tax Benefits Automatically
        try {
            // Re-using the logic from api/credits/calculate or calling function directly
            // Direct function call is faster here
            const wasteType = listing?.wasteType || 'General';
            const impactData = await calculateCarbonImpact(wasteType, Number(quantity));

            const creditsEarned = Math.floor(impactData.savedCO2 / 100) || 1;
            const taxBenefitValue = creditsEarned * 500;

            await Credit.create({
                userId: supplierId, // Supplier gets the credit? Or Buyer? 
                // Usually Recycling Producer (Supplier) gets credit OR Buyer gets offset. 
                // Let's give it to Supplier for now based on user request "credits for sellers".
                transactionId: transaction._id,
                wasteType: wasteType,
                quantity: Number(quantity),
                carbonSaved: impactData.savedCO2,
                impactDescription: impactData.impactDescription,
                creditsEarned,
                taxBenefitValue,
                certificationLevel: 'Bronze'
            });

        } catch (creditError) {
            console.error("Credit calc failed (background):", creditError);
            // Don't fail the verification response
        }

        return NextResponse.json({ success: true, transactionId: transaction._id }, { status: 200 });

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
