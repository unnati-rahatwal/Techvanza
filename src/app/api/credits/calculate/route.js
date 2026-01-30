import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Credit from '@/models/Credit';
import Transaction from '@/models/Transaction';
import { calculateCarbonImpact } from '@/lib/gemini';

export async function POST(request) {
    try {
        await dbConnect();
        const { transactionId, userId } = await request.json();

        if (!transactionId || !userId) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 });
        }

        const existingCredit = await Credit.findOne({ transactionId });
        if (existingCredit) {
            return NextResponse.json({ message: 'Credits already calculated', credit: existingCredit }, { status: 200 });
        }

        const transaction = await Transaction.findById(transactionId).populate('listing');
        if (!transaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Calculate Carbon Impact via Gemini
        const wasteType = transaction.listing?.wasteType || 'General Waste';
        const impactData = await calculateCarbonImpact(wasteType, transaction.quantity);

        // Credit Calculation Logic
        // 1 Credit = 100 kg CO2 saved (Example)
        const creditsEarned = Math.floor(impactData.savedCO2 / 100) || 1;

        // Tax Benefit Formula
        // Tax Benefit = Credits * 500 INR * Certification Level (Base 1)
        const taxBenefitValue = creditsEarned * 500;

        const newCredit = await Credit.create({
            userId,
            transactionId,
            wasteType,
            quantity: transaction.quantity,
            carbonSaved: impactData.savedCO2,
            impactDescription: impactData.impactDescription,
            creditsEarned,
            taxBenefitValue,
            certificationLevel: 'Bronze' // Default
        });

        return NextResponse.json({ success: true, credit: newCredit }, { status: 201 });

    } catch (error) {
        console.error('Credit calculation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
