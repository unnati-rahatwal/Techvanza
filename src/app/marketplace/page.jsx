'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Input from '../../components/Input';
import styles from './page.module.css';

export default function Marketplace() {
    const [listings, setListings] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [loading, setLoading] = useState(true);

    const wasteOptions = [
        'Plastic (PET, HDPE)',
        'Paper & Cardboard',
        'Glass',
        'Metal (Scrap)',
        'E-Waste',
        'Textile Waste',
        'Organic/Bio'
    ];

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                let url = '/api/listings?limit=50';
                if (filterType) url += `&type=${encodeURIComponent(filterType)}`;

                const res = await fetch(url);
                const data = await res.json();
                setListings(data.listings);
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [filterType]);

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1>Marketplace</h1>
                    <div className={styles.filters}>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className={styles.select}
                        >
                            <option value="">All Types</option>
                            {wasteOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                </header>

                {loading ? (
                    <div className={styles.loading}>Loading Listings...</div>
                ) : listings.length === 0 ? (
                    <p className={styles.empty}>No listings found matching your criteria.</p>
                ) : (
                    <div className={styles.grid}>
                        {listings.map(listing => (
                            <Link key={listing._id} href={`/listings/${listing._id}`} className={styles.cardLink}>
                                <div className={styles.card}>
                                    <div className={styles.imageContainer}>
                                        {listing.imageUrl ? (
                                            <img src={listing.imageUrl} alt={listing.title} className={styles.image} />
                                        ) : (
                                            <div className={styles.placeholder}>No Image</div>
                                        )}
                                    </div>
                                    <div className={styles.cardBody}>
                                        <h3>{listing.title}</h3>
                                        <p className={styles.price}>₹{listing.pricePerKg}/kg</p>
                                        <p className={styles.detail}>{listing.quantity}kg Available</p>
                                        <p className={styles.location}>📍 {listing.location}</p>
                                        <span className={styles.tag}>{listing.wasteType}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
