'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AIAgent from '@/components/AIAgent';
import styles from './page.module.css';

const getWasteImage = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('plastic')) return 'https://placehold.co/600x400/22c55e/ffffff?text=Plastic+Waste';
    if (typeLower.includes('paper')) return 'https://placehold.co/600x400/f59e0b/ffffff?text=Paper+Waste';
    if (typeLower.includes('metal')) return 'https://placehold.co/600x400/64748b/ffffff?text=Metal+Scrap';
    if (typeLower.includes('glass')) return 'https://placehold.co/600x400/0ea5e9/ffffff?text=Glass+Waste';
    if (typeLower.includes('organic')) return 'https://placehold.co/600x400/84cc16/ffffff?text=Organic+Waste';
    if (typeLower.includes('e-waste')) return 'https://placehold.co/600x400/a855f7/ffffff?text=E-Waste';
    return 'https://placehold.co/600x400/10b981/ffffff?text=Eco+Waste';
};

export default function Marketplace() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle

    // Filter States
    const [wasteType, setWasteType] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [location, setLocation] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const wasteOptions = [
        'Plastic (PET, HDPE)',
        'Paper & Cardboard',
        'Glass',
        'Metal (Scrap)',
        'E-Waste',
        'Textile Waste',
        'Organic/Bio'
    ];

    const fetchListings = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (wasteType) params.append('type', wasteType);
            if (priceRange.min) params.append('minPrice', priceRange.min);
            if (priceRange.max) params.append('maxPrice', priceRange.max);
            if (location) params.append('location', location);
            if (sortBy) params.append('sortBy', sortBy);

            const res = await fetch(`/api/listings?${params.toString()}`);
            const data = await res.json();
            setListings(data.listings || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    }, [wasteType, priceRange, location, sortBy]);

    // Auto-fetch on filter changes with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchListings();
        }, 500);
        return () => clearTimeout(timer);
    }, [wasteType, priceRange, location, sortBy, fetchListings]);

    return (
        <div className={styles.container}>
            <Navbar />

            <div className={styles.mainLayout}>
                {/* Sidebar Filters */}
                <aside className={`${styles.sidebar} ${showFilters ? styles.show : ''}`}>
                    <div className={styles.filterHeader}>
                        <h2>Filters</h2>
                        <button className={styles.closeBtn} onClick={() => setShowFilters(false)}>×</button>
                    </div>

                    {/* Search Location */}
                    <div className={styles.filterGroup}>
                        <label>Location</label>
                        <input
                            type="text"
                            placeholder="City, Area..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input-field" // Global style if available, else style via css module
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                        />
                    </div>

                    {/* Waste Type */}
                    <div className={styles.filterGroup}>
                        <label>Waste Type</label>
                        <select
                            value={wasteType}
                            onChange={(e) => setWasteType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {wasteOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className={styles.filterGroup}>
                        <label>Price Range (₹/kg)</label>
                        <div className={styles.row}>
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                            />
                        </div>
                    </div>

                    {/* Sort */}
                    <div className={styles.filterGroup}>
                        <label>Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="priceAsc">Price: Low to High</option>
                            <option value="priceDesc">Price: High to Low</option>
                            <option value="qtyDesc">Quantity: High to Low</option>
                        </select>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={styles.content}>
                    <div className={styles.header}>
                        <h1>Marketplace</h1>
                        <button className={styles.filterToggle} onClick={() => setShowFilters(true)}>
                            Filters ▾
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Loading eco-listings...</p>
                        </div>
                    ) : listings.length === 0 ? (
                        <div className={styles.empty}>
                            <span style={{ fontSize: '3rem' }}>🍃</span>
                            <h3>No Listings Found</h3>
                            <p>Try adjusting your filters or checking back later.</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {listings.map(listing => (
                                <Link key={listing._id} href={`/listings/${listing._id}`} className={styles.cardLink}>
                                    <div className={styles.card}>
                                        <div className={styles.imageContainer}>
                                            <img
                                                src={listing.imageUrl || getWasteImage(listing.wasteType)}
                                                alt={listing.title}
                                                className={styles.image}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = getWasteImage(listing.wasteType);
                                                }}
                                            />
                                            <span className={styles.typeBadge}>{listing.wasteType}</span>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <h3>{listing.title}</h3>
                                            <div className={styles.metaRow}>
                                                <div className={styles.priceTag}>
                                                    <span className={styles.symbol}>₹</span>
                                                    {listing.pricePerKg}<span className={styles.unit}>/kg</span>
                                                </div>
                                                <span className={styles.qty}>{listing.quantity}kg Left</span>
                                            </div>
                                            <div className={styles.locationRow}>
                                                <span className={styles.icon}>📍</span> {listing.location}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
            <AIAgent />
        </div>
    );
}
