'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function Register() {
    const router = useRouter();
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
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
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
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Full Name / Company Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className={styles.input}
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter name"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className={styles.input}
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            required
                            className={styles.input}
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="Enter mobile number"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className={styles.input}
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            className={styles.input}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Location (City/Region)</label>
                        <input
                            type="text"
                            name="location"
                            required
                            className={styles.input}
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Pune, Maharashtra"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Establishment Year</label>
                        <input
                            type="number"
                            name="establishmentYear"
                            required
                            className={styles.input}
                            value={formData.establishmentYear}
                            onChange={handleChange}
                            min="1900"
                            max={new Date().getFullYear()}
                        />
                    </div>

                    {/* Dynamic Fields */}
                    {role === 'supplier' ? (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Types of Waste Supplied (Hold Ctrl to select multiple)</label>
                            <select
                                multiple
                                name="wasteTypes"
                                className={styles.select}
                                onChange={(e) => handleMultiSelect(e, 'wasteTypes')}
                                style={{ height: '120px' }}
                                required
                            >
                                {wasteOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Waste Types of Interest (Hold Ctrl to select multiple)</label>
                            <select
                                multiple
                                name="interestTypes"
                                className={styles.select}
                                onChange={(e) => handleMultiSelect(e, 'interestTypes')}
                                style={{ height: '120px' }}
                                required
                            >
                                {wasteOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p className={styles.loginLink}>
                    Already have an account? <Link href="/login" className={styles.link}>Log In</Link>
                </p>
            </div>
        </div>
    );
}
