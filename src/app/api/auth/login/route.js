import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
        }

        // Find user by email
        const user = await User.findOne({ email });

        // Simple password check (NOT SECURE for production, okay for hackathon MVP)
        // Ideally compare hashed passwords
        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user.toObject();

        return NextResponse.json({ message: 'Login successful', user: userWithoutPassword }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
