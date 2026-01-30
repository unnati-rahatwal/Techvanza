'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import Input from '@/components/Input';
import styles from './page.module.css'; // You'll need to create this or reuse styles

export default function CreateListing() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        wasteType: 'Plastic (PET, HDPE)',
        quantity: '',
        pricePerKg: '',
        location: '',
        image: null
    });

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
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'supplier') {
            alert('Only suppliers can create listings.');
            router.push('/dashboard/buyer');
            return;
        }

        setUser(parsedUser);
        setFormData(prev => ({ ...prev, location: parsedUser.location }));
    }, [router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('supplier', user._id);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('wasteType', formData.wasteType);
            data.append('quantity', formData.quantity);
            data.append('pricePerKg', formData.pricePerKg);
            data.append('location', formData.location);
            if (formData.image) {
                data.append('image', formData.image);
            }

            const res = await fetch('/api/listings', {
                method: 'POST',
                body: data
            });

            if (!res.ok) throw new Error('Failed to create listing');

            router.push('/dashboard/supplier');

        } catch (error) {
            console.error(error);
            alert('Error creating listing');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <Navbar />
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', marginTop: '2rem' }}>Create New Listing</h1>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <Input
                    label="Listing Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 500kg Mixed Plastic Waste"
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Waste Type</label>
                    <select
                        name="wasteType"
                        value={formData.wasteType}
                        onChange={handleChange}
                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                    >
                        {wasteOptions.map(opt => (
                            <option key={opt} value={opt} style={{ color: 'black' }}>{opt}</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input
                        label="Quantity (kg)"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Price per Kg (₹)"
                        name="pricePerKg"
                        type="number"
                        value={formData.pricePerKg}
                        onChange={handleChange}
                        required
                    />
                </div>

                <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', width: '100%', fontFamily: 'inherit' }}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Upload Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ color: 'white' }}
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Post Listing'}
                </Button>
            </form>
        </div>
    );
}
