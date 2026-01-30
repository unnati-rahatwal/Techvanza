'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import CameraCapture from '../../../components/CameraCapture';
import LocationCapture from '../../../components/LocationCapture';

export default function SupplierRequirement() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        wasteType: '',
        quantity: '',
        minPrice: '',
        maxPrice: '',
        description: '',
        location: null,
        image: null
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'supplier') {
            router.push('/dashboard/buyer'); // Redirect unauthorized
        }
        setUser(parsedUser);
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.location || !formData.image) {
            alert('Please capture both a photo and your location.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/supplier/requirements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    wasteType: formData.wasteType,
                    quantity: formData.quantity,
                    minPrice: formData.minPrice,
                    maxPrice: formData.maxPrice,
                    location: formData.location,
                    image: formData.image
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to post requirement');
            }

            alert('Requirement added successfully!');
            router.push('/dashboard/supplier');
        } catch (err) {
            console.error(err);
            alert(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const wasteOptions = [
        'Plastic (PET)', 'Plastic (HDPE)', 'Paper/Cardboard',
        'Metal (Ferrous)', 'Metal (Non-Ferrous)', 'Glass',
        'E-Waste', 'Textile', 'Organic/Biomass', 'Rubber/Tyres'
    ];

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)', color: 'white' }}>
            <Navbar />
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Add Supply Requirement</h1>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Post your waste availability details.</p>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(16px)',
                    padding: '2rem',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Waste Type & Quantity */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Waste Type</label>
                                <select
                                    name="wasteType"
                                    value={formData.wasteType}
                                    onChange={handleChange}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        color: 'white',
                                        outline: 'none',
                                        width: '100%'
                                    }}
                                    required
                                >
                                    <option value="" style={{ color: 'black' }}>Select Type</option>
                                    {wasteOptions.map(opt => (
                                        <option key={opt} value={opt} style={{ color: 'black' }}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Quantity (kg/ton)"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                placeholder="e.g. 500 kg"
                                required
                            />
                        </div>

                        {/* Price Range */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Input
                                label="Min Price (₹)"
                                name="minPrice"
                                type="number"
                                value={formData.minPrice}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                            <Input
                                label="Max Price (₹)"
                                name="maxPrice"
                                type="number"
                                value={formData.maxPrice}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>

                        {/* Location */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Pickup Location</label>
                            <LocationCapture
                                onLocationSelect={(loc) => setFormData(prev => ({ ...prev, location: loc }))}
                            />
                        </div>

                        {/* Camera */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Waste Photo</label>
                            <CameraCapture
                                onCapture={(img) => setFormData(prev => ({ ...prev, image: img }))}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Posting...' : 'Post Requirement'}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
