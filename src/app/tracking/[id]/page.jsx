'use client';

import { useState, useEffect, use } from 'react';
import Navbar from '@/components/Navbar';
import Loading from '@/components/Loading';
import Link from 'next/link';
import styles from './page.module.css';

export default function TrackingPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const res = await fetch(`/api/tracking/${id}`);
                const json = await res.json();
                if (res.ok) {
                    setData(json);
                } else {
                    setError(json.message || json.error || 'Failed to load tracking data');
                }
            } catch (err) {
                console.error(err);
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchTracking();
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
            <Navbar />
            <Loading message="Loading Blockchain Data..." />
        </div>
    );

    if (error || !data) return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
            <Navbar />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', maxWidth: '28rem', padding: '2rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '1rem', border: '1px solid rgba(71, 85, 105, 0.7)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Tracking Not Found</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                        {error || 'This listing does not exist or tracking data is unavailable.'}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Link
                            href="/dashboard/buyer"
                            style={{ display: 'block', padding: '0.75rem 1.5rem', background: '#059669', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none', color: 'white' }}
                        >
                            ← Back to Dashboard
                        </Link>
                        <Link
                            href="/marketplace"
                            style={{ display: 'block', padding: '0.75rem 1.5rem', background: '#475569', borderRadius: '0.5rem', fontWeight: '600', textDecoration: 'none', color: 'white' }}
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    const stateIcons = {
        'CREATED': '📝',
        'PURCHASED': '💰',
        'PROCESSING': '⚙️',
        'SHIPPED': '🚚',
        'DELIVERED': '✅',
        'CANCELLED': '❌'
    };

    return (
        <div className={styles.container}>
            <Navbar />

            <div className={styles.content}>
                <Link href="/dashboard/buyer" className={styles.backLink}>
                    <span>←</span> Back to Dashboard
                </Link>

                <div className={styles.header}>
                    <div className={styles.headerTop}>
                        <div className={styles.icon}>
                            🔗
                        </div>
                        <div>
                            <h1 className={styles.title}>
                                Supply Chain Tracking
                            </h1>
                            <p className={styles.listingId}>ID: {id.slice(0, 8)}...{id.slice(-6)}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.productCard}>
                    <h2 className={styles.productTitle}>
                        <span>📦</span>
                        {data.listing.title}
                    </h2>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>Supplier</div>
                            <div className={styles.infoValue}>{data.listing.supplier}</div>
                        </div>

                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>Quantity</div>
                            <div className={styles.infoValue}>{data.listing.quantity} kg</div>
                        </div>

                        {data.listing.buyer && data.listing.buyer !== 'N/A' && (
                            <div className={styles.infoItem}>
                                <div className={styles.infoLabel}>Buyer</div>
                                <div className={styles.infoValue}>{data.listing.buyer}</div>
                            </div>
                        )}

                        <div className={styles.infoItem}>
                            <div className={styles.infoLabel}>Status</div>
                            <div className={styles.infoValue} style={{ textTransform: 'capitalize' }}>{data.listing.status}</div>
                        </div>
                    </div>
                </div>

                <div className={styles.timelineCard}>
                    <h2 className={styles.timelineTitle}>
                        <span>⏱️</span>
                        Transaction Timeline
                    </h2>

                    <div className={styles.timelineContainer}>
                        <div className={styles.timelineLine}></div>

                        <div className={styles.timelineItems}>
                            {data.history.map((step, index) => (
                                <div key={index} className={styles.timelineItem}>
                                    <div className={styles.timelineIcon}>
                                        {stateIcons[step.state] || '📍'}
                                    </div>

                                    <div className={styles.timelineContent}>
                                        <div className={styles.timelineHeader}>
                                            <h3 className={styles.stateName}>
                                                {step.state}
                                            </h3>
                                            <span className={styles.timestamp}>
                                                {step.timestamp}
                                            </span>
                                        </div>

                                        {step.txHash && step.txHash.length > 20 && (
                                            <div className={styles.txHash}>
                                                <div className={styles.txLabel}>
                                                    Transaction Hash
                                                </div>
                                                <div className={styles.txValue}>
                                                    {step.txHash}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
