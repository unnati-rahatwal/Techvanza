'use client';

import { useState } from 'react';

export default function PaymentButton({ listing, user, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!user) {
            alert("Please login to buy");
            return;
        }

        setLoading(true);

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load');
            setLoading(false);
            return;
        }

        // 1. Create Order
        const orderRes = await fetch('/api/payment/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                listingId: listing._id,
                quantity: listing.quantity,
                userId: user._id
            })
        });

        const orderData = await orderRes.json();

        if (orderData.error) {
            alert(orderData.error);
            setLoading(false);
            return;
        }

        // 2. Open Razorpay Checkout
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key here
            amount: orderData.amount,
            currency: orderData.currency,
            name: "EcoTrade Marketplace",
            description: `Buying ${listing.wasteType} Waste`,
            order_id: orderData.id,
            handler: async function (response) {
                // 3. Verify Payment & Record on Blockchain
                const verifyRes = await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        listingId: listing._id,
                        quantity: listing.quantity,
                        amount: orderData.amount / 100, // Back to INR
                        buyerId: user._id
                    })
                });

                const verifyData = await verifyRes.json();

                if (verifyData.success) {
                    alert(`Payment Successful! Blockchain Tx: ${verifyData.blockchainTxHash}`);
                    if (onSuccess) onSuccess();
                } else {
                    alert('Payment verification failed');
                }
                setLoading(false);
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: '9999999999' // Dummy contact
            },
            theme: {
                color: "#38ef7d"
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            style={{
                width: '100%',
                padding: '0.8rem',
                background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1
            }}
        >
            {loading ? 'Processing...' : 'Buy Now'}
        </button>
    );
}
