'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';

export default function SupplierDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'supplier') {
            router.push(`/dashboard/${parsedUser.role}`); // Redirect to correct dashboard
            return;
        }

        setUser(parsedUser);
    }, [router]);

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', color: 'white' }}>
            <Navbar />
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>Supplier Dashboard</h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>Welcome back, {user.name}!</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
                    {/* Stat Card 1 */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Total Waste Supplied</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,250 kg</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Earnings</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹ 45,000</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Active Listings</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>5</p>
                    </div>
                </div>

                {/* You can add more sections like Recent Activity, Add New Supply, etc. here */}
            </div>
        </div>
    );
}
