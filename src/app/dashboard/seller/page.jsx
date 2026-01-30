'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export default function SellerDashboard() {
    const [stats, setStats] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        if (user.role !== 'supplier') {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsRes = await fetch(`/api/dashboard/stats?userId=${user._id}`);
                const statsData = await statsRes.json();
                setStats(statsData.stats);

                // Fetch My Listings
                const listingsRes = await fetch(`/api/listings?supplier=${user._id}`);
                const listingsData = await listingsRes.json();
                setListings(listingsData.listings);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <Navbar />
            <div className={styles.loading}>Loading Dashboard...</div>
        </div>
    );

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1>Seller Dashboard</h1>
                    <div className={styles.actions}>
                        <Link href="/marketplace" className={styles.secondaryBtn}>
                            View Marketplace
                        </Link>
                        <Link href="/listings/create" className={styles.createBtn}>
                            + Create New Listing
                        </Link>
                    </div>
                </header>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.card}>
                        <h3>Active Listings</h3>
                        <p className={styles.number}>{stats?.activeListings || 0}</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Total Sales</h3>
                        <p className={styles.number}>₹{stats?.totalValue || 0}</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Orders Completed</h3>
                        <p className={styles.number}>{stats?.completedOrders || 0}</p>
                    </div>
                </div>

                {/* Recent Listings */}
                <section className={styles.section}>
                    <h2>My Listings</h2>
                    {listings.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No listings found. Start selling today!</p>
                            <Link href="/listings/create" className={styles.createLink}>
                                create your first listing
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.listingsGrid}>
                            {listings.map(listing => (
                                <div key={listing._id} className={styles.listingCard}>
                                    <div className={styles.imageContainer}>
                                        {listing.imageUrl && (
                                            <img src={listing.imageUrl} alt={listing.title} className={styles.listingImage} />
                                        )}
                                        <span className={`${styles.statusBadge} ${styles[listing.status]}`}>
                                            {listing.status}
                                        </span>
                                    </div>
                                    <div className={styles.listingContent}>
                                        <h3>{listing.title}</h3>
                                        <p className={styles.price}>₹{listing.pricePerKg}/kg • {listing.quantity}kg</p>
                                        <p className={styles.date}>Posted: {new Date(listing.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
