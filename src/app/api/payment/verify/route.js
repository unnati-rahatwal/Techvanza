import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order'; // Need to create this model
import Requirement from '@/models/Requirement'; // To update stock
import { recordTransactionOnChain } from '@/lib/blockchain';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            listingId,
            quantity,
            buyerId, 
            amount
        } = body;

        // 1. Verify Signature
        const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(bodyData.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // 2. Fetch Listing to get Supplier ID
            const listing = await Requirement.findById(listingId);
            const supplierId = listing ? listing.userId : 'unknown';

            // 3. Record on Blockchain (Sepolia)
            const blockchainData = {
                buyer: buyerId,
                supplier: supplierId,
                amount: amount, // In INR
                listingId: listingId,
                timestamp: Date.now()
            };

            const txHash = await recordTransactionOnChain(blockchainData);

            // 4. Save Order to Database
            const newOrder = await Order.create({
                buyerId,
                supplierId,
                listingId,
                quantity,
                totalPrice: amount,
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                blockchainTxHash: txHash,
                status: 'completed'
            });

            // 5. Update Listing Quantity (Reduce Stock)
            if (listing) {
                listing.quantity = Math.max(0, listing.quantity - quantity);
                if (listing.quantity === 0) {
                    listing.status = 'sold_out';
                }
                await listing.save();
            }

            return NextResponse.json({ 
                success: true, 
                message: 'Payment verified and recorded', 
                blockchainTxHash: txHash 
            });

        } else {
            return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
        }

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
