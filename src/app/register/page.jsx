'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../../components/Input';
import Button from '../../components/Button';
import MultiSelect from '../../components/MultiSelect';
import styles from './page.module.css';

export default function Register() {
    const router = useRouter();

    useEffect(() => {
        // Redirect if already logged in
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            router.push(`/dashboard/${parsedUser.role}`);
        }
    }, [router]);

    const [role, setRole] = useState('supplier'); // 'supplier' or 'buyer'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
        establishmentYear: '',
        wasteTypes: [], // For Supplier
        interestTypes: [] // For Buyer
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelect = (e, field) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, [field]: options }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                mobile: formData.mobile,
                email: formData.email,
                password: formData.password,
                role,
                location: formData.location,
                establishmentYear: formData.establishmentYear,
                // Send relevant types based on role
                wasteTypes: role === 'supplier' ? formData.wasteTypes : undefined,
                interestTypes: role === 'buyer' ? formData.interestTypes : undefined
            };

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Registration failed');
            }

            // Success - Redirect to login
            router.push('/login?registered=true');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Join the Circle</h1>
                <p className={styles.subtitle}>
                    Create your account to start trading waste
                </p>

                {/* Role Toggle */}
                <div className={styles.roleToggle}>
                    <button
                        type="button"
                        className={`${styles.roleButton} ${role === 'supplier' ? styles.active : ''}`}
                        onClick={() => setRole('supplier')}
                    >
                        I am a Supplier
                    </button>
                    <button
                        type="button"
                        className={`${styles.roleButton} ${role === 'buyer' ? styles.active : ''}`}
                        onClick={() => setRole('buyer')}
                    >
                        I am a Buyer
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Common Fields */}
                    <Input
                        label="Full Name / Company Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter name"
                        required
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />

                    <Input
                        label="Mobile Number"
                        name="mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                    />

                    <Input
                        label="Location (City/Region)"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Pune, Maharashtra"
                        required
                    />

                    <Input
                        label="Establishment Year"
                        name="establishmentYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear().toString()}
                        value={formData.establishmentYear}
                        onChange={handleChange}
                        placeholder="e.g. 2020"
                        required
                    />

                    {/* Dynamic Fields */}
                    {role === 'supplier' ? (
                        <div className={styles.formGroup}>
                            <MultiSelect
                                label="Types of Waste Supplied"
                                selected={formData.wasteTypes}
                                onChange={(selected) => setFormData(prev => ({ ...prev, wasteTypes: selected }))}
                                placeholder="Select what you supply..."
                            />
                        </div>
                    ) : (
                        <div className={styles.formGroup}>
                            <MultiSelect
                                label="Waste Types of Interest"
                                selected={formData.interestTypes}
                                onChange={(selected) => setFormData(prev => ({ ...prev, interestTypes: selected }))}
                                placeholder="Select what you need..."
                            />
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    <div style={{ marginTop: '1.5rem' }}>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </div>
                </form>

                <p className={styles.loginLink}>
                    Already have an account? <Link href="/login" className={styles.link}>Log In</Link>
                </p>
            </div>
        </div>
    );
}
