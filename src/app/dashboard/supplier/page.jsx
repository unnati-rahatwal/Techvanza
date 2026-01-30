'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export default function SupplierDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'supplier') {
            router.push(`/dashboard/${parsedUser.role}`);
            return;
        }

        setUser(parsedUser);

        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/dashboard/stats?userId=${parsedUser._id}`);
                const data = await res.json();
                setStats(data.stats);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

    if (!user || loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading Dashboard...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', color: 'white' }}>
            <Navbar />
            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Supplier Dashboard</h1>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>Welcome back, {user.name}!</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {/* Stat Card 1 */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Total Waste Supplied</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalQuantity || 0} kg</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Earnings</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹ {stats?.totalValue || 0}</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>Active Listings</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.activeListings || 0}</p>
                    </div>

                    {/* Carbon Credits */}
                    <div style={{ background: 'rgba(255,215,0,0.2)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,215,0,0.3)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#FFD700', marginBottom: '0.5rem', fontWeight: 'bold' }}>Carbon Credits Earned</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#FFF' }}>{stats?.creditsEarned || 0} 🌿</p>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Saved {stats?.carbonSaved || 0}kg CO₂</p>
                    </div>

                    {/* Tax Benefits */}
                    <div style={{ background: 'rgba(0, 255, 127, 0.15)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0, 255, 127, 0.3)' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#00FA9A', marginBottom: '0.5rem', fontWeight: 'bold' }}>Projected Tax Benefit</h3>
                        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#FFF' }}>₹ {stats?.projectedTaxBenefit || 0}</p>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>Based on current credits</p>
                    </div>

                </div>

                <div style={{ marginTop: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Actions</h2>
                    <button
                        onClick={() => router.push('/marketplace/create')}
                        style={{ background: 'white', color: '#134e5e', border: 'none', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                    >
                        + Create New Listing
                    </button>
                    <button
                        onClick={() => alert("Green Certification Download Feature Coming Soon!")}
                        style={{ marginLeft: '1rem', background: 'transparent', color: 'white', border: '2px solid white', padding: '1rem 2rem', borderRadius: '50px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Download Green Cert
                    </button>
                </div>
            </div>
        </div>
    );
}
