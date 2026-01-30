'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Button from '../../../components/Button';
import styles from './page.module.css';

export default function ListingDetails({ params }) {
    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const router = useRouter();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);

        const fetchListing = async () => {
            try {
                const res = await fetch(`/api/listings/${id}`);
                const data = await res.json();
                if (res.ok) {
                    setListing(data.listing);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError('Failed to load listing');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchListing();
    }, [id]);

    const handleBuy = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        if (currentUser.role !== 'buyer') {
            alert('Only buyers can purchase items.');
            return;
        }

        if (!confirm(`Are you sure you want to buy ${listing.quantity}kg of ${listing.title} for ₹${listing.pricePerKg * listing.quantity}?`)) {
            return;
        }

        setBuying(true);
        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: listing._id,
                    buyerId: currentUser._id,
                    quantity: listing.quantity // Buying full quantity for MVP
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Purchase successful!');
                router.push('/dashboard/buyer');
            } else {
                alert(data.error || 'Purchase failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        } finally {
            setBuying(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error || !listing) return <div className={styles.error}>{error || 'Listing not found'}</div>;

    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.content}>
                <div className={styles.grid}>
                    {/* Image Section */}
                    <div className={styles.imageSection}>
                        {listing.imageUrl ? (
                            <img src={listing.imageUrl} alt={listing.title} className={styles.image} />
                        ) : (
                            <div className={styles.placeholder}>No Image Available</div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className={styles.detailsSection}>
                        <span className={styles.tag}>{listing.wasteType}</span>
                        <h1 className={styles.title}>{listing.title}</h1>

                        <div className={styles.priceContainer}>
                            <span className={styles.price}>₹{listing.pricePerKg}</span>
                            <span className={styles.unit}>/ kg</span>
                            <span className={styles.totalPrice}>
                                (Total: ₹{listing.pricePerKg * listing.quantity})
                            </span>
                        </div>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Quantity</span>
                                <span className={styles.value}>{listing.quantity} kg</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Location</span>
                                <span className={styles.value}>{listing.location}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Supplier</span>
                                <span className={styles.value}>{listing.supplier?.name || 'Unknown'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <span className={styles.label}>Est. Year</span>
                                <span className={styles.value}>{listing.supplier?.establishmentYear || 'N/A'}</span>
                            </div>
                        </div>

                        <div className={styles.description}>
                            <h3>Description</h3>
                            <p>{listing.description}</p>
                        </div>

                        {listing.status === 'sold' ? (
                            <div className={styles.soldBanner}>This item has been sold.</div>
                        ) : (
                            <div className={styles.actions}>
                                <Button onClick={handleBuy} disabled={buying || (currentUser?.role === 'supplier')}>
                                    {buying ? 'Processing...' : 'Buy Now'}
                                </Button>
                                {currentUser?.role === 'supplier' && (
                                    <p className={styles.note}>Suppliers cannot buy items.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
