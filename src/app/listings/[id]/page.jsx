'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
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

    // Load Razorpay Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuy = async () => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        if (currentUser.role !== 'buyer') {
            alert('Only buyers can purchase items.');
            return;
        }

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        setBuying(true);

        try {
            // 1. Create Order
            const orderRes = await fetch('/api/payment/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: listing._id,
                    buyerId: currentUser._id,
                    quantity: listing.quantity // Buying full qty for MVP
                })
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error);

            // 2. Open Razorpay Options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Add this to env/next.config
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Techvanza Waste Market',
                description: `Purchase of ${listing.title}`,
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: orderData.amount,
                            notes: {
                                listingId: listing._id,
                                buyerId: currentUser._id,
                                supplierId: listing.supplier?._id,
                                quantity: listing.quantity
                            }
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        alert('Payment Successful! Carbon Credits Generated 🌿');
                        router.push('/dashboard/buyer');
                    } else {
                        alert('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: currentUser.name,
                    email: currentUser.email,
                    contact: currentUser.mobile
                },
                theme: {
                    color: '#3399cc'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error(err);
            alert('Purchase flow failed: ' + err.message);
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
                        <img
                            src={listing.imageUrl || getWasteImage(listing.wasteType)}
                            alt={listing.title}
                            className={styles.image}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getWasteImage(listing.wasteType);
                            }}
                        />
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
