import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, password, role, ...otherDetails } = body;

        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        // Create new user
        // Note: Password hashing should be done here in production (e.g. bcrypt)
        const newUser = await User.create({
            email,
            password,
            role,
            ...otherDetails
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser.toObject();

        return NextResponse.json({ message: 'User registered successfully', user: userWithoutPassword }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
