'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

export default function BuyerDashboard() {
    const [stats, setStats] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(storedUser);
        if (user.role !== 'buyer') {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsRes = await fetch(`/api/dashboard/stats?userId=${user._id}`);
                const statsData = await statsRes.json();
                setStats(statsData.stats);

                // Fetch Recommendations
                const recRes = await fetch(`/api/recommendations?userId=${user._id}`);
                const recData = await recRes.json();
                setRecommendations(recData.recommendations);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) return (
        <>
            <Navbar />
            <div className={styles.loading}>Loading Dashboard...</div>
        </>
    );

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1>Buyer Dashboard</h1>
                    <Link href="/marketplace" className={styles.browseBtn}>
                        Browse Marketplace
                    </Link>
                </header>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.card}>
                        <h3>Total Purchased</h3>
                        <p className={styles.number}>{stats?.totalQuantity || 0} kg</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Total Spend</h3>
                        <p className={styles.number}>₹{stats?.totalValue || 0}</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Orders Completed</h3>
                        <p className={styles.number}>{stats?.completedOrders || 0}</p>
                    </div>
                </div>

                {/* Recommendations */}
                <section className={styles.section}>
                    <h2>Recommended For You</h2>
                    {recommendations.length === 0 ? (
                        <p>No recommendations yet. Update your interests or browse the marketplace.</p>
                    ) : (
                        <div className={styles.listingsGrid}>
                            {recommendations.map(listing => (
                                <Link key={listing._id} href={`/listings/${listing._id}`} className={styles.listingCardLink}>
                                    <div className={styles.listingCard}>
                                        <div className={styles.imageContainer}>
                                            {listing.imageUrl && (
                                                <img src={listing.imageUrl} alt={listing.title} className={styles.listingImage} />
                                            )}
                                        </div>
                                        <div className={styles.listingContent}>
                                            <h3>{listing.title}</h3>
                                            <p className={styles.price}>₹{listing.pricePerKg}/kg</p>
                                            <p className={styles.location}>📍 {listing.location}</p>
                                            <div className={styles.tags}>
                                                <span className={styles.tag}>{listing.wasteType}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
