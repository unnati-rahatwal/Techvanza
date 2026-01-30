"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../../components/Input';
import Button from '../../components/Button';
import MultiSelect from '../../components/MultiSelect';
import styles from '../../styles/auth.module.css';

export default function Register() {
    const [role, setRole] = useState('supplier');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        location: '',
        coordinates: null,
        establishmentYear: '',
        wasteTypes: [], // For Supplier
        interestTypes: [] // For Buyer
    });

    useEffect(() => {
        // Redirect if already logged in
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsedUser = JSON.parse(user);
                router.push(`/dashboard/${parsedUser.role}`);
            } catch (e) {
                // Invalid user data, ignore
            }
        }
    }, [router]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleWasteTypeChange = (selected) => {
        setFormData({ ...formData, wasteTypes: selected });
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        setLocationLoading(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    coordinates: { lat: latitude, lng: longitude },
                    location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` // Temporary display
                }));
                setLocationLoading(false);
            },
            (error) => {
                console.error("Error getting location:", error);
                setLocationError('Unable to retrieve your location. Please enter manually.');
                setLocationLoading(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            // Transform data to match API expectation
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: role,
                location: formData.location,
                coordinates: formData.coordinates,
                establishmentYear: formData.establishmentYear,
                wasteTypes: role === 'supplier' ? formData.wasteTypes : undefined,
                interestTypes: role === 'buyer' ? formData.wasteTypes : undefined
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
                        className={`${styles.switchBtn} ${role === 'supplier' ? styles.active : ''}`}
                        onClick={() => setRole('supplier')}
                        type="button"
                    >
                        I'm a Supplier
                    </button>
                    <button
                        className={`${styles.switchBtn} ${role === 'buyer' ? styles.active : ''}`}
                        onClick={() => setRole('buyer')}
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

                        {/* Location Field with Geolocation */}
                        <div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        label="Location (City/Coordinates)"
                                        name="location"
                                        placeholder="e.g. Pune, Mumbai"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={getLocation}
                                    variant="secondary"
                                    style={{ marginBottom: '1rem', padding: '0.5rem' }}
                                    disabled={locationLoading}
                                >
                                    {locationLoading ? '...' : '📍'}
                                </Button>
                            </div>
                            {locationError && <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '-0.5rem' }}>{locationError}</p>}
                        </div>


                        <Input
                            label="Establishment Year"
                            name="establishmentYear"
                            type="number"
                            placeholder="e.g. 2015"
                            onChange={handleChange}
                            required
                        />

                        <MultiSelect
                            label={role === 'supplier' ? "Waste Types Supplied" : "Interested Waste Types"}
                            selected={formData.wasteTypes}
                            onChange={handleWasteTypeChange}
                            placeholder={role === 'supplier' ? "Select what you supply..." : "Select what you need..."}
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            onChange={handleChange}
                            required
                        />

                        <div style={{ marginTop: '1rem' }}>
                            {error && <p style={{ color: '#ff4d4d', marginBottom: '1rem' }}>{error}</p>}
                            <Button type="submit" variant="primary">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
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
