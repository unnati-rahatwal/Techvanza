"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../../components/Input';
import Button from '../../components/Button';
import MultiSelect from '../../components/MultiSelect';
import styles from '../../styles/auth.module.css';

export default function Register() {
    const [userType, setUserType] = useState('supplier');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        location: '',
        establishmentYear: '',
        wasteTypes: []
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWasteTypeChange = (selected) => {
        setFormData({ ...formData, wasteTypes: selected });
    };

    const router = useRouter(); // Initialize router
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Transform data to match API expectation
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone, // API expects 'mobile', need to check mapping
                password: formData.password,
                role: userType,
                location: formData.location,
                establishmentYear: formData.establishmentYear,
                wasteTypes: userType === 'supplier' ? formData.wasteTypes : undefined,
                interestTypes: userType === 'buyer' ? formData.wasteTypes : undefined
            };

            // Map phone to mobile if API expects mobile
            payload.mobile = formData.phone;

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            console.log("Registration successful", data);
            router.push('/login?registered=true'); // Redirect to login
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <h1 className={`${styles.authTitle} text-gradient`}>Join the Circle</h1>
                    <p className={styles.authSubtitle}>Create your account to start trading waste</p>
                </div>

                <div className={styles.userTypeSwitch}>
                    <button
                        className={`${styles.switchBtn} ${userType === 'supplier' ? styles.active : ''}`}
                        onClick={() => setUserType('supplier')}
                        type="button"
                    >
                        I'm a Supplier
                    </button>
                    <button
                        className={`${styles.switchBtn} ${userType === 'buyer' ? styles.active : ''}`}
                        onClick={() => setUserType('buyer')}
                        type="button"
                    >
                        I'm a Buyer
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <Input
                            label="Full Name / Company Name"
                            name="name"
                            placeholder="Enter name"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Mobile Number"
                            name="phone"
                            type="tel"
                            placeholder="Enter mobile number"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Location (City)"
                            name="location"
                            placeholder="e.g. Pune, Mumbai"
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Establishment Year"
                            name="establishmentYear"
                            type="number"
                            placeholder="e.g. 2015"
                            onChange={handleChange}
                            required
                        />

                        <MultiSelect
                            label={userType === 'supplier' ? "Waste Types Supplied" : "Interested Waste Types"}
                            selected={formData.wasteTypes}
                            onChange={handleWasteTypeChange}
                            placeholder={userType === 'supplier' ? "Select what you supply..." : "Select what you need..."}
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            onChange={handleChange}
                            required
                        />

                        <div style={{ marginTop: '1rem' }}>
                            <Button type="submit" variant="primary">
                                Create Account
                            </Button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        {error && <p style={{ color: '#ff4d4d', marginBottom: '1rem' }}>{error}</p>}
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                            Log In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
