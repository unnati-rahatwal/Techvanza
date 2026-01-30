'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AIAgent from '@/components/AIAgent';
import Loading from '@/components/Loading';
import styles from './page.module.css';

export default function BuyerDashboard() {
    const [stats, setStats] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [orders, setOrders] = useState([]);
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

                // Fetch Orders (Transaction History)
                const ordersRes = await fetch(`/api/transactions?buyerId=${user._id}`);
                const ordersData = await ordersRes.json();
                setOrders(ordersData.transactions || []);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    if (loading) return (
        <div className={styles.loadingContainer}>
            <Navbar />
            <Loading message="Loading Dashboard..." />
        </div>
    );

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1>Buyer Dashboard</h1>
                    <Link href="/marketplace" className={styles.browseBtn}>
                        Browse Marketplace ➔
                    </Link>
                </header>

                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.card}>
                        <h3>Total Purchased</h3>
                        <p className={styles.number}>{stats?.totalQuantity || 0} <span className={styles.unit}>kg</span></p>
                    </div>
                    <div className={styles.card}>
                        <h3>Impact Created</h3>
                        <p className={styles.number}>{stats?.carbonSaved || Math.floor((stats?.totalQuantity || 0) * 2.5)} <span className={styles.unit}>kg CO₂</span></p>
                        <p className={styles.subtext}>Verified Simplifed Carbon Impact</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Green Points</h3>
                        <p className={styles.number}>{stats?.creditsEarned || 0} <span className={styles.unit}>pts</span></p>
                        <p className={styles.subtext}>Buyer Sustainability Score</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Total Spend</h3>
                        <p className={styles.number}>₹{stats?.totalValue || 0}</p>
                    </div>
                </div>

                {/* Order History */}
                <section className={styles.section}>
                    <h2>Your Orders</h2>
                    {orders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No orders yet. Start your eco-journey today!</p>
                            <Link href="/marketplace" className={styles.link}>Go to Marketplace</Link>
                        </div>
                    ) : (
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        <th>Total Price</th>
                                        <th>Supplier</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td>{order.listing?.title || 'Unknown Item'}</td>
                                            <td><span className={styles.tag}>{order.listing?.wasteType || 'N/A'}</span></td>
                                            <td>{order.quantity}kg</td>
                                            <td className={styles.price}>₹{order.totalPrice}</td>
                                            <td>{order.supplier?.name || 'Unknown'}</td>
                                            <td>{new Date(order.timestamp).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[order.status]}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/tracking/${order.listingId}`}
                                                    className={styles.trackBtn}
                                                >
                                                    🔗 Track
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Recommendations */}
                <section className={styles.section}>
                    <h2>Recommended For You</h2>
                    {recommendations.length === 0 ? (
                        <p className={styles.emptyText}>No specific recommendations yet.</p>
                    ) : (
                        <div className={styles.listingsGrid}>
                            {recommendations.map(listing => (
                                <Link key={listing._id} href={`/listings/${listing._id}`} className={styles.listingCardLink}>
                                    <div className={styles.listingCard}>
                                        <div className={styles.imageContainer}>
                                            {listing.imageUrl ? (
                                                <img src={listing.imageUrl} alt={listing.title} className={styles.listingImage} />
                                            ) : (
                                                <div className={styles.placeholder}>No Image</div>
                                            )}
                                        </div>
                                        <div className={styles.listingContent}>
                                            <h3>{listing.title}</h3>
                                            <div className={styles.row}>
                                                <p className={styles.price}>₹{listing.pricePerKg}/kg</p>
                                                <span className={styles.miniTag}>{listing.wasteType}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
            <AIAgent />
        </div>
    );
}
