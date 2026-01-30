'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PaymentButton from '@/components/PaymentButton';
import AIAgent from '@/components/AIAgent';
import styles from './page.module.css';

// Unsplash Image Helper
const getWasteImage = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('plastic')) return 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('paper')) return 'https://images.unsplash.com/photo-1605600659873-d808a13a4d2d?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('metal')) return 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('glass')) return 'https://images.unsplash.com/photo-1533624776077-0a25ae639a69?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('organic')) return 'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&w=800&q=80';
    if (typeLower.includes('e-waste') || typeLower.includes('electronic')) return 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'; // General Generic
};

export default function Marketplace() {
    const [listings, setListings] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchListings = async () => {
        try {
            const res = await fetch('/api/supplier/requirements');
            const data = await res.json();
            if (data.requirements) {
                setListings(data.requirements);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        fetchListings();

        // Real-time Polling (every 3 seconds)
        const interval = setInterval(fetchListings, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1>Marketplace</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                        Browse and purchase verified waste listings. Payments tracked on Sepolia Blockchain.
                    </p>
                </header>

                {loading && listings.length === 0 ? (
                    <div style={{ color: 'white', textAlign: 'center', marginTop: '3rem' }}>Loading Marketplace...</div>
                ) : (
                    <div className={styles.grid}>
                        {listings.map(listing => (
                            <div key={listing._id} className={styles.card}>
                                <div className={styles.imageContainer}>
                                    <img
                                        src={listing.imageUrl || getWasteImage(listing.wasteType)}
                                        alt={listing.wasteType}
                                        className={styles.image}
                                    />
                                </div>
                                <div className={styles.details}>
                                    <span className={styles.tag}>{listing.wasteType}</span>
                                    <h3 className={styles.title}>{listing.wasteType} Lot</h3>

                                    <div className={styles.infoRow}>
                                        <span>Quantity:</span>
                                        <span style={{ color: 'white' }}>{listing.quantity} kg</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span>Location:</span>
                                        <span style={{ color: 'white' }}>{listing.location}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span>Supplier:</span>
                                        <span style={{ color: 'white' }}>{listing.userId?.name || 'Verified Supplier'}</span>
                                    </div>

                                    <div className={styles.price}>
                                        ₹{listing.priceRange?.min || 'N/A'}
                                    </div>

                                    <div className={styles.actions}>
                                        {user && user.role === 'buyer' ? (
                                            <PaymentButton
                                                listing={listing}
                                                user={user}
                                                onSuccess={fetchListings}
                                            />
                                        ) : (
                                            <button
                                                disabled
                                                style={{
                                                    width: '100%',
                                                    padding: '0.8rem',
                                                    background: '#334155',
                                                    color: '#94a3b8',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'not-allowed'
                                                }}
                                            >
                                                {user?.role === 'supplier' ? 'Suppliers cannot buy' : 'Login as Buyer to Purchase'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <AIAgent />
        </div>
    );
}
